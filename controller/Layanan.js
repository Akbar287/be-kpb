const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');


exports.postLayanan = async (req, res) => {
    const data = JSON.parse(req.body.data)
    try {
        if (req.files['gambar'][0] === undefined) {
            res.json(response.errorWithData('Gambar tidak boleh kosong', 400))
        } else if (req.files['icon'][0] === undefined) {
            res.json(response.errorWithData('Icon tidak boleh kosong', 400))
        } else {
            data.gambar = req.files['gambar'][0].filename
            data.icon = req.files['icon'][0].filename
            const postLayanan = await prisma.layanan.create({ data: data })
            if (postLayanan) {
                res.json(response.success(200))
            } else {
                res.json(response.error(400))
            }
        }

    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getLayanan = async (req, res) => {
    try {
        const data = await prisma.layanan.findMany()
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getLayananById = async (req, res) => {
    try {
        const data = await prisma.layanan.findUnique({
            where: { id_layanan: Number(req.params.id) }
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

exports.updateLayanan = async (req, res) => {
    const data = JSON.parse(req.body.data)
    try {
        if (data.adaGambar) {
            data.gambar = req.files['gambar'][0].filename
        } else {
            data.gambar = req.body.gambar
        }
        if (data.adaIcon) {
            data.icon = req.files['icon'][0].filename
        } else {
            data.icon = req.body.gambar
        }
        delete data.adaGambar
        delete data.adaIcon
        const update = await prisma.layanan.update({
            where: {
                id_layanan: Number(req.params.id)
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

exports.deleteLayanan = async (req, res) => {
    try {
        const del = await prisma.layanan.delete({
            where: {
                id_layanan: Number(req.params.id)
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

exports.getLayananByIdRole = async (req, res) => {
    try {
        const data = await prisma.role_layanan.findFirst({
            where: { id_role: Number(req.params.id) },
            include: {
                role: true
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

exports.getRoleLayanan = async (req, res) => {
    try {
        const getData = await prisma.role_layanan.findMany({
            where: {
                id_role: Number(req.params.id)
            }
        })

        const layanan = []
        let getLayan = []
        if (getData.length > 0) {
            for (data of getData) {
                layanan.push(data.id_layanan)
            }
            getLayan = await prisma.layanan.findMany({
                where: {
                    id_layanan: {
                        notIn: layanan
                    }
                }
            })
        } else {
            getLayan = await prisma.layanan.findMany({})
        }
        res.json(response.successWithData(getLayan, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}


exports.inputRoleLayanan = async (req, res) => {
    try {
        // console.log(req.body)
        const create = await prisma.role_layanan.create({ data: req.body })
        if (create) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {

    }
}

exports.deleteRoleLayanan = async (req, res) => {
    try {
        // console.log(req.body)
        const del = await prisma.role_layanan.delete({
            where: {
                id_role_layanan: Number(req.params.id)
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