const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.getAllBank = async (req, res) => {
    try {
        const data = await prisma.master_bank.findMany({
            include: {
                member: true
            },
            orderBy: {
                urut: 'asc'
            }
        })

        if (data.length > 0) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.successNotData(400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getBankById = async (req, res) => {
    try {
        const data = await prisma.master_bank.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                member: true
            }
        })
        console.log(data)
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.successNotData(400))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.editBank = async (req, res) => {
    const datas = JSON.parse(req.body.data)
    try {
        if (datas.adaFile) {
            datas.file_syarat = req.file.filename
            console.log(datas)
            await prisma.$queryRaw`
            UPDATE 
                "master_bank" 
            SET 
                "nama_bank" = ${datas.nama_bank}, 
                "keterangan" = ${datas.keterangan}, 
                "url" = ${datas.url},
                "alamat" = ${datas.alamat},
                "nama_pic" = ${datas.nama_pic},
                "jabatan_pic" = ${datas.jabatan_pic},
                "file_syarat" = ${datas.file_syarat}
            WHERE "id" = ${Number(req.params.id)}`
        } else {
            await prisma.$queryRaw`
            UPDATE
                "master_bank"
            SET 
                "nama_bank" = ${datas.nama_bank}, 
                "keterangan" = ${datas.keterangan}, 
                "url" = ${datas.url},
                "alamat" = ${datas.alamat},
                "nama_pic" = ${datas.nama_pic},
                "jabatan_pic" = ${datas.jabatan_pic}
            WHERE "id" = ${Number(req.params.id)}`
        }

        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}