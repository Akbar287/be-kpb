const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.postBarang = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.master_barang_kios.create({
            data: data
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Gagal input data', 403))
        }
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getDataBarangKios = async (req, res) => {
    try {
        const query = await prisma.master_barang_kios.findMany({
            where: {
                id_member: Number(req.params.id)
            },
            include: {
                master_barang_distri: {
                    include: {
                        member: {
                            include: {
                                ktp: true
                            }
                        },
                        master_barang_pabrik: {
                            include: {
                                member: {
                                    include: {
                                        ktp: true
                                    }
                                },
                                material_master: {
                                    include: {
                                        child_dtl_kategori: {
                                            include: {
                                                detail_kategori: {
                                                    include: {
                                                        kategori_master: {
                                                            include: {
                                                                master_sektor: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllDataBarangKios = async (req, res) => {
    try {
        const count = await prisma.master_barang_kios.count({})
        const query = await prisma.master_barang_kios.findMany({
            skip: (Number(req.query.page) - 1) * Number(req.query.perpage),
            take: Number(req.query.perpage),
            orderBy: {
                id: 'asc',
            },
            include: {
                master_barang_distri: {
                    include: {
                        member: {
                            include: {
                                ktp: true
                            }
                        },
                        master_barang_pabrik: {
                            include: {
                                member: {
                                    include: {
                                        ktp: true
                                    }
                                },
                                material_master: {
                                    include: {
                                        child_dtl_kategori: {
                                            include: {
                                                detail_kategori: {
                                                    include: {
                                                        kategori_master: {
                                                            include: {
                                                                master_sektor: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        res.json(response.commonSuccessDataPaginate(query, count, Number(req.query.page), Number(req.query.perpage), ''))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}