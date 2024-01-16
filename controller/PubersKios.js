const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers')

exports.createUpdatePubersKios = async (req, res) => {
    try {
        const data = req.body
        if (data.adaData) {
            delete data.adaData
            data.updated_at = await sekarang()
            await prisma.pubers_kios.update({
                where: {
                    kode_kios: data.kode_kios
                },
                data: data
            })
        } else {
            const lastData = await prisma.pubers_kios.findMany({ orderBy: { kios_id: 'desc' } });
            delete data.adaData
            data.created_at = await sekarang()
            data.kios_id = Number(lastData[0].kios_id) + 1
            data.nik = req.params.nik
            await prisma.pubers_kios.create({ data: data })
        }
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getPuberKiosBynik = async (req, res) => {
    try {
        const query = await prisma.pubers_kios.findFirst({
            where: {
                nik: req.params.nik
            },
            include: { master_bank: true }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.kiosBelumAdaDistri = async (req, res) => {
    try {
        const key = req.query.key
        let query
        if (key !== 'null') {
            query = await prisma.$queryRawUnsafe(`
            SELECT
                * 
            FROM
                pubers_kios 
            WHERE
                kode_kios NOT IN ( SELECT kode_kios FROM pubers_kios_distributor WHERE kode_distributor = '${req.params.kodedistri}' ) 
                and nama_kios ILIKE '%${key}%' or kode_kios ILIKE '%${key}%'`
            )
        } else {
            query = await prisma.$queryRawUnsafe(`
            SELECT
                * 
            FROM
                pubers_kios 
            WHERE
                kode_kios NOT IN ( SELECT kode_kios FROM pubers_kios_distributor WHERE kode_distributor = '${req.params.kodedistri}' ) LIMIT 10`
            )
        }
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getPoktanbyKios = async (req, res) => {
    try {
        const nik = req.params.nik
        const data = await prisma.$queryRaw`
        SELECT * FROM v_kios_poktan WHERE (kode_kios = ${nik})`
        for (const d of data) {
            d.nama_kab = await prisma.reg_regencies.findFirst({
                where: {
                    id: d.id_kab
                }
            }).then((data) => data.name)
            d.nama_kec = await prisma.reg_districts.findFirst({
                where: {
                    id: d.id_kec
                }
            }).then((data) => data.name)
            d.nama_desa = await prisma.reg_villages.findFirst({
                where: {
                    id: d.id_desa
                }
            }).then((data) => data.name)
        }
        console.log(data);
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error(500))
    }
}

exports.getKios = async (req, res) => {
    try {
        const key = `${req.query.filter}`;
        const prov = `${req.query.prov}`;
        const kab = `${req.query.kab}`;
        const kec = `${req.query.kec}`;
        const desa = `${req.query.desa}`;
        const perpage = `${Number(req.query.perpage)}`;
        const page = `${Number(req.query.page)}`;
        await helpers.paginateKios(key, prov, kab, kec, desa, perpage, page, res)
        // const data = await prisma.pubers_kios.findMany()
        // res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error(500))
    }
}