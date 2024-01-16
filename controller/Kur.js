const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers');

exports.getPeminjaman = async (req, res) => {
    try {
        const count = await prisma.tb_historypinjaman.count()
        const getData = await prisma.tb_historypinjaman.findMany({
            skip: (Number(req.query.page) - 1) * Number(req.query.perpage),
            take: Number(req.query.perpage),
            orderBy: {
                id: 'asc',
            },
        })
        res.json(response.commonSuccessDataPaginate(getData, count, Number(req.query.page), Number(req.query.perpage), ''))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.postkur = async (req, res) => {
    const data = JSON.parse(req.body.data)

    if (req.files.file_lainnya1 !== undefined) {
        data.file_lainnya1 = req.files.file_lainnya1[0].filename
    }
    if (req.files.file_rut !== undefined) {
        data.file_rut = req.files.file_rut[0].filename
    }
    data.status_pengajuan = 1
    data.jumlah_tenaga_kerja = Number(data.jumlah_tenaga_kerja)
    data.jumlah = Number(data.jumlah)
    data.id_member = Number(data.id_member)
    data.id_bank = Number(data.id_bank)
    data.id_role = Number(data.id_role)
    data.jangka_waktu = Number(data.jangka_waktu)
    const idUser = Number(data.id_user)
    delete data.id_user
    try {
        const postKur = await prisma.tr_kur.create({
            data: data
        })
        if (postKur) {
            const postHistoryKur = await prisma.history_status_pengajuan_kur.create({
                data: {
                    id_status: 1,
                    id_user: idUser,
                    id_kur: postKur.id,
                    created_at: await sekarang()
                }
            })
            if (postHistoryKur) {
                res.json(response.success(200))
            } else {
                res.json(response.error(400))
            }
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByMember = async (req, res) => {
    try {
        const getData = await prisma.tr_kur.findMany({
            where: {
                id_member: Number(req.params.id)
            },
            include: {
                master_bank: true,
                kur_setting: true
            }
        })
        if (getData) {
            res.json(response.successWithData(getData, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByBank = async (req, res) => {
    try {
        const id = Number(req.params.id)
        const bank = await prisma.master_bank.findFirst({
            where: {
                id_member: id
            }
        })
        const getData = await prisma.tr_kur.findMany({
            where: {
                id_bank: bank.id
            },
            include: {
                member: {
                    include: {
                        ktp: true
                    }
                },
                kur_setting: true
            }
        })
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurRealisassi = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
            SELECT * FROM view_kur WHERE status_pengajuan BETWEEN 13 and 20`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByWilayahPenyuluh = async (req, res) => {
    try {

        const getData = await prisma.$queryRaw`SELECT * FROM view_kur WHERE id_kec = ${req.params.id}`

        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByWilayahDinasKab = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM view_kur WHERE id_kab = ${req.params.idkab} and id_role = ${Number(req.params.idrole)}`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByWilayahDinasProv = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM view_kur WHERE id_role = ${Number(req.params.idrole)}`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurDkpByWilayahDinasKab = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
            SELECT * FROM view_kur WHERE id_kab = ${req.params.idkab} 
                and (id_role = 2 or id_role= 13 or id_role = 14)`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurDkpByWilayahDinasrov = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
            SELECT * FROM view_kur WHERE (id_role = 2 or id_role= 13 or id_role = 14)`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getKurByWilayahKpbCenter = async (req, res) => {
    try {
        let getData, total
        const key = req.query.filter
        const page = req.query.page
        const perpage = req.query.perpage
        console.log(req.query);
        let newQuery = helpers.filterData(req.query);
        console.log(newQuery.length);
        let querys = helpers.convertQuery(newQuery)
        if (newQuery.length > 0) {
            getData = await prisma.$queryRawUnsafe(`SELECT * FROM view_kur ${querys} and (nama ilike $1 or nik ilike $2) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`, `%${key}%`, `%${key}%`)
            total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM view_kur ${querys} and (nama ilike $1 or nik ilike $2)`, `%${key}%`, `%${key}%`)
        } else {
            getData = await prisma.$queryRaw`SELECT * FROM view_kur where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            total = await prisma.$queryRaw`SELECT count(*) FROM view_kur where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
        }
        res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        // const getData = await prisma.$queryRaw`SELECT * FROM view_kur`
        // res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}


exports.getExports = async (req, res) => {
    try {
        let getData
        const key = req.query.filter
        // console.log(req.query);
        let newQuery = helpers.filterData(req.query);
        let querys = helpers.convertQuery(newQuery)
        // console.log(newQuery.length);
        if (newQuery.length > 0) {
            getData = await prisma.$queryRawUnsafe(`SELECT * FROM view_kur ${querys} and (nama ilike $1 or nik ilike $2)`, `%${key}%`, `%${key}%`)
        } else {
            getData = await prisma.$queryRaw`SELECT * FROM view_kur where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
        }
        // console.log(getData);
        res.json(response.successWithData(getData))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error(500))
    }
}

exports.getKurByIdKur = async (req, res) => {
    try {
        const id = Number(req.params.id)
        const getData = await prisma.$queryRaw`SELECT * from view_kur WHERE id = ${id}`
        const history = await prisma.history_status_pengajuan_kur.findMany({
            where: {
                id_kur: id
            },
            include: {
                kur_setting: true
            }
        })
        getData[0].history = history
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getStatusKur = async (req, res) => {
    try {
        const data = await prisma.kur_setting.findMany()
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getTest = async (req, res) => {
    try {
        var json = {
            nik: "000000"
        }
        const data = await prisma.test_.findMany({
            where: {
                data: {
                    equals: json
                }
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getStatusKurBank = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM kur_setting where id BETWEEN 13 and 20`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.editStatusKur = async (req, res) => {
    try {
        const edit = await prisma.kur_setting.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        })
        if (edit) {
            res.json(response.success(200))
        } else {
            res.status(400).json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}


exports.udpdateStatusPengajuanKur = async (req, res) => {
    const data = req.body
    try {
        const updateStatusPengajuan = await prisma.tr_kur.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status_pengajuan: Number(data.id_status),
                keterangan: data.keterangan
            }
        })
        if (updateStatusPengajuan) {
            const createHistory = await prisma.history_status_pengajuan_kur.create({
                data: {
                    id_status: Number(data.id_status),
                    keterangan: data.keterangan,
                    id_user: data.id_user,
                    id_kur: Number(req.params.id),
                    created_at: await sekarang()
                }
            })
            if (createHistory) {
                res.json(response.success(200))
            } else {
                res.status(400).json(response.error(400))
            }
        } else {
            res.status(400).json(response.error(400))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getHistoryStatusByIdKur = async (req, res) => {
    try {
        const getData = await prisma.tr_kur.findMany({
            where: {
                id: Number(req.params.id)
            },
            include: {
                history_status_pengajuan_kur: true
            }
        })
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

