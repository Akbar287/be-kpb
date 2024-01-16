const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.postBarang = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.master_barang_pabrik.create({
            data: data
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Gagal input data', 403))
        }
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getDataBarangPabrik = async (req, res) => {
    try {
        const query = await prisma.master_barang_pabrik.findMany({
            where: {
                id_member: Number(req.params.id)
            },
            include: {
                material_master: {
                    include: {
                        child_dtl_kategori: {
                            include: {
                                detail_kategori: {
                                    include: {
                                        kategori_master: {
                                            include: {
                                                master_sektor: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}