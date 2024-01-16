const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

// =============================== Data MASTER CRUD Role ============================================
exports.postRole = async (req, res) => {
    const data = req.body
    try {
        const postRole = await prisma.role.create({ data: data })
        if (postRole) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getRole = async (req, res) => {
    try {
        const data = await prisma.role.findMany()
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getRoleById = async (req, res) => {
    try {
        const data = await prisma.role.findUnique({
            where: { id_role: Number(req.params.id) }
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

exports.updateRole = async (req, res) => {
    const data = req.body
    try {
        const update = await prisma.role.update({
            where: {
                id_role: Number(req.params.id)
            },
            data: data
        })
        if (update) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.deleteRole = async (req, res) => {
    try {
        const del = await prisma.role.delete({
            where: {
                id_role: Number(req.params.id)
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
// ============================== END Data Master CRUD ==============================================
