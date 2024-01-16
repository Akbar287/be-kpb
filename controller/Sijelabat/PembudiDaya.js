const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");

//==================================PEMESANAN=========
exports.getDaftarProduk = async (req, res) => {
    try {
        const query = await prisma.$queryRaw` SELECT
                                                   mbkj.*,
                                                   mm.mm_id,
                                                   mm.mm_nama,
                                                   mm.mm_deskripsi,
                                                   mm.mm_img,
                                                   mm.mm_merk,
                                                   pu.*
                                               FROM
                                                   master_barang_kios_jelabat mbkj
                                                       JOIN
                                                   material_master mm ON mbkj.mm_id = mm.mm_id
                                                       JOIN
                                                   profil_usaha pu ON mbkj.profil_usaha_id = pu.profil_usaha_id
                                               WHERE
                                                   mbkj.status = true
                                                 AND mm.mm_nama ILIKE  ${'%' + req.query.search + '%'}
                                                   LIMIT
                                                   ${Number(req.query.perpage)}
                                               OFFSET
                                                   ${(Number(req.query.page) - 1) * Number(req.query.perpage)};
        `

        const countquery = await prisma.master_barang_kios_jelabat.count({
            where: {
                status: true
            }
        })

        let listProduk = [];
        for (let i = 0; i < query.length; i++) {
            const dataStok = await prisma.stok_pakan.findFirst({
                where: {
                    mm_id: query[i].mm_id,
                    profil_usaha_id: query[i].profil_usaha_id
                }
            })

            const dataHarga = await prisma.harga_jelabat.findFirst({
                where: {
                    mm_id: query[i].mm_id,
                    profil_usaha_id: query[i].profil_usaha_id
                }
            })
            const produk = {
                ...query[i],
                stok: dataStok,
                harga: dataHarga
            };
            listProduk.push(produk);
        }
        res.json(response.commonSuccessDataPaginate(listProduk, countquery, Number(req.query.page), Number(req.query.perpage)))

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getDetailProduk = async (req, res) => {
    try {

        const query = await prisma.master_barang_kios_jelabat.findFirst({
            where: {
                mm_id: Number(atob(req.params.idmm)),
                profil_usaha_id: Number(atob(req.params.idprofilusaha)),
                status: true,
            },
            include: {
                material_master: {
                    select: {
                        mm_id: true,
                        mm_nama: true,
                        mm_deskripsi: true,
                        mm_img: true,
                        mm_merk: true,
                        stok_pakan: {
                            where: {
                                mm_id: Number(atob(req.params.idmm)),
                                profil_usaha_id: Number(atob(req.params.idprofilusaha))
                            }
                        },
                        harga_jelabat: {
                            where: {
                                mm_id: Number(atob(req.params.idmm)),
                                profil_usaha_id: Number(atob(req.params.idprofilusaha))
                            }
                        }
                    }
                },
                profil_usaha: true
            }
        });

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.saveKeranjang = async (req, res) => {
    try {
        const data = req.body;
        data.profil_usaha_penyedia_id = Number(data.profil_usaha_penyedia_id);
        data.created_at = await sekarang();
        data.update_at = await sekarang();

        let querySuccess = true;
        const keranjang = await cekKeranjang(data.mm_id, data.member_id_pembeli, data.profil_usaha_penyedia_id);
        if (!keranjang) {
            try {
                await prisma.keranjang_sijelabat.create({
                    data: {
                        mm_id: data.mm_id,
                        profil_usaha_penyedia_id: data.profil_usaha_penyedia_id,
                        quantity: 1,
                        member_id_pembeli: data.member_id_pembeli,
                        created_at: data.created_at,
                        update_at: data.update_at
                    }
                });
            } catch (error) {
                querySuccess = false;
                console.error(`Error saat menambahkan ke keranjang: ${error.message}`);
            }
        }

        res.json(querySuccess ? response.success(200) : response.errorWithData('Input data gagal', 400));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.json(response.error(500));
    }
};

exports.getProdukByID = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember));
        const query = await prisma.keranjang_sijelabat.findMany({
            where: {
                member_id_pembeli: idmember
            },
            include: {
                material_master: true,
                profil_usaha: true
            }
        });

        let listKeranjang = []
        for (let i = 0; i < query.length; i++) {
            const datastok = await prisma.stok_pakan.findFirst({
                where: {
                    mm_id: query[i].mm,
                    profil_usaha_id: query[i].profil_usaha_penyedia_id
                }
            })

            const dataharga = await prisma.harga_jelabat.findFirst({
                where: {
                    mm_id: query[i].mm,
                    profil_usaha_id: query[i].profil_usaha_penyedia_id
                }
            })

            const datakeranjang = {
                ...query[i],
                harga: dataharga,
                stok: datastok
            }

            listKeranjang.push(datakeranjang)
        }

        return res.json(query ? response.successWithData(listKeranjang, 200) : response.errorWithData('Get Data Gagal', 400));
    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.updateQuantityKeranjang = async (req, res) => {
    try {
        const data = req.body
        let query
        for (let i = 0; i < data.length; i++) {
            query = await prisma.keranjang_sijelabat.update({
                where: {
                    keranjang_id: data[i].keranjang_id
                },
                data: {
                    quantity: Number(data[i].quantity)
                }
            })
        }
        res.json(query ? response.success(200) : response.errorWithData('Hapus data gagal', 400));

    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.saveCheckout = async (req, res) => {
    try {
        const data = req.body
        const currentTime = await sekarang();

        for (let i = 0; i < data.length; i++) {
            const queryorder = await prisma.order_sijelabat.create({
                data: {
                    member_id_pembeli: data[i].member_id_pembeli,
                    role_pembeli: Number(data[i].role_pembeli),
                    profil_usaha_penyedia_id: Number(data[i].profil_usaha_penyedia_id),
                    nomor_transaksi: data[i].nomor_transaksi,
                    kode_order_status: 1,
                    notes: data[i].notes,
                    created_at: currentTime,
                    update_at: currentTime,
                    layanan_id_pembeli: Number(data[i].layanan_id_pembeli)
                }
            })
            const pesanan = data[i].barang
            if (queryorder) {
                for (let i = 0; i < pesanan.length; i++) {
                    const cekHarga = await getHarga(pesanan[i].harga.harga_id, Number(pesanan[i].harga.harga))
                    await prisma.order_mm_jelabat.create({
                        data: {
                            order_id: queryorder.order_id,
                            quantity: Number(pesanan[i].quantity),
                            harga_id: Number(cekHarga.harga_riwayat_id),
                            mm_id: pesanan[i].mm_id
                        }
                    })

                    await prisma.keranjang_sijelabat.delete({
                        where: {
                            keranjang_id: pesanan[i].keranjang_id
                        }
                    })

                }
            }

            await prisma.order_status_riwayat_sijelabat.create({
                data: {
                    order_id: queryorder.order_id,
                    order_status_id: 1,
                    created_at: currentTime
                }
            })
        }

        res.json(response.success(200));

    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.getAlamat = async (req, res) => {
    try {
        const query = await prisma.order_alamat_sijelabat.findMany({
            where: {
                member_id: Number(atob(req.params.idmember)),
                layanan_id: Number(atob(req.params.idlayanan))
            },
            include: {
                member: {
                    select: {
                        ktp: true
                    }
                },
                reg_provinces: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_regencies: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_districts: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_villages: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.saveAlamat = async (req, res) => {
    try {
        const alamat = req.body
        alamat.created_at = await sekarang()
        alamat.update_at = await sekarang()

        const query = await prisma.order_alamat_sijelabat.create({
            data: alamat
        });

        res.json(query ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }

}


exports.saveUpdateAlamat = async (req, res) => {
    try {
        const id = Number(atob(req.params.idalamat))
        const alamat = req.body
        alamat.update_at = await sekarang()

        const query = await prisma.order_alamat_sijelabat.update({
            where: {
                id_alamat: id
            },
            data: {
                prov_id: alamat.prov_id,
                kab_id: alamat.kab_id,
                kec_id: alamat.kec_id,
                desa_id: alamat.desa_id,
                alamat_lengkap: alamat.alamat_lengkap,
                update_at: alamat.update_at,
                kontak: alamat.kontak
            }
        });

        res.json(query ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        res.json(response.error(500))
    }

}

exports.getSummaryTransaksi = async (req, res) => {
    try {
        const counts = await prisma.order_sijelabat.groupBy({
            by: ['kode_order_status'],
            _count: {
                order_id: true
            },
            where: {
                member_id_pembeli: Number(atob(req.params.idmember)),
                layanan_id_pembeli: Number(atob(req.params.idlayanan))
            }
        });

        const result = {
            verifPemesanan: counts.find(item => item.kode_order_status === 1)?._count.order_id || 0,
            verifPembayaran: (counts.find(item => item.kode_order_status === 3)?._count.order_id || 0) +
                (counts.find(item => item.kode_order_status === 4)?._count.order_id || 0),
            pengiriman: (counts.find(item => item.kode_order_status === 6)?._count.order_id || 0) +
                (counts.find(item => item.kode_order_status === 7)?._count.order_id || 0), // Menggabungkan status 5 dan 6
            selesai: counts.find(item => item.kode_order_status === 8)?._count.order_id || 0,
            dibatalkan: counts.find(item => item.kode_order_status === 9)?._count.order_id || 0,
        };

        res.json(result ? response.successWithData(result, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}
exports.getRiwayatPemesanan = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idlayanan = Number(atob(req.params.idlayanan))
        const data = req.body
        const query = await prisma.order_sijelabat.findMany({
            where: {
                member_id_pembeli: idmember,
                layanan_id_pembeli: idlayanan,
                kode_order_status: {
                    in: data.status
                }
            },
            include: {
                profil_usaha: true,
                order_status_sijelabat: true
            }
        })
        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.getDetailRiwayatPemesanan = async (req, res) => {
    try {
        const idorder = Number(atob(req.params.idorder))
        const query = await prisma.order_sijelabat.findUnique({
            where: {
                order_id: idorder
            },
            include: {
                profil_usaha: {
                    select: {
                        rekening_bank_usaha: {
                            select: {
                                nomor_rekening: true,
                                atas_nama: true,
                                master_bank: {
                                    select: {
                                        nama_bank: true
                                    }
                                }
                            }
                        }
                    }
                },
                order_status_sijelabat: {
                    select: {
                        order_status_id: true,
                        nama_status: true
                    }
                },
                order_status_riwayat_sijelabat: {
                    select: {
                        created_at: true,
                        order_status_sijelabat: {
                            select: {
                                nama_status: true,
                                deskripsi: true
                            }
                        }
                    }
                },
                order_mm_jelabat: {
                    select: {
                        order_mm_id: true,
                        quantity: true,
                        harga_riwayat_jelabat: true,
                        material_master: true
                    }
                }
            }
        })
        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }

}

exports.uploadBuktiBayar = async (req, res) => {
    try {
        const idorder = Number(atob(req.params.idorder))
        const data = JSON.parse(req.body.data);
        const currentTime = await sekarang();
        const bukti_bayar = req.file ? req.file.filename : null

        const queryorder = await prisma.order_sijelabat.update({
            where: {
                order_id: idorder
            },
            data: {
                kode_order_status: 4,
                nominal_bayar: data.nominal_bayar,
                metode_pembayaran: data.metode_pembayaran,
                bukti_bayar: bukti_bayar,
                update_at: currentTime
            }
        })

        if (queryorder) {

            const statusRiwayat = await prisma.order_status_riwayat_sijelabat.createMany({
                data: {
                    order_id: idorder,
                    order_status_id: 4,
                    created_at: currentTime,
                }
            });

            res.json(statusRiwayat ? response.success(200) : response.errorWithData('Input data gagal', 400));
        } else {
            res.json(response.errorWithData('Verifikasi Data Gagal', 400));
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}


//-=========================FUNCTION==================

const cekKeranjang = async (idmm, idmember, idpenyedia) => {
    const keranjang = await prisma.keranjang_sijelabat.findFirst({ where: { mm_id: idmm, profil_usaha_penyedia_id: idpenyedia, member_id_pembeli: idmember } });
    return keranjang;
};

const getHarga = async (hargaid, harga) => {
    const hargacek = await prisma.harga_riwayat_jelabat.findFirst({
        where: {
            harga_id: hargaid,
            harga: harga
        }
    })
    return hargacek
}