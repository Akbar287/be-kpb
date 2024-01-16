const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.postBarang = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.master_barang_distri.create({
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

exports.getDataBarangDistri = async (req, res) => {
    try {
        const query = await prisma.master_barang_distri.findMany({
            where: {
                id_member: Number(req.params.id)
            },
            include: {
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
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.updateBarangDistri = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.master_barang_distri.update({
            where: {
                id: Number(req.params.id)
            },
            data: data
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.deleteBarangDistri = async (req, res) => {
    try {
        const query = await prisma.master_barang_distri.delete({
            where: {
                id: Number(req.params.id)
            }
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllDataBarangDistri = async (req, res) => {
    try {
        const count = await prisma.master_barang_distri.count({})
        const query = await prisma.master_barang_distri.findMany({
            skip: (Number(req.query.page) - 1) * Number(req.query.perpage),
            take: Number(req.query.perpage),
            orderBy: {
                id: 'asc',
            },
            include: {
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
                },
                member: {
                    include: {
                        reg_districts: true,
                        reg_provinces: true,
                        reg_regencies: true,
                        reg_villages: true,
                        ktp: true
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