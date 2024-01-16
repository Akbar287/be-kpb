const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers')
const bcrypt = require("bcryptjs");

// ===================== GET LAYANAN, FITUR, ROLEMEMBER, LAYANAN MEMBER, FITUR MEMBER ===============================
exports.getLayananUsers = async (req, res) => {
    try {
        const layananUsers = await prisma.role_layanan.findMany({
            where: {
                id_role: Number(req.params.id)
            },
            include: {
                layanan: true
            }
        })
        if (layananUsers.length > 0) {
            res.status(200).json(response.successWithData(layananUsers, 200))
        } else {
            res.json(response.errorWithData('Layanan tidak tersedia', 400))
        }

    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getFiturUser = async (req, res) => {
    try {
        const fiturUser = await prisma.fitur_layanan.findMany({
            where: {
                id_layanan: Number(req.params.id)
            },
            include: {
                fitur: true
            }
        })
        res.status(200).json(response.successWithData(fiturUser, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.cekRoleMember = async (req, res) => {
    try {
        const roleMember = await prisma.role_member.findMany({
            where: { id_member: Number(req.params.idmember), id_role: Number(req.params.idrole) },
            include: {
                role: true
            }
        })

        if (roleMember.length > 0) {
            res.status(200).json(response.cekAkses(true, 200, "Berhasil"))
        } else {
            res.status(200).json(response.cekAkses(false, 200, "Anda tidak diizinkan mengakses halaman ini"))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.cekLayananMember = async (req, res) => {
    try {
        const layananMember = await prisma.role_layanan.findMany({
            where: { id_role: Number(req.params.idrole), id_layanan: Number(req.params.idlayanan) },
            include: {
                layanan: true
            }
        })

        if (layananMember.length > 0) {
            res.status(200).json(response.cekAkses(true, 200, "Berhasil"))
        } else {
            res.status(200).json(response.cekAkses(false, 200, "Anda tidak diizinkan mengakses halaman ini"))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.cekFiturMember = async (req, res) => {
    try {
        const layananMember = await prisma.fitur_layanan.findMany({
            where: { id_layanan: Number(req.params.idlayanan), id_fitur: Number(req.params.idfitur), },
            include: {
                fitur: true
            }
        })

        if (layananMember.length > 0) {
            res.status(200).json(response.cekAkses(true, 200, "Berhasil"))
        } else {
            res.status(200).json(response.cekAkses(false, 200, "Anda tidak diizinkan mengakses halaman ini"))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}
// ================= END GET LAYANAN, FITUR, ROLEMEMBER, LAYANAN MEMBER, FITUR MEMBER =================================

// ================= GET ROLE MEMBER =================================
exports.getRoleMember = async (req, res) => {
    try {
        const getData = await prisma.role_member.findMany({
            where: {
                id_member: Number(req.params.idmember)
            }
        })
        const role = []
        let getRole = []
        if (getData.length > 0) {
            for (data of getData) {
                role.push(data.id_role)
            }
            getRole = await prisma.role.findMany({
                where: {
                    id_role: {
                        notIn: role
                    }
                }
            })
        } else {
            getRole = await prisma.role.findMany({})
        }
        res.json(response.successWithData(getRole, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}
// ================= END GET ROLE MEMBER =================================

// ================= GET ROLE MEMBER Dengan parameter =================================
exports.getRoleMemberWithParams = async (req, res) => {
    try {
        let data
        if (req.query.status == 'all') {
            data = await prisma.role_member.findMany({
                where: {
                    id_member: Number(req.params.idmember),
                },
                distinct: ['id_role'],
                include: {
                    role: true
                }
            })
        } else {
            data = await prisma.role_member.findMany({
                where: {
                    id_member: Number(req.params.idmember),
                    status: req.query.status
                },
                distinct: ['id_role'],
                include: {
                    role: true
                }
            })
        }

        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

// ================= INPUT ROLE MEMBER =================================
exports.inputRoleMember = async (req, res) => {
    try {
        const postData = await prisma.role_member.createMany({
            data: req.body
        })
        if (postData) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Error ', 403))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}
// ================= END INPUT ROLE MEMBER =================================

// =========================== Menghubungkan Member KE ROLE ====================================
exports.hubunganMemberKeRole = async (req, res) => {
    try {
        const createData = await prisma.role_member.create({ data: req.body })
        if (createData) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}
// =========================== End Menghubungkan Member KE ROLE ================================

exports.getRoleMemberAll = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`SELECT * FROM ktp INNER JOIN "member" ON ktp.nik = "member".nik INNER JOIN role_member ON "member".id_member = role_member.id_member INNER JOIN "role" ON role_member.id_role = "role".id_role WHERE role_member.status = '0'`

        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.updateStatusRoleMember = async (req, res) => {
    try {
        const data = req.body
        let doing
        if (data.status == '1') {
            doing = await prisma.role_member.update({
                where: {
                    id: Number(req.params.id)
                },
                data: {
                    status: '1'
                }
            })
        } else if (data.status == '0') {
            doing = await prisma.role_member.update({
                where: {
                    id: Number(req.params.id)
                },
                data: {
                    status: '0'
                }
            })
        } else {
            doing = await prisma.role_member.update({
                where: {
                    id: Number(req.params.id)
                },
                data: {
                    status: '2',
                    keterangan: req.body.keterangan
                }
            })
        }

        if (doing) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }

    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.cekVerifiedKtpByKtp = async (req, res) => {
    try {
        const cek = await prisma.ktp.findFirst({
            where: {
                nik: req.params.ktp
            }
        })
        res.json(response.successWithData(cek, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getKtpBelumAktif = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
        SELECT
            "ktp"."id",
            "ktp".nik,
            "ktp".nama,
            "ktp".alamat,
            ktp.jenis_kelamin,
	        ktp.verified,
            "reg_provinces"."name" as provinsi,
            "reg_regencies"."name" as kabupaten,
            reg_districts."name" as kecamatan,
	        reg_villages."name" as desa
        FROM
            ktp
                INNER JOIN "member" ON ktp.nik = "member".nik
                INNER JOIN reg_provinces ON "member".id_prov = reg_provinces."id"
                INNER JOIN reg_regencies ON "member".id_kab = reg_regencies."id" 
                AND reg_provinces."id" = reg_regencies.province_id
                LEFT JOIN reg_districts ON "member".id_kec = reg_districts."id" 
                AND reg_regencies."id" = reg_districts.regency_id
                LEFT JOIN reg_villages ON reg_districts."id" = reg_villages.district_id 
                AND "member".id_desa = reg_villages."id" 
            WHERE
                ktp.confirmed = FALSE and ktp.verified = FALSE OR ktp.verified IS NULL`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.status(500).json(response.error(500))
    }
}

exports.getKtpDiTolak = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw`
        SELECT
            "ktp"."id",
            "ktp".nik,
            "ktp".nama,
            "ktp".alamat,
            ktp.jenis_kelamin,
	        ktp.verified,
            ktp.alasan_penolakan,
            "reg_provinces"."name" as provinsi,
            "reg_regencies"."name" as kabupaten,
            reg_districts."name" as kecamatan,
	        reg_villages."name" as desa
        FROM
            ktp
                INNER JOIN "member" ON ktp.nik = "member".nik
                INNER JOIN reg_provinces ON "member".id_prov = reg_provinces."id"
                INNER JOIN reg_regencies ON "member".id_kab = reg_regencies."id" 
                AND reg_provinces."id" = reg_regencies.province_id
                LEFT JOIN reg_districts ON "member".id_kec = reg_districts."id" 
                AND reg_regencies."id" = reg_districts.regency_id
                LEFT JOIN reg_villages ON reg_districts."id" = reg_villages.district_id 
                AND "member".id_desa = reg_villages."id" 
            WHERE
                ktp.confirmed = TRUE and ktp.verified = FALSE OR ktp.verified IS NULL`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.verifikasiKtp = async (req, res) => {
    try {
        console.log(req.body)
        await prisma.ktp.update({
            where: {
                nik: req.params.nik
            },
            data: {
                verified: req.body.status,
                confirmed: true,
                alasan_penolakan: req.body.alasan_penolakan
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getMemberAktif = async (req, res) => {
    const key = `${req.query.filter}`;
    const role = req.query.role
    const prov = `${req.query.prov}`;
    const kab = `${req.query.kab}`;
    const kec = `${req.query.kec}`;
    const desa = `${req.query.desa}`;
    const perpage = `${Number(req.query.perpage)}`;
    const page = `${Number(req.query.page)}`;
    await helpers.paginateMember(key, role, prov, kab, kec, desa, perpage, page, res)
}

exports.getMemberAktifByNik = async (req, res) => {
    try {
        const getData = await prisma.ktp.findFirst({
            where: {
                nik: req.params.id
            },
            include: {
                member: {
                    include: {
                        role_member: {
                            where: {
                                status: '1'
                            },
                            include: {
                                role: true
                            }
                        }
                    }
                }
            }
        })
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getAllMember = async (req, res) => {
    try {
        let query
        if (req.query.filter) {
            query.where = { nama: req.query.filter }
        }
        console.log(query)
        const getData = await prisma.ktp.findMany({
            // query,
            include: {
                member: {
                    include: {
                        role_member: {
                            include: {
                                role: true
                            }
                        }
                    }
                }
            },
            skip: (Number(req.query.page) - 1) * Number(req.query.perpage),
            take: Number(req.query.perpage),
            orderBy: {
                id: 'asc',
            },
        })
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getMemberByIdRole = async (req, res) => {
    try {
        const id = Number(req.params.id)
        const data = await prisma.$queryRaw`SELECT * from v_member_role where id_role = ${id}`;

        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

//======
exports.updateStatusRoleAllMember = async (req, res) => {
    try {
        const data = req.body.data
        const status = req.body.status
        let doing
        let listNik = []
        for (nik of data) {
            listNik.push(nik.id)
        }
        console.log(listNik);
        console.log(status);
        if (status == '1') {
            doing = await prisma.role_member.updateMany({
                where: {
                    id: {
                        in: listNik
                    }
                },
                data: {
                    status: '1'
                }
            })
        } else if (status == '0') {
            doing = await prisma.role_member.updateMany({
                where: {
                    id: {
                        in: listNik
                    }
                },
                data: {
                    status: '0'
                }
            })
        } else {
            doing = await prisma.role_member.updateMany({
                where: {
                    id: {
                        in: listNik
                    }
                },
                data: {
                    status: '2'
                }
            })
        }

        if (doing) {
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }

    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.verifikasiAllKtp = async (req, res) => {
    try {
        const data = req.body.data
        let listNik = []
        for (d of data) {
            listNik.push(d.nik)
        }
        console.log(listNik);
        await prisma.ktp.updateMany({
            where: {
                nik: {
                    in: listNik
                }
            },
            data: { verified: req.body.status, confirmed: true }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const user = await prisma.users_login.update({
            where: {
                nik: req.params.nik
            },
            data: {
                password: '$2a$10$sFndEjY39HEdutWVW23wmO1PLFq.lxbc8d3aXimzDKRQ.c.Lb0GB.'
            }
        })
        res.json(response.successData(`Berhasil Reset Password ${req.params.nik}`));
    } catch (error) {
        console.log(error);
        res.json(response.error(300))
    }
};

exports.changePassword = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(data.password, salt);
        const user = await prisma.users_login.update({
            where: {
                nik: req.params.nik
            },
            data: {
                password: hash
            }
        })
        console.log(user);
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.status(400).json(response.error(400))
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const data = req.body
        const nik = req.params.nik
        console.log(data);
        // console.log(nik);
        const member = await prisma.member.update({
            where: {
                nik: nik,
            },
            data: {
                no_hp: data.member.no_hp,
                no_wa: data.member.no_hp,
                kode_pos: data.member.kode_pos,
                email: data.member.email
            }
        })
        await prisma.ktp.update({
            where: {
                nik: nik
            },
            data: {
                alamat: data.alamat
            }
        })
        const user = await prisma.ktp.findUnique({
            where: {
                nik: nik
            },
            include: {
                member: {
                    include: {
                        users_login: true,
                        reg_provinces: true,
                        reg_regencies: true,
                        reg_districts: true,
                        reg_villages: true,
                    }
                }
            }
        })
        const roleMember = await prisma.role_member.findMany({
            where: { id_member: user.member.id_member },
            include: {
                role: true
            }
        })
        let roles = []
        for (const data of roleMember) {
            roles.push(Object.assign(data.role, { status: data.status }))
        }
        user.roles = roles
        // console.log(user);
        res.json(response.successWithData(user));
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
};