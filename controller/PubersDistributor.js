const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers')

exports.updateDistributor = async (req, res) => {
    try {
        const data = req.body
        console.log(data);
        const adaDistri = await prisma.pubers_distributor.findUnique({ where: { nik: data.nik } })
        if (adaDistri) {
            //UPDATE
            data.updated_at = await sekarang()
            await prisma.pubers_distributor.update({ where: { nik: data.nik }, data: data })
        } else {
            //CREATED
            data.created_at = await sekarang()
            await prisma.pubers_distributor.create({ data: data })
        }
        res.json(response.successData('Berhasil Edit Distributor', 201))
    } catch (error) {
        console.log(error);
        res.json(response.error(500))
    }
}

exports.getDistributorByNik = async (req, res) => {
    try {
        const query = await prisma.pubers_distributor.findUnique({ where: { nik: req.params.nik } })
        res.json(response.successWithData(query, 201))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalan pada server', 200))
    }
}

exports.getDistributor = async (req, res) => {
    try {
        const query = await prisma.pubers_distributor.findMany()
        res.json(response.successWithData(query, 201))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalan pada server', 200))
    }
}

exports.listKiosDistributor = async (req, res) => {
    try {
        const findId = await prisma.pubers_distributor.findFirst({ where: { nik: req.params.nik } })
        if (!findId) return res.json(response.errorWithData('Kios belum disetting', 400))
        console.log(findId.kode_distributor)
        const query = await prisma.pubers_kios_distributor.findMany({
            where: {
                kode_distributor: findId.kode_distributor
            },
            include: {
                pubers_kios: {
                    include: {
                        member: {
                            include: {
                                reg_villages: true,
                                reg_districts: true,
                                reg_regencies: true
                            }
                        }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.inputDistriKios = async (req, res) => {
    try {
        console.log(req.body)
        const query = await prisma.pubers_kios_distributor.create({ data: req.body })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getDistributorByNikKios = async (req, res) => {
    try {
        const kios = await prisma.pubers_kios.findFirst({
            where: {
                nik: req.params.nik
            },
            include: {
                pubers_kios_distributor: {
                    include: {
                        pubers_distributor: true,
                        pubers_kios: true
                    }
                }
            }
        })

        res.json(response.successWithData(kios, 200))

    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}