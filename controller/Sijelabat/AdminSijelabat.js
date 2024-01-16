const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");


exports.getSummaryDataDashborad = async (req, res) => {
    try {

        const result = await prisma.profil_usaha.groupBy({
            by: ['kode_usaha'],
            _count: true,
            where: {
                OR: [
                    { kode_usaha: { startsWith: 'PUKS', mode: 'insensitive' } },
                    { kode_usaha: { startsWith: 'PUBB', mode: 'insensitive' } },
                    { kode_usaha: { startsWith: 'PUPN', mode: 'insensitive' } },
                    { kode_usaha: { startsWith: 'PUDR', mode: 'insensitive' } },
                ],
            },
        });

        const formattedResult = {
            PUBB: 0,
            PUPN: 0,
            PUDR: 0,
            PUKS: 0,
        };

        result.forEach((group) => {
            const kodeUsaha = group.kode_usaha;
            const count = group._count;

            if (kodeUsaha.startsWith('PUBB')) {
                formattedResult.PUBB += count;
            } else if (kodeUsaha.startsWith('PUPN')) {
                formattedResult.PUPN += count;
            } else if (kodeUsaha.startsWith('PUDR')) {
                formattedResult.PUDR += count;
            } else if (kodeUsaha.startsWith('PUKS')) {
                formattedResult.PUKS += count;
            }
        });
        res.json(result ? response.successWithData(formattedResult, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}


exports.getPUWaitingVerif = async (req, res) => {
    try {

        const query = await prisma.profil_usaha.findMany({
            where: {
                verifikasi_admin: false
            },
            include: {
                layanan: true
            }
        })

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.deletePU = async (req, res) => {
    try {
        const deletePU = await prisma.profil_usaha.delete({
            where: {
                profil_usaha_id: Number(atob(req.params.profilusahaid))
            },
        })

        res.json(deletePU ? response.success(200) : response.errorWithData('Hapus data gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getPUVerifikasi = async (req, res) => {
    try {

        const query = await prisma.profil_usaha.findMany({
            where: {
                verifikasi_admin: true
            },
            include: {
                layanan: true
            }
        })

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getDetailPU = async (req, res) => {
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
                },
                layanan: true,
                member: {
                    select: {
                        ktp: true
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

exports.saveUpdateProfilUsaha = async (req, res) => {
    try {
        const id = Number(atob(req.params.profilusahaid))
        const usaha = req.body
        usaha.update_at = await sekarang()

        const usahaquery = await prisma.profil_usaha.update({
            where: {
                profil_usaha_id: id
            },
            data: {
                status: usaha.status,
                verifikasi_admin: usaha.verifikasi_admin,
                update_at: usaha.update_at
            }
        });

        res.json(usahaquery ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        res.json(response.error(500))
    }

}


exports.getTransaksi = async (req, res) => {
    try {
        const data = req.body
        const str = req.body.tanggalDari;
        const [year, month, day] = str.split('/');
        const datemulai = new Date(+year, +month - 1, +day + 1);

        const str2 = req.body.tanggalSampai;
        const [year2, month2, day2] = str2.split('/');
        const dateakhir = new Date(+year2, +month2 - 1, +day2 + 1);

        const query = await prisma.order_sijelabat.findMany({
            where: {
                profil_usaha: {
                    kode_usaha: { startsWith: data.role, mode: 'insensitive' }
                },
                kode_order_status: {
                    in: data.status
                },
                created_at: {
                    gte: datemulai,
                    lte: dateakhir,
                }
            },
            include: {
                profil_usaha: true,
                order_status_sijelabat: true,
                order_mm_jelabat: {
                    select: {
                        order_mm_id: true,
                        order_id: true,
                        quantity: true,
                        mm_id: true,
                        harga_id: true,
                        harga_riwayat_jelabat: {
                            select: {
                                harga: true
                            }
                        },
                        material_master: {
                            select: {
                                mm_id: true,
                                mm_nama: true,
                                child_dtl_kategori: {
                                    select: {
                                        child_dtlk_id: true,
                                        child_dtlk_nama: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        let listTransaksi = []
        for (let i = 0; i < query.length; i++) {
            if (data.role === 'PUKS') {
                const pembeli = await prisma.member.findUnique({
                    where: {
                        id_member: query[i].member_id_pembeli
                    },
                    include: {
                        ktp: {
                            select: {
                                nama: true
                            }
                        }
                    }
                })
                Object.assign(query[i], {
                    ...query[i],
                    pembeli: 'Pembudi Daya a.n. ' + pembeli.ktp.nama,
                })
                listTransaksi.push(query[i])

            } else {
                const pembeli = await prisma.profil_usaha.findFirst({
                    where: {
                        member_id: query[i].member_id_pembeli,
                        layanan_id: query[i].layanan_id_pembeli
                    }
                })

                Object.assign(query[i], {
                    ...query[i],
                    pembeli: pembeli.nama_usaha,
                })
                listTransaksi.push(query[i])
            }
        }

        res.json(query ? response.successWithData(listTransaksi, 200) : response.errorWithData('Get Data Gagal', 400));

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