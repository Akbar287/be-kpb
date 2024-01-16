const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const auth = require("basic-auth");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { response, sekarang } = require('../utils/utils');
const moment = require('moment')

exports.signIn = async (req, res) => {
    try {
        const credentials = auth(req);
        if (!credentials.name) {
            res.status(400).json(response.errorWithData('Invalid request', 400))
        } else {
            const user = await findUsers(credentials.name, credentials.pass).then()
            const token = jwt.sign(user, process.env.API_KEY, { expiresIn: '1d' })
            const nik = user.nik
            await prisma.users_login.update({
                where: {
                    nik: nik,
                }, data: {
                    last_login: await sekarang(),
                    access_token: token
                }
            })

            const dataMember = await cekMember(nik)
            const roleMember = await prisma.role_member.findMany({
                where: { id_member: dataMember.member.id_member },
                include: {
                    role: true
                }
            })
            const roles = []
            for (data of roleMember) {
                roles.push(Object.assign(data.role, { status: data.status }))
            }
            dataMember.roles = roles
            res.status(200).json(response.successWithData(dataMember, 200))
        }
    } catch (error) {
        res.json(error)
    }
};

exports.signUp = async (req, res) => {
    const datas = req.body
    try {
        const cekUser = await cekMember(datas.nik).then()
        if (cekUser) {
            res.json(response.errorWithData('Nik Sudah digunakan', 400))
        } else {
            const cariKtp = await prisma.ktp.findFirst({ orderBy: [{ 'id': 'desc' }] })
            const tglLahir = new Date(datas.tanggal_lahir)
            const dataKtp = {
                id: cariKtp.id + 1n,
                nik: datas.nik,
                nama: datas.nama,
                alamat: datas.alamat,
                jenis_kelamin: datas.jenis_kelamin,
                verified: false,
                tanggal_lahir: tglLahir.toISOString(),
                tempat_lahir: datas.tempat_lahir,
                created_at: await sekarang(),
                updated_at: await sekarang()
            }
            const createKtp = await prisma.ktp.create({ data: dataKtp })
            if (createKtp) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(datas.password, salt);
                const cariMember = await prisma.member.findFirst({ orderBy: [{ 'id_member': 'desc' }] })
                const dataMember = {
                    id_member: cariMember.id_member + 1n,
                    nik: createKtp.nik,
                    status: "Aktiv",
                    no_hp: datas.no_hp,
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    kode_pos: datas.kode_pos,
                    email: datas.email,
                    kode_pos: null,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: 'member',
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const createMember = await prisma.member.create({
                    data: dataMember
                })
                if (createMember) {
                    const createUsers = await prisma.users_login.create({
                        data: dataUsers
                    })
                    if (createUsers) {
                        res.status(200).json(response.successWithData(createKtp, 200))
                    } else {
                        res.status(400).json(response.error(400))
                    }
                } else {
                    res.status(400).json(response.error(400))
                }
            } else {
                res.json(response.errorWithData('Nik Sudah digunakan', 400))
            }
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
};

exports.signUpBank = async (req, res) => {
    // const datas = req.body
    const datas = JSON.parse(req.body.data)
    try {
        const cekUser = await cekMember(datas.nik).then()
        if (cekUser) {
            res.json(response.errorWithData('Nik Sudah digunakan', 400))
        } else {
            const cariKtp = await prisma.ktp.findFirst({ orderBy: [{ 'id': 'desc' }] })
            const dataKtp = {
                id: cariKtp.id + 1n,
                nik: datas.nik,
                nama: datas.nama_bank,
                alamat: '-',
                jenis_kelamin: '-',
                verified: true,
                created_at: await sekarang(),
                updated_at: await sekarang()
            }
            const createKtp = await prisma.ktp.create({ data: dataKtp })
            if (createKtp) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('12345678', salt);
                const cariMember = await prisma.member.findFirst({ orderBy: [{ 'id_member': 'desc' }] })
                const dataMember = {
                    id_member: cariMember.id_member + 1n,
                    nik: createKtp.nik,
                    status: "Aktiv",
                    no_hp: '-',
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    kode_pos: datas.kode_pos,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: "bank",
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }

                const createMember = await prisma.member.create({
                    data: dataMember
                })
                await prisma.users_login.create({
                    data: dataUsers
                })
                if (req.file === undefined) return res.json(response.errorWithData('Gambar tidak boleh kosong', 400))
                datas.file_syarat = req.file.filename
                const dataBank = {
                    nama_bank: datas.nama_bank,
                    keterangan: datas.keterangan,
                    alamat: datas.alamat,
                    nama_pic: datas.nama_pic,
                    jabatan_pic: datas.jabatan_pic,
                    id_member: createMember.id_member,
                    file_syarat: datas.file_syarat,
                    url: datas.url
                }
                await prisma.master_bank.create({
                    data: dataBank
                })
                const findRoleBank = await prisma.role.findFirst({ where: { nama_role: "BANK" } })
                await prisma.role_member.create({
                    data: {
                        id_member: createMember.id_member,
                        id_role: 9,
                        status: '1'
                    }
                })
                res.status(200).json(response.success(200))
            } else {
                res.json(response.errorWithData('Nik Sudah digunakan', 400))
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
};

exports.signUpAsuransi = async (req, res) => {
    // const datas = req.body
    const datas = JSON.parse(req.body.data)
    try {
        const cekUser = await cekMember(datas.nik).then()
        if (cekUser) {
            res.json(response.errorWithData('Nik Sudah digunakan', 400))
        } else {
            const cariKtp = await prisma.ktp.findFirst({ orderBy: [{ 'id': 'desc' }] })
            const dataKtp = {
                id: cariKtp.id + 1n,
                nik: datas.nik,
                nama: datas.nama_asuransi,
                alamat: '-',
                jenis_kelamin: '-',
                verified: true,
                created_at: await sekarang(),
                updated_at: await sekarang()
            }
            const createKtp = await prisma.ktp.create({ data: dataKtp })
            if (createKtp) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('12345678', salt);
                const cariMember = await prisma.member.findFirst({ orderBy: [{ 'id_member': 'desc' }] })
                const dataMember = {
                    id_member: cariMember.id_member + 1n,
                    nik: createKtp.nik,
                    status: "Aktiv",
                    no_hp: '-',
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    kode_pos: datas.kode_pos,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: "asuransi",
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }

                const createMember = await prisma.member.create({
                    data: dataMember
                })
                await prisma.users_login.create({
                    data: dataUsers
                })
                if (req.file === undefined) return res.json(response.errorWithData('Gambar tidak boleh kosong', 400))
                datas.file_syarat = req.file.filename
                const dataAsuransi = {
                    nama_bank: datas.nama_bank,
                    keterangan: datas.keterangan,
                    alamat: datas.alamat,
                    nama_pic: datas.nama_pic,
                    jabatan_pic: datas.jabatan_pic,
                    id_member: createMember.id_member,
                    file_syarat: datas.file_syarat,
                    url: datas.url
                }
                await prisma.master_asuransi.create({
                    data: dataAsuransi
                })
                const findRoleBank = await prisma.role.findFirst({ where: { nama_role: "BANK" } })
                await prisma.role_member.create({
                    data: {
                        id_member: createMember.id_member,
                        id_role: 17,
                        status: '1'
                    }
                })
                res.status(200).json(response.success(200))
            } else {
                res.json(response.errorWithData('Nik Sudah digunakan', 400))
            }
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
};

exports.signUpDinas = async (req, res) => {
    const datas = req.body
    // const datas = JSON.parse(req.body.data)
    // console.log(datas)
    try {
        const cekUser = await cekMember(datas.nik).then()
        if (cekUser) {
            res.json(response.errorWithData('Nik Sudah digunakan', 400))
        } else {
            const cariKtp = await prisma.ktp.findFirst({ orderBy: [{ 'id': 'desc' }] })
            const dataKtp = {
                id: cariKtp.id + 1n,
                nik: datas.nik,
                nama: datas.nama,
                alamat: '-',
                jenis_kelamin: '-',
                verified: true,
                created_at: await sekarang(),
                updated_at: await sekarang()
            }
            const createKtp = await prisma.ktp.create({ data: dataKtp })
            if (createKtp) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('12345678', salt);
                const cariMember = await prisma.member.findFirst({ orderBy: [{ 'id_member': 'desc' }] })
                const dataMember = {
                    id_member: cariMember.id_member + 1n,
                    nik: createKtp.nik,
                    status: "Aktiv",
                    no_hp: '-',
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    kode_pos: datas.kode_pos,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: datas.access,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }

                const createMember = await prisma.member.create({
                    data: dataMember
                })
                await prisma.users_login.create({
                    data: dataUsers
                })

                await prisma.role_member.create({
                    data: {
                        id_member: createMember.id_member,
                        id_role: 15,
                        status: '1'
                    }
                })
                res.status(200).json(response.success(200))
            } else {
                res.json(response.errorWithData('Nik Sudah digunakan', 400))
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
};

exports.signUpPabrik = async (req, res) => {
    const datas = req.body
    // const datas = JSON.parse(req.body.data)
    // console.log(datas)
    try {
        const cekUser = await cekMember(datas.nik).then()
        if (cekUser) {
            res.json(response.errorWithData('Nik Sudah digunakan', 400))
        } else {
            const cariKtp = await prisma.ktp.findFirst({ orderBy: [{ 'id': 'desc' }] })
            const dataKtp = {
                id: cariKtp.id + 1n,
                nik: datas.nik,
                nama: datas.nama,
                alamat: '-',
                jenis_kelamin: '-',
                verified: true,
                created_at: await sekarang(),
                updated_at: await sekarang()
            }
            const createKtp = await prisma.ktp.create({ data: dataKtp })
            if (createKtp) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('12345678', salt);
                const cariMember = await prisma.member.findFirst({ orderBy: [{ 'id_member': 'desc' }] })
                const dataMember = {
                    id_member: cariMember.id_member + 1n,
                    nik: createKtp.nik,
                    status: "Aktiv",
                    no_hp: '-',
                    kode_pos: datas.kode_pos,
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }

                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: 'pabrik',
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }

                const createMember = await prisma.member.create({
                    data: dataMember
                })
                await prisma.users_login.create({
                    data: dataUsers
                })

                await prisma.master_pabrik.create({
                    data: {
                        id_member: createMember.id_member,
                        nama_pabrik: datas.nama,
                        keterangan: datas.keterangan
                    }
                })
                res.status(200).json(response.success(200))
            } else {
                res.json(response.errorWithData('Nik Sudah digunakan', 400))
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
};

exports.getMemberDinas = async (req, res) => {
    try {
        const data = await prisma.role.findMany({
            where: {
                id_role: 15
            },
            include: {
                role_member: {
                    include: {
                        member: {
                            include: {
                                ktp: true,
                                reg_regencies: true,
                                users_login: true
                            }
                        }
                    }
                }
            }
        })
        res.status(200).json(response.successWithData(data[0].role_member, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

//================================================== function =======================================================
const cekMember = (nik) =>
    new Promise(async (resolve, reject) => {
        await prisma.ktp.findUnique({ where: { nik: nik }, include: { member: { include: { users_login: true, reg_provinces: true, reg_regencies: true, reg_districts: true, reg_villages: true } } } })
            .then((cekUser) => {
                resolve(cekUser)
            }).catch(err => {
                console.log(err)
                reject(err)
            })
    })

const findUsers = (nik, password) =>
    new Promise(async (resolve, reject) => {
        await prisma.users_login.findMany({ where: { nik: nik } })
            .then((users) => {
                if (users.length == 0) {
                    reject(response.errorWithData('Username tidak terdaftar', 400));
                } else {
                    return users[0];
                }
            })
            .then(async (user) => {
                if (user) {
                    const hashed_password = user.password;
                    if (bcrypt.compareSync(password, hashed_password)) {
                        const cekMembers = await cekMember(user.nik).then()
                        resolve({ nik: cekMembers.member.nik, id_member: cekMembers.member.id_member });
                    } else {
                        reject(response.errorWithData('Password anda salah', 400));
                    }
                } else {
                    reject(response.errorWithData('Username tidak terdaftar', 400));
                }
            })
            .catch(err => {
                console.log(err)
                reject(response.error(500))
            });
    })
