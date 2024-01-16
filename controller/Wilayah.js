const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');


exports.getProvinsiByID = async (req, res) => {
    try {
        const provinsi = await prisma.reg_provinces.findUnique({
            where: {
                id: req.params.id
            }
        })

        if (provinsi) {
            res.json(response.successWithData(provinsi, 200))
        } else {
            res.json(response.errorWithData('Data provinsi tidak ditemukan', 400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getKabupatenByIdProv = async (req, res) => {
    try {
        const kabupaten = await prisma.reg_regencies.findMany({
            where: {
                province_id: req.params.id
            }
        })
        if (kabupaten) {
            res.json(response.successWithData(kabupaten, 200))
        } else {
            res.json(response.errorWithData('Data provinsi tidak ditemukan', 400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getKecamatanByIdKab = async (req, res) => {
    try {
        const kabupaten = await prisma.reg_districts.findMany({
            where: {
                regency_id: req.params.id
            }
        })
        if (kabupaten) {
            res.json(response.successWithData(kabupaten, 200))
        } else {
            res.json(response.errorWithData('Data provinsi tidak ditemukan', 400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getDesaByIdKecamatan = async (req, res) => {
    try {
        const desa = await prisma.reg_villages.findMany({
            where: {
                district_id: req.params.id
            }
        })
        if (desa) {
            res.json(response.successWithData(desa, 200))
        } else {
            res.json(response.errorWithData('Data provinsi tidak ditemukan', 400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}