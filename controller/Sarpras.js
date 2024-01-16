const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

// CRU SEKTOR
exports.getSektor = async (req, res) => {
    try {
        const data = await prisma.master_sektor.findMany({})
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.getSektorById = async (req, res) => {
    try {
        const data = await prisma.master_sektor.findUnique({ where: { id: Number(req.params.id) } })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.createSektor = async (req, res) => {
    try {
        const data = req.body
        await prisma.master_sektor.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error)
    }
}

exports.updateSektor = async (req, res) => {
    try {
        const data = req.body
        await prisma.master_sektor.update({
            where: { id: Number(req.params.id) },
            data: data
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error)
        res.json(response.error)
    }
}
// End sektor

exports.getSektorOpt = async (req, res) => {
    try {
        const data = await prisma.master_sektor.findMany({
            where: {
                id: {
                    in: [1, 2],
                }
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

// kategori master
exports.getKategoriMaster = async (req, res) => {
    try {
        const data = await prisma.kategori_master.findMany({
            where: {
                kategori_sektor_id: Number(req.params.id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.createKategori = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        data.kategori_sektor_id = Number(data.kategori_sektor_id)
        // console.log(data);
        await prisma.kategori_master.create({
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.updateKategori = async (req, res) => {
    try {
        const data = req.body
        await prisma.kategori_master.update({
            where: { id: Number(req.params.id) },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

//end kategori master

// cru detail kategori
exports.getDetailKategori = async (req, res) => {
    try {
        const data = await prisma.detail_kategori.findMany({
            where: {
                dtlk_kategori_id: Number(req.params.id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.createDetailKategori = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        data.dtlk_kategori_id = Number(data.dtlk_kategori_id)
        data.created_at = await sekarang()
        await prisma.detail_kategori.create({
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.updateDetailKategori = async (req, res) => {
    try {
        const data = req.body
        data.updated_at = await sekarang()
        await prisma.detail_kategori.update({
            where: {
                dtlk_id: Number(req.params.id)
            },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}
// end detail kategori

// curd detail kategori
exports.getChildDetailKategori = async (req, res) => {
    try {
        const data = await prisma.child_dtl_kategori.findMany({
            where: {
                dtlk_id: Number(req.params.id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.createChildDetailKategori = async (req, res) => {
    try {
        const data = req.body
        data.dtlk_id = Number(data.dtlk_id)
        data.created_at = await sekarang()
        await prisma.child_dtl_kategori.create({
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.updateChildDetailKategori = async (req, res) => {
    try {
        const data = req.body
        data.updated_at = await sekarang()
        await prisma.child_dtl_kategori.update({
            where: {
                child_dtlk_id: Number(req.params.id)
            },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

//end detail kategori

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ================== Crud Sarpras Model Baru =========================
exports.postSarprasNew = async (req, res) => {
    const data = JSON.parse(req.body.data)
    try {
        if (req.file === undefined) {
            res.json(response.errorWithData('Gambar tidak boleh kosong', 400))
        } else {
            data.mm_img = req.file.filename
            const post = await prisma.material_master.create({ data: data })
            if (post) {
                res.json(response.success(200))
            } else {
                res.json(response.error(400))
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getSarprasNew = async (req, res) => {
    try {
        const count = await prisma.material_master.count()
        const data = await prisma.material_master.findMany({
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
            },
            skip: (Number(req.query.page) - 1) * Number(req.query.perpage),
            take: Number(req.query.perpage),
        })
        res.json(response.commonSuccessDataPaginate(data, count, Number(req.query.page), Number(req.query.perpage), ''))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getSarprasDropDown = async (req, res) => {
    try {
        const data = await prisma.material_master.findMany({
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
            },
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.updateSarprasNew = async (req, res) => {
    const data = JSON.parse(req.body.data)
    try {

        if (data.adaGambar) {
            data.mm_img = req.file.filename
        } else {
            data.mm_img = req.body.gambar
        }
        delete data.adaGambar
        const update = await prisma.material_master.update({
            where: {
                mm_id: Number(req.params.id)
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

exports.getSarprasByIdNew = async (req, res) => {
    try {
        const data = await prisma.material_master.findUnique({
            where: {
                mm_id: Number(req.params.id)
            },
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
            },
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.deleteSarpras = async (req, res) => {
    try {
        const del = await prisma.material_master.delete({
            where: {
                mm_id: Number(req.params.id)
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

exports.getKomoditasBySektorId = async (req, res) => {
    try {
        const data = await prisma.master_komoditas.findMany({
            where: {
                sektor_id: Number(req.params.id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.getKomoditasBySektorOpt = async (req, res) => {
    try {
        const data = await prisma.master_komoditas.findMany({
            where: {
                sektor_id: {
                    in: [1, 2]
                }
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

// ================= End Crud Sarpras Model Baru ======================

// ================== Lama Gak kepake ========================
exports.getKategori = async (req, res) => {
    try {
        const data = await prisma.master_kategori.findMany({
            where: {
                id_sektor: Number(req.params.id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.getJenis = async (req, res) => {
    try {
        const data = await prisma.master_jenis.findMany({
            where: {
                id_kategori: Number(req.params.id)
            }
        })

        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}

exports.getPabrik = async (req, res) => {
    try {
        const data = await prisma.master_pabrik.findMany({})

        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.error)
    }
}
// ================== End Lama Gak kepake ========================
