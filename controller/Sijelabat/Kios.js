const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");

//====================================================List Katalog================================

exports.getListKatalog = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idlayanan = Number(atob(req.params.idlayanan))
        const usaha = await findProfilUsaha(idmember, idlayanan);
        if (usaha) {
            const query = await prisma.material_master.findMany({
                where: {
                    master_barang_kios_jelabat: {
                        some: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        }
                    }
                },
                include: {
                    child_dtl_kategori: {
                        select: {
                            child_dtlk_id: true,
                            child_dtlk_nama: true,
                            detail_kategori: {
                                select: {
                                    dtlk_id: true,
                                    dtlk_nama: true,
                                    kategori_master: {
                                        select: {
                                            kategori_id: true,
                                            kategori_nama: true,
                                            master_sektor: {
                                                select: {
                                                    id: true,
                                                    sektor: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    harga_jelabat: {
                        where: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        },
                        select: {
                            harga: true
                        }
                    },
                    stok_pakan: {
                        where: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        },
                        select: {
                            stok: true
                        }
                    },
                    master_barang_kios_jelabat: {
                        where: {
                            profil_usaha_id: Number(usaha.profil_usaha_id)
                        }
                    }
                }
            })

            res.json(query ? response.successWithData([query, usaha], 200) : response.errorWithData('Get Data Gagal', 400));

        } else {
            res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verivikasi Admin', 507))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getListProfilUsaha = async (req, res) => {
    try {
        const pu = await prisma.master_barang_distributor_jelabat.findMany({
            include: {
                profil_usaha: true
            },
            distinct: ['profil_usaha_id'],
        })

        res.json(pu ? response.successWithData(pu, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getListMMByIDUsaha = async (req, res) => {
    try {
        const profilusaha = Number(atob(req.params.idprofilusaha))
        const query = await prisma.material_master.findMany({
            where: {
                master_barang_distributor_jelabat: {
                    some: {
                        profil_usaha_id: profilusaha
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

exports.saveInsertListKatalog = async (req, res) => {
    try {
        const data = req.body;
        const currentTime = await sekarang();

        const cek = await cekKatalog(data.mm_id, data.profil_usaha_id)
        if (cek) {
            res.json(response.errorWithData('Katalog Sudah Ada, Silahkan Sesuaikan Stok dan harga', 400))
        } else {
            const commonData = {
                mm_id: data.mm_id,
                profil_usaha_id: data.profil_usaha_id,
            }

            const querypabrik = await prisma.master_barang_kios_jelabat.create({
                data: {
                    ...commonData,
                    master_barang_distributor_id: data.master_distributor,
                    keterangan: data.keterangan,
                    status: true
                }
            });

            const queryharga = await prisma.harga_jelabat.create({
                data: {
                    ...commonData,
                    harga: data.harga,
                    created_at: currentTime,
                    update_at: currentTime
                }
            });

            const queryriwayatharga = await prisma.harga_riwayat_jelabat.create({
                data: {
                    harga_id: queryharga.harga_id,
                    harga: Number(data.harga),
                    created_at: currentTime
                }
            });

            const querystok = await prisma.stok_pakan.create({
                data: {
                    ...commonData,
                    stok: Number(data.stok),
                }
            });

            const success = querypabrik && queryharga && queryriwayatharga && querystok;
            res.json(success ? response.success(200) : response.errorWithData('Input data gagal', 400));
        }
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.saveUpdateListKatalog = async (req, res) => {
    try {

        const data = req.body
        const currentTime = await sekarang()
        const idmm = Number(atob(req.params.idmm))

        console.log(data)

        const querypabrik = await prisma.master_barang_kios_jelabat.updateMany({
            where: {
                mm_id: idmm,
            },
            data: {
                keterangan: data.keterangan,
            }
        });

        const querystok = await prisma.stok_pakan.updateMany({
            where: {
                mm_id: idmm,
                profil_usaha_id: data.profil_usaha_id,
            },
            data: {
                stok: Number(data.stok),
            }
        });

        if (data.ubahHarga) {
            const queryharga = await prisma.harga_jelabat.updateMany({
                where: {
                    mm_id: idmm,
                    profil_usaha_id: data.profil_usaha_id,
                },
                data: {
                    harga: data.harga,
                    update_at: currentTime
                }
            })

            const updatedHargaRecords = await prisma.harga_jelabat.findMany({
                where: {
                    mm_id: idmm,
                    profil_usaha_id: data.profil_usaha_id,
                }
            })

            for (const hargaRecord of updatedHargaRecords) {
                await prisma.harga_riwayat_jelabat.create({
                    data: {
                        harga_id: hargaRecord.harga_id,
                        harga: Number(data.harga),
                        created_at: currentTime
                    }
                })
            }
        }

        const success = querypabrik && querystok;
        res.json(success ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.saveUpdateStatusListKatalog = async (req, res) => {
    try {
        const idmm = Number(atob(req.params.idmm))
        const data = req.body
        const querymm = await prisma.master_barang_kios_jelabat.updateMany({
            where: {
                mm_id: idmm
            },
            data: {
                status: data.status,
            }
        });

        res.json(querymm ? response.success(200) : response.errorWithData('Input data gagal', 400));

    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

//=====================================Pemesanan====================================

exports.getDaftarPenyedia = async (req, res) => {
    try {
        const pu = await prisma.master_barang_distributor_jelabat.findMany({
            where: {
                profil_usaha: {
                    status: true
                }
            },
            include: {
                profil_usaha: true
            },
            distinct: ['profil_usaha_id'],
        })

        let listPenyedia = []
        for (let i = 0; i < pu.length; i++) {
            const barang = await prisma.material_master.findMany({
                where: {
                    master_barang_distributor_jelabat: {
                        some: {
                            profil_usaha_id: pu[i].profil_usaha_id
                        }
                    }
                }
            })

            const usaha = {
                ...pu[i],
                totalmm: barang.length
            }

            listPenyedia.push(usaha)
        }

        res.json(listPenyedia ? response.successWithData(listPenyedia, 200) : response.errorWithData('Get Data Gagal', 400));
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.getDaftarProdukByPenyedia = async (req, res) => {
    try {
        const profilusaha = Number(atob(req.params.idprofilusaha))
        const query = await prisma.material_master.findMany({
            where: {
                master_barang_distributor_jelabat: {
                    some: {
                        profil_usaha_id: profilusaha,
                        status: true
                    }
                }
            },
            include: {
                stok_pakan: {
                    where: {
                        profil_usaha_id: profilusaha
                    }
                },
                harga_jelabat: {
                    where: {
                        profil_usaha_id: profilusaha
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

exports.getRiwayatPemesanan = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idRole = Number(atob(req.params.idrole))
        const idlayanan = Number(atob(req.params.idlayanan))
        const usaha = await findProfilUsaha(idmember, idlayanan);

        if (usaha) {
            const query = await prisma.order_sijelabat.findMany({
                where: {
                    member_id_pembeli: idmember,
                    role_pembeli: idRole
                },
                include: {
                    profil_usaha: true,
                    order_status_sijelabat: true
                }
            })
            res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

        } else {
            res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verivikasi Admin', 507))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
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


//============================================TRANSAKSI KE DISTRIBUTOR=========================

exports.getListTransaksi = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idlayanan = Number(atob(req.params.idlayanan))
        const usaha = await findProfilUsaha(idmember, idlayanan);
        const data = req.body
        if (usaha) {
            const query = await prisma.order_sijelabat.findMany({
                where: {
                    profil_usaha_penyedia_id: usaha.profil_usaha_id,
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

        } else {
            res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verivikasi Admin', 507))
        }
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.getSummaryTransaksi = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember))
        const idlayanan = Number(atob(req.params.idlayanan))
        const usaha = await findProfilUsaha(idmember, idlayanan);
        if (usaha) {
            const counts = await prisma.order_sijelabat.groupBy({
                by: ['kode_order_status'],
                _count: {
                    order_id: true
                },
                where: {
                    profil_usaha_penyedia_id: Number(usaha.profil_usaha_id)
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

        } else {
            res.json(response.errorWithData('Get Data Gagal', 400))
        }
    } catch (error) {
        console.error(error);
        res.json(response.error(500));
    }
}

exports.getDetailTransaksi = async (req, res) => {
    try {
        const idorder = Number(atob(req.params.idorder))
        const query = await prisma.order_sijelabat.findUnique({
            where: {
                order_id: idorder
            },
            include: {
                profil_usaha: true,
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

exports.konfirmasiPemesanan = async (req, res) => {
    try {
        const idorder = Number(atob(req.params.idorder))
        const currentTime = await sekarang();
        const data = req.body
        data.update_at = currentTime

        const queryorder = await prisma.order_sijelabat.update({
            where: {
                order_id: idorder
            },
            data: data
        })

        if (queryorder) {
            const statusData = [];
            if (data.kode_order_status === 9) {
                statusData.push({ order_status_id: data.kode_order_status });
            } else {
                statusData.push({ order_status_id: 2 }, { order_status_id: 3 });
            }

            const statusRiwayat = await prisma.order_status_riwayat_sijelabat.createMany({
                data: statusData.map(item => ({
                    order_id: idorder,
                    ...item,
                    created_at: currentTime,
                })),
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

exports.konfirmasiPembayaran = async (req, res) => {
    try {
        const idorder = Number(atob(req.params.idorder))
        const currentTime = await sekarang();
        const data = req.body
        data.update_at = currentTime

        const queryorder = await prisma.order_sijelabat.update({
            where: {
                order_id: idorder
            },
            data: {
                kode_order_status: data.kode_order_status,
                feedback_penjual: data.feedback_penjual,
                update_at: data.update_at
            }
        })

        if (queryorder) {
            const statusData = [];
            if (data.kode_order_status === 3) {
                const deleteRiwayat = await prisma.order_status_riwayat_sijelabat.deleteMany({
                    where: {
                        order_id: idorder,
                        order_status_id: 4
                    }
                });
                res.json(deleteRiwayat ? response.success(200) : response.errorWithData('Kesalahan Kelola Log', 400));
            } else {
                statusData.push({ order_status_id: 5 }, { order_status_id: 6 });
                const statusRiwayat = await prisma.order_status_riwayat_sijelabat.createMany({
                    data: statusData.map(item => ({
                        order_id: idorder,
                        ...item,
                        created_at: currentTime,
                    })),
                });

                if (statusRiwayat) {
                    let updateStok
                    for (let i = 0; i < data.order_mm_jelabat.length; i++) {
                        const stok = await findStok(data.order_mm_jelabat[i].material_master.mm_id, data.profil_usaha_id);
                        const sisaStok = Number(stok.stok - data.order_mm_jelabat[i].quantity)
                        updateStok = await prisma.stok_pakan.updateMany({
                            where: {
                                mm_id: data.order_mm_jelabat[i].material_master.mm_id,
                                profil_usaha_id: data.profil_usaha_id
                            },
                            data: {
                                stok: sisaStok
                            }
                        })
                    }

                    res.json(updateStok ? response.success(200) : response.errorWithData('Input data gagal', 400));
                } else {
                    res.json(response.errorWithData('Kurangi Stok Gagal', 400));
                }
            }
        } else {
            res.json(response.errorWithData('Verifikasi Data Gagal', 400));
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

//===========KERJASAMA========
exports.getRelasi = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember));
        const idlayanan = Number(atob(req.params.idlayanan));
        const usaha = await findProfilUsaha(idmember, idlayanan);

        if (!usaha) {
            return res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verifikasi Admin', 507));
        }

        const query2 = await prisma.order_sijelabat.groupBy({
            by: ['layanan_id_pembeli'],
            _count: {
                order_id: true
            },
            where: {
                member_id_pembeli: idmember,
            }
        });

        let listRelasi2 = []
        for (let i = 0; i < query2.length; i++) {
            const pu = await prisma.profil_usaha.findFirst({
                where: {
                    member_id: query2[i].member_id_pembeli,
                    layanan_id: query2[i].layanan_id_pembeli
                },
                include: {
                    layanan: true
                }
            })

            const relasi = {
                ...query2[i],
                dataRelasi: pu
            }

            listRelasi2.push(relasi)
        }

        res.json(response.successWithData(listRelasi2, 200));


    } catch (error) {
        console.log(error);
        res.json(response.error(500));
    }
}

exports.getDetailRelasi = async (req, res) => {
    try {
        const query = await prisma.profil_usaha.findUnique({
            where: {
                profil_usaha_id: Number(atob(req.params.profilusahaid))
            },
            include: {
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
                },
                rekening_bank_usaha: {
                    select: {
                        nomor_rekening: true,
                        atas_nama: true,
                        master_bank: {
                            select: {
                                id: true,
                                nama_bank: true
                            }
                        }
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

//======================================Function=============================

const cekKatalog = async (idmm, idpu) => {
    const katalog = await prisma.master_barang_kios_jelabat.findFirst({ where: { mm_id: idmm, profil_usaha_id: idpu } });
    return katalog;
}

const findStok = async (idmm, idpu) => {
    const stok = await prisma.stok_pakan.findFirst({ where: { mm_id: idmm, profil_usaha_id: idpu } });
    return stok;
}
const findProfilUsaha = async (idmember, idlayanan) => {
    const usaha = await prisma.profil_usaha.findFirst({ where: { member_id: idmember, layanan_id: idlayanan, verifikasi_admin: true } });
    return usaha;
};