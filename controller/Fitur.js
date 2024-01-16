const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');


exports.postFitur = async (req, res) => {
    const data = req.body
    try {
        const post = await prisma.fitur.create({ data: data })
        if (post) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getFitur = async (req, res) => {
    try {
        const data = await prisma.fitur.findMany()
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getFiturById = async (req, res) => {
    try {
        const data = await prisma.fitur.findUnique({
            where: { id_fitur: Number(req.params.id) }
        })
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.updateFitur = async (req, res) => {
    const data = req.body
    try {

        const update = await prisma.fitur.update({
            where: {
                id_fitur: Number(req.params.id)
            },
            data: data
        })
        if (update) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }


    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.deleteFitur = async (req, res) => {
    try {
        const del = await prisma.fitur.delete({
            where: {
                id_fitur: Number(req.params.id)
            }
        })
        if (del) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.inputFiturLayanan = async (req, res) => {
    try {
        // console.log(req.body)
        const create = await prisma.fitur_layanan.create({ data: req.body })
        if (create) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {

    }
}

exports.getLayananrole = async (req, res) => {
    try {
        const getData = await prisma.fitur_layanan.findMany({
            where: {
                id_layanan: Number(req.params.id)
            }
        })

        const fitur = []
        let getFitur = []
        if (getData.length > 0) {
            for (data of getData) {
                fitur.push(data.id_fitur)
            }
            getFitur = await prisma.fitur.findMany({
                where: {
                    id_fitur: {
                        notIn: fitur
                    }
                }
            })
        } else {
            getFitur = await prisma.fitur.findMany({})
        }
        res.json(response.successWithData(getFitur, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.inputLayananFitur = async (req, res) => {
    try {
        // console.log(req.body)
        const create = await prisma.fitur_layanan.create({ data: req.body })
        if (create) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {

    }
}

exports.getFiturByIdLayanan = async (req, res) => {
    try {
        const data = await prisma.fitur_layanan.findMany({
            where: { id_layanan: Number(req.params.id) },
            include: {
                fitur: true
            }
        })
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.deleteLayananFitur = async (req, res) => {
    try {
        // console.log(req.body)
        const del = await prisma.fitur_layanan.delete({
            where: {
                id: Number(req.params.id)
            }
        })
        if (del) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {

    }
}