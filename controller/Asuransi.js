const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, uploadFiles } = require('../utils/utils');
const fs = require('fs');
const helpers = require('../helpers/Helpers');

// ========== master Asuransi ================= //
exports.getDataAsuransi = async (req, res) => {
    console.log(req.body)
    try {
        const data = await prisma.master_asuransi.findMany({})
        if (data) {
            res.json(response.successWithData(data, 200))
        } else {
            res.json(response.error(403))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getBpjs = async (req, res) => {
    try {
        const count = await prisma.tmp_bpjs.count()
        const getData = await prisma.tmp_bpjs.findMany({
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

exports.getAutph = async (req, res) => {
    try {
        const count = await prisma.tmp_bpjs.count()
        const getData = await prisma.tmp_autp.findMany({
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

exports.getAutsk = async (req, res) => {
    try {
        const count = await prisma.tmp_bpjs.count()
        const getData = await prisma.tmp_autsk.findMany({
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

// =============== BPJS =============== 
exports.insertBpjs = async (req, res) => {
    const data = req.body
    data.bpjs_tmt = new Date(data.bpjs_tmt)
    data.bpjs_status = 1
    data.bpjs_penghasilan = Number(data.bpjs_penghasilan)
    data.id_role = Number(data.id_role)
    data.id_sektor = Number(data.id_sektor)
    const idUser = Number(data.id_user)
    delete data.id_user
    const cariBpjs = await prisma.ktp.findFirst({ orderBy: [{ 'bpjs_id': 'desc' }] })
    data.bpjs_id = cariBpjs.bpjs_id + 1n
    try {
        const insertData = await prisma.tr_bpjs.create({ data: data })
        if (insertData) {
            const postHistory = await prisma.history_status_pengajuan_bpjs.create({
                data: {
                    id_status: 1,
                    id_user: idUser,
                    id_bpjs: BigInt(insertData.bpjs_id),
                    created_at: await sekarang(),
                    keterangan: '-'
                }
            })
            if (postHistory) {
                res.json(response.success(200))
            } else {
                res.json(response.error(403))
            }

        } else {
            res.json(response.error(403))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getAllBpjs = async (req, res) => {
    let getData, total
    const key = req.query.filter
    const page = req.query.page
    const perpage = req.query.perpage
    console.log(req.query);
    let newQuery = helpers.filterData(req.query);
    console.log(newQuery.length);
    let querys = helpers.convertQuery(newQuery)
    if (newQuery.length > 0) {
        getData = await prisma.$queryRawUnsafe(`SELECT * FROM v_bpjs ${querys} and (nama ilike $1 or nik ilike $2) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`, `%${key}%`, `%${key}%`)
        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM v_bpjs ${querys} and (nama ilike $1 or nik ilike $2)`, `%${key}%`, `%${key}%`)
    } else {
        getData = await prisma.$queryRaw`SELECT * FROM v_bpjs where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
        total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
    }
    res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
}

exports.getFullBpjs = async (req, res) => {
    let getData
    const key = req.query.filter
    console.log(req.query);
    let newQuery = helpers.filterData(req.query);
    let querys = helpers.convertQuery(newQuery)
    console.log(newQuery.length);
    if (newQuery.length > 0) {
        getData = await prisma.$queryRawUnsafe(`SELECT * FROM v_bpjs ${querys} and (nama ilike $1 or nik ilike $2)`, `%${key}%`, `%${key}%`)
    } else {
        getData = await prisma.$queryRaw`SELECT * FROM v_bpjs where (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
    }
    console.log(getData);
    res.json(response.successWithData(getData))
}

exports.getBpjsById = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
                            SELECT * FROM v_bpjs where bpjs_id = ${Number(req.params.id)}`
        const history = await prisma.history_status_pengajuan_bpjs.findMany({
            where: {
                id_bpjs: Number(req.params.id)
            },
            include: {
                bpjs_setting: true
            }
        })
        getData[0].history = history
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.updateBpjs = async (req, res) => {
    req.body.bpjs_tmt = new Date(req.body.bpjs_tmt)
    try {
        const updateData = await prisma.tr_bpjs.update({
            where: {
                bpjs_id: Number(req.params.id)
            },
            data: req.body
        })
        if (updateData) {
            res.json(response.success(200))
        } else {
            res.json(response.error(403))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.deleteBpjs = async (req, res) => {
    try {
        const deleteData = await prisma.tr_bpjs.delete({
            where: {
                bpjs_id: Number(req.params.id)
            },
        })
        if (deleteData) {
            res.json(response.success(200))
        } else {
            res.json(response.error(403))
        }
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getBpjsByIdMember = async (req, res) => {
    try {
        const getData = await prisma.tr_bpjs.findMany({
            where: {
                member_id: Number(req.params.id)
            },
            include: {
                bpjs_setting: true,
                master_sektor: true
            }
        })
        if (getData) {
            res.json(response.successWithData(getData, 200))
        } else {
            res.json(response.error(403))
        }
    } catch (error) {

        res.json(response.error(500))
    }
}

exports.updateStatusBpjsMember = async (req, res) => {
    const data = req.body
    try {
        const updateStatusPengajuan = await prisma.tr_bpjs.update({
            where: {
                bpjs_id: Number(req.params.id)
            },
            data: {
                bpjs_status: Number(data.id_status),
                keterangan: data.keterangan
            }
        })
        if (updateStatusPengajuan) {
            const createHistory = await prisma.history_status_pengajuan_bpjs.create({
                data: {
                    id_status: Number(data.id_status),
                    keterangan: data.keterangan,
                    id_user: data.id_user,
                    id_bpjs: Number(req.params.id),
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

exports.getStatusKurBpjs = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM bpjs_setting where id BETWEEN 13 and 18`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

// ================ AUTS,AUTP, AUTSK =================
exports.createDataAsuransi = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        if (req.file === undefined) {
            res.json(response.errorWithData('File tidak boleh kosong', 400))
        } else {
            data.status = 1
            const idUser = Number(data.id_user)
            delete data.id_user
            data.file_anggota = req.file.filename
            data.created_at = await sekarang()
            if (data.jenis_asuransi === 'AUTP') {
                data.prakiraan_tanam = new Date(data.prakiraan_tanam)
                data.prakiraan_panen = new Date(data.prakiraan_panen)
            } else {
                data.musim_tanam = null
                data.metode_tanam = null
                data.prakiraan_panen = null
                data.prakiraan_tanam = null
            }
            const query = await prisma.tr_asuransi.create({
                data: data
            })
            if (query) {
                const postHistory = await prisma.history_status_pengajuan_asuransi.create({
                    data: {
                        id_status: 1,
                        id_user: idUser,
                        id_asuransi: BigInt(query.id),
                        created_at: await sekarang(),
                        keterangan: '-'
                    }
                })
                if (postHistory) {
                    res.json(response.success(200))
                } else {
                    res.json(response.error(403))
                }
            } else {
                res.json(response.error(400))
            }
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.updateAsuransi = async (req, res) => {
    const data = JSON.parse(req.body.data)
    try {

        if (data.adaGambar) {
            data.file_anggota = req.file.filename
        } else {
            data.file_anggota = req.body.file_anggota
        }
        delete data.adaGambar
        const update = await prisma.tr_asuransi.update({
            where: {
                id: Number(req.params.id)
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

exports.getJasindoByIdMember = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM v_jasindo where created_by = ${Number(req.params.id)}`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getJasindoById = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM v_jasindo where id = ${Number(req.params.id)}`
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getJasindo = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM v_jasindo`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.updateStatusJasindoMember = async (req, res) => {
    const data = req.body
    try {
        const updateStatusPengajuan = await prisma.tr_asuransi.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status: Number(data.id_status),
                keterangan: data.keterangan
            }
        })
        if (updateStatusPengajuan) {
            const createHistory = await prisma.history_status_pengajuan_asuransi.create({
                data: {
                    id_status: Number(data.id_status),
                    keterangan: data.keterangan,
                    id_user: data.id_user,
                    id_asuransi: Number(req.params.id),
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

exports.getStatusJasindo = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM asuransi_setting where id BETWEEN 13 and 18`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.exportBpjs = async (req, res) => {
    try {
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        let dataError = []
        for (const data of fileExcel) {
            if (data.nik.length !== 0) {
                data.nik = data.nik.replace(/['"]+/g, "");
                console.log(data);
                const ktp = await prisma.ktp.findFirst({
                    where: {
                        nik: data.nik
                    }
                })
                const member = await prisma.member.findFirst({
                    where: {
                        nik: data.nik
                    }
                })

                if (ktp) {
                    if (member) {
                        const roleMember = await prisma.role_member.findMany({
                            where: {
                                id_member: member.id_member,
                                id_role: Number(data.id_role),
                                status: '1'
                            }
                        })
                        if (roleMember.length == 0) {
                            await prisma.role_member.create({
                                data: {
                                    id_member: Number(member.id_member),
                                    id_role: Number(data.id_role),
                                    status: '1'
                                }
                            })
                        }
                        const dataBPJS = await prisma.tr_bpjs.findFirst({ orderBy: [{ 'bpjs_id': 'desc' }] })
                        const master_bpjs = await prisma.tr_bpjs.create({
                            data: {
                                bpjs_id: dataBPJS.bpjs_id + 1n,
                                bpjs_nokartu: data.nokartu,
                                bpjs_status: Number(18),
                                bpjs_jenis_peserta: data.jenis_peserta.length > 0 ? data.jenis_peserta : 'Baru',
                                bpjs_jenis_pekerjaan: data.jenis_pekerjaan,
                                bpjs_lokasi_pekerjaan: data.lokasi_pekerjaan,
                                bpjs_penghasilan: Number(0),
                                bpjs_program: data.program,
                                bpjs_tmt: data.bpjs_tmt ? new Date(data.bpjs_tmt) : null,
                                member_id: Number(member.id_member),
                                periode_pendaftaran: data.periode_pendaftaran,
                                id_role: Number(data.id_role),
                                id_sektor: Number(data.id_sektor),
                                keterangan: data.keterangan ?? '',
                                bpjs_tb: data.bpjs_tb ? new Date(data.bpjs_tb) : null,
                            }
                        })
                        const userLogin = await prisma.users_login.findFirst({
                            where: {
                                nik: data.nik
                            }
                        })
                        await prisma.history_status_pengajuan_bpjs.create({
                            data: {
                                id_bpjs: master_bpjs.bpjs_id,
                                id_status: 18,
                                id_user: userLogin.id_users,
                                keterangan: '-',
                                created_at: await sekarang()
                            }
                        })
                    } else {
                        dataError.push({
                            nik: data.nik,
                            keterangan: 'Belum Ada di member'
                        })
                    }
                } else {
                    dataError.push({
                        nik: data.nik,
                        keterangan: 'Belum Ada di ktp'
                    })
                }
            }
        }
        res.json({
            status: true,
            message: 'Berhasil Tambah BPJS',
            dataError: dataError
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error(500))
    }
}