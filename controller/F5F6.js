const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers')


exports.getListPupuk = async (req, res) => {
    try {
        const data = await prisma.pubers_pupuk.findMany()
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.insertDataF5F6 = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        data.created_at = await sekarang()
        await prisma.pubers_f5_f6.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getF5f6 = async (req, res) => {
    try {
        const data = await prisma.pubers_f5_f6.findMany({
            include: {
                pubers_distributor: true,
                pubers_kios: true,
                pubers_pupuk: true
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.editDataF5F6 = async (req, res) => {
    try {
        const data = req.body
        data.updated_at = await sekarang()
        await prisma.pubers_f5_f6.update({ where: { id: Number(req.params.id) }, data: data })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getf6 = async (req, res) => {
    try {
        let newData = []
        const data = await prisma.pubers_f5_f6.findMany({
            where: {
                bulan: Number(req.params.bulan),
                tahun: Number(req.params.tahun),
                kode_distributor: req.params.kode_distributor,
                kode_kios: req.params.kodekios
            },
            include: {
                pubers_distributor: {
                    include: {
                        member: {
                            include: {
                                reg_provinces: true,
                                reg_districts: true,
                                reg_regencies: true,
                                reg_villages: true
                            }
                        }

                    }
                },
                pubers_kios: true,
                pubers_pupuk: true
            }
        })
        for (let i = 0; i < data.length; i++) {
            let penyaluran = 0
            if (Number(data[i].idbarang) === 1) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalUrea: true,
                    },
                })
                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalUrea })
            } if (Number(data[i].idbarang) === 2) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalNpk: true,
                    },
                })

                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalNpk })
            } if (Number(data[i].idbarang) === 3) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalNpkFk: true,
                    },
                })
                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalNpkFk })
            }
        }

        res.json(response.successWithData(newData, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getf5 = async (req, res) => {
    try {
        let newData = []
        const data = await prisma.pubers_f5_f6.findMany({
            where: {
                bulan: Number(req.params.bulan),
                tahun: Number(req.params.tahun),
                kode_distributor: req.params.kode_distributor
            },
            include: {
                pubers_distributor: {
                    include: {
                        member: {
                            include: {
                                reg_provinces: true,
                                reg_districts: true,
                                reg_regencies: true,
                                reg_villages: true
                            }
                        }

                    }
                },
                pubers_kios: true,
                pubers_pupuk: true
            }
        })
        for (let i = 0; i < data.length; i++) {
            let penyaluran = 0
            if (Number(data[i].idbarang) === 1) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalUrea: true,
                    },
                })
                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalUrea })
            } if (Number(data[i].idbarang) === 2) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalNpk: true,
                    },
                })

                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalNpk })
            } if (Number(data[i].idbarang) === 3) {
                penyaluran = await prisma.pubers_master_transaksi.aggregate({
                    where: { kode_kios: data[i].kode_kios }, _sum: {
                        totalNpkFk: true,
                    },
                })
                newData.push({ ...data[i], penyaluran: penyaluran._sum.totalNpkFk })
            }
        }

        res.json(response.successWithData(newData, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}