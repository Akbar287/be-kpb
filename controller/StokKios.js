const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.createData = async (req, res) => {
    try {
        const data = req.body
        const findId = await prisma.pubers_kios.findFirst({ where: { nik: req.params.nik } })
        if (!findId) return res.json(response.errorWithData('Kios belum disetting', 400))
        const query = await prisma.pubers_stokkios.findFirst({
            where: {
                kode_kios: findId.kode_kios
            }
        })
        data.kode_kios = findId.kode_kios
        if (query) {
            await prisma.pubers_stokkios.update({
                where: {
                    stok_id: query.stok_id
                },
                data: {
                    UREA: Number(data.UREA) + Number(query.UREA),
                    NPK: Number(data.NPK) + Number(query.NPK),
                    NPKFK: Number(data.NPKFK) + Number(query.NPKFK)
                }
            })
        } else {
            await prisma.pubers_stokkios.create({ data: data })
        }
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getStokKiosByKios = async (req, res) => {
    try {
        const findId = await prisma.pubers_kios.findFirst({ where: { nik: req.params.nik } })
        if (!findId) return res.json(response.errorWithData('Kios belum disetting', 400))
        const query = await prisma.pubers_stokkios.findMany({
            where: {
                kode_kios: findId.kode_kios
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}