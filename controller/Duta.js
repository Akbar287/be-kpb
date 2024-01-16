const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, cekNull } = require('../utils/utils');
const fs = require('fs');
const path = require('path');

exports.createActivity = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        data.created_at = await sekarang()
        data.image = cekNull(req.files)
        if (Array.isArray(data.image)) {
            data.image = data.image.join(', ');
        }
        await prisma.kegiatan_duta.create({
            data: data
        })
        res.json(response.success(201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getActivity = async (req, res) => {
    try {
        const nik = req.params.nik
        const data = await prisma.kegiatan_duta.findMany({
            where: {
                nik: nik
            },
            orderBy: {
                id_kegiatan: 'desc'
            }
        })
        for (let i = 0; i < data.length; i++) {
            const temp = data[i]
            data[i].image = temp.image.split(', ')
        }
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getUserActivity = async (req, res) => {
    try {
        const data = await prisma.$queryRaw`Select * from v_listduta`
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getAllActivity = async (req, res) => {
    try {
        const data = await prisma.kegiatan_duta.findMany({
            orderBy: {
                id_kegiatan: 'desc'
            }
        })
        for (let i = 0; i < data.length; i++) {
            const temp = data[i]
            data[i].image = temp.image.split(', ')
        }
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getDetailActiviy = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.kegiatan_duta.findFirst({
            where: {
                id_kegiatan: Number(id),
            }
        })
        data.image = data.image.split(', ')
        console.log(data);
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.updateActivity = async (req, res) => {
    try {
        const id = req.params.id
        const data = JSON.parse(req.body.data)
        data.image = cekNull(req.files)
        if (Array.isArray(data.image)) {
            data.image = data.image.join(', ');
        }
        const dataOld = await prisma.kegiatan_duta.findFirst({
            where: {
                id_kegiatan: Number(id)
            }
        })
        if (data.image !== null) {
            dataOld.image = dataOld.image.split(', ')
            for (old in dataOld.image) {
                const filePath = path.join('./public/file_duta/', old);
                // Mengecek apakah file ada
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlinkSync(`./public/okkpd/${old}`)
                    }
                });
            }
        } else {
            data.image = dataOld.image
        }
        delete data.id_kegiatan;
        await prisma.kegiatan_duta.update({
            where: {
                id_kegiatan: Number(id),
            },
            data: data
        })
        res.json(response.success(201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.deleteAktivity = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.kegiatan_duta.findFirst({
            where: {
                id_kegiatan: Number(id)
            }
        })
        if (data.image !== null) {
            const listImage = data.image.split(', ')
            for (let i = 0; i < listImage.length; i++) {
                const filePath = path.join('./public/file_duta/', listImage[i]);
                // Mengecek apakah file ada
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        console.error(`File tidak ditemukan.`);
                    } else {
                        fs.unlinkSync(`./public/file_duta/${listImage[i]}`)
                    }
                });
            }
        }
        await prisma.kegiatan_duta.delete({
            where: {
                id_kegiatan: Number(id)
            }
        })
        res.json(response.success())
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}