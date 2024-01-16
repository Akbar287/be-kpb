const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");


/*
    *********** Start Crud Alsintan Jabatan Penyedia **********
*/
exports.inputJabatanPenyedia = async (req, res) => {
    try {
        const data = req.body
        data.created_at = await sekarang()
        data.updated_at = await sekarang()
        const query = await prisma.alsintan_jabatan_penyedia.create({
            data: data
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllJabatanPenyedia = async (req, res) => {
    try {
        const query = await prisma.alsintan_jabatan_penyedia.findMany({})

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllJabatanPenyediaById = async (req, res) => {
    try {
        const query = await prisma.alsintan_jabatan_penyedia.findUnique({
            where: {
                jabatan_id: Number(req.params.id)
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.editJabatanPenyedia = async (req, res) => {
    try {
        const data = req.body
        data.updated_at = await sekarang()
        const query = await prisma.alsintan_jabatan_penyedia.update({
            where: {
                jabatan_id: Number(req.params.id)
            },
            data: data
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Edit data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.hapusJabatanPenyedia = async (req, res) => {
    try {
        const query = await prisma.alsintan_jabatan_penyedia.delete({
            where: {
                jabatan_id: Number(req.params.id)
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Hapus data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}
/*
    *********** END Crud Alsintan Jabatan Penyedia **********
*/


/*
    *********** Start Crud Alsintan Pegawai **********
*/
exports.inputPegawaiAlsintan = async (req, res) => {
    try {
        const query = await prisma.alsintan_pegawai.create({
            data: {
                jabatan_id: Number(req.body.jabatan_id),
                member_id: Number(req.body.member_id),
                penyedia_id: Number(req.body.penyedia_id)
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllPegawaiAlsintan = async (req, res) => {
    try {
        const data = await prisma.alsintan_pegawai.findMany({
            include: {
                alsintan_jabatan_penyedia: true,
                member: true,
                master_penyedia: {
                    include: {
                        penyedia_level: true
                    }
                }
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}
/*
    *********** END Crud Alsintan PEGAWAI **********
*/

/*
    ***************** START HELPER ALSINTAN *****************
*/
exports.getMasterPenyedia = async (req, res) => {
    try {
        const query = await prisma.master_penyedia.findMany({
            include: {
                penyedia_level: true,
                master_sektor: true

            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getMemberByPegawai = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT * from v_member where access = 'pegawai_alsintan'`
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getGudang = async (req, res) => {
    try {
        // const query = await prisma.gudang_master.findMany({

        //     include: {
        //         material_stok: {
        //             include: {
        //                 manajemen_inventory: {
        //                     include: {
        //                         material_master: true,
        //                         serial_number: {
        //                             include: {
        //                                 material_master: {
        //                                     include: {
        //                                         penyedia_material: {
        //                                             include: {
        //                                                 penyedia_material_harga: true,
        //                                                 master_penyedia: true
        //                                             }
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // })
        const query = await prisma.master_penyedia.findMany({
            include: {
                penyedia_level: true,
                master_sektor: true,
                penyedia_material: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getGudangByIdMember = async (req, res) => {
    try {
        const query = await prisma.gudang_master.findMany({
            where: {
                member_id: Number(req.params.id),
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getBarangGudangMember = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)} and id_gudang = ${(Number(req.params.idgudang))} and mm_nama ILIKE  ${'%' + req.query.search + '%'} limit ${Number(req.query.perpage)} OFFSET ${(Number(req.query.page) - 1) * Number(req.query.perpage)}`
        const total = await prisma.$queryRaw` SELECT count(*) FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)} and id_gudang = ${(Number(req.params.idgudang))}`


        const lokagen = []
        for (let i = 0; i < getData.length; i++) {
            const cekagen = await prisma.reg_regencies.findMany({
                where: {
                    id: getData[i].id_kab,
                }
            })
            Object.assign(getData[i], {
                kabagen: cekagen[0].name
            })

            lokagen.push(getData[i])
        }


        res.json(response.commonSuccessDataPaginate(lokagen, total[0].count, Number(req.query.page), Number(req.query.perpage)))


    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getMaterialMaster = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_material_master WHERE kategori_id = 1 and mm_nama ILIKE  ${'%' + req.query.search + '%'} limit ${Number(req.query.perpage)} OFFSET ${(Number(req.query.page) - 1) * Number(req.query.perpage)}`
        const total = await prisma.$queryRaw` SELECT count(*) FROM v_alsintan_material_master WHERE kategori_id = 1`

        res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(req.query.page), Number(req.query.perpage)))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getMaterialMasterDetail = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_material_master WHERE mm_id = ${Number(req.params.id)}`
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.inputStokMMKeGudang = async (req, res) => {
    try {
        const stok = req.body[0]
        stok.harga_id = Number(stok.harga_id.id_harga)
        stok.created_at = await sekarang()
        stok.update_at = await sekarang()
        stok.id_agen = Number(stok.id_agen.id_member)
        // console.log(stok.id_agen)

        const cekdata = await prisma.alsintan_brigade_stok.findMany({
            where: {
                id_member: stok.id_member,
                id_gudang: stok.id_gudang,
                id_mm: stok.id_mm,
                id_agen: stok.id_agen
            }
        })
        if (cekdata.length > 0) {
            var idstok = cekdata[0].id_stok
            const query = await prisma.alsintan_brigade_stok.update({
                where: {
                    id_stok: Number(cekdata[0].id_stok)
                },
                data: {
                    harga_id: stok.harga_id,
                    update_at: await sekarang()
                }
            })
        } else {
            const query = await prisma.alsintan_brigade_stok.create({
                data: stok
            })

            var idstok = query.id_stok
        }

        const listserialnumber = req.body[1].map(r => {
            return {
                stok_id: Number(idstok),
                serial_number: r.serial_number,
                status_dipinjam: false,
                created_at: stok.created_at,
                keterangan: r.keterangan
            }
        })
        for (let i = 0; i < listserialnumber.length; i++) {
            await prisma.alsintan_brigade_sn.create({
                data: listserialnumber[i]
            })
        }
        res.json(response.success(200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getSerialNumber = async (req, res) => {
    try {
        const query = await prisma.alsintan_brigade_stok.findMany({
            where: {
                id_mm: Number(req.params.idmm),
                id_gudang: Number(req.params.idgudang),
                id_member: Number(req.params.idmember),
                id_agen: Number(req.params.idagen)
            }
        })

        const sn = await prisma.alsintan_brigade_sn.findMany({
            where: {
                stok_id: {
                    in: query[0].id_stok
                },
            }
        })
        const harga = await prisma.alsintan_master_harga.findUnique({
            where: {
                id_harga: query[0].harga_id
            }
        })

        res.json(response.successWithData([sn, harga], 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.editSerialNumber = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.alsintan_brigade_sn.update({
            where: {
                id_sn: Number(req.params.id)
            },
            data: data
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Edit data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}
exports.inputSNOnly = async (req, res) => {
    try {
        const data = req.body
        data.status_dipinjam = false
        data.created_at = await sekarang()
        const query = await prisma.alsintan_brigade_sn.create({
            data: data
        })
        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}
/*
    **************** END HELPER ALSINTAN **********************
*/

/*
    ***************** START TOOLS MEMBER ALSINTAN *****************
*/

exports.simpanAgen = async (req, res) => {
    const datas = req.body
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
                alamat: datas.alamat,
                jenis_kelamin: datas.jenis_kelamin,
                verified: false,
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
                    no_hp: datas.no_hp,
                    id_prov: datas.id_prov,
                    id_kab: datas.id_kab,
                    id_kec: datas.id_kec,
                    id_desa: datas.id_desa,
                    kode_pos: datas.kode_post,
                    email: datas.email,
                    created_at: await sekarang(),
                    updated_at: await sekarang()
                }
                const cariUsers = await prisma.users_login.findFirst({ orderBy: [{ 'id_users': 'desc' }] })
                const dataUsers = {
                    id_users: cariUsers.id_users + 1n,
                    nik: createKtp.nik,
                    password: hash,
                    status: "Aktiv",
                    access: 'agenalsintan',
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
        res.status(500).json(response.error(500))
    }
}

exports.detailAgen = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_member WHERE nik = ${req.params.nik}`
        const dataDetail = []

        const cariMember = await prisma.member.findUnique({
            where: {
                'nik': req.params.nik
            }
        })

        Object.assign(getData[0], {
            email: cariMember.email,
            kode_post: cariMember.kode_pos,
            no_hp: cariMember.no_hp,
        })
        dataDetail.push(getData[0])

        res.json(response.successWithData(dataDetail, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getAllAgen = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_member WHERE access = 'agenalsintan'`
        res.json(response.successWithData(getData, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getSummaryAgen = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_summary_agen WHERE alsin_id_agen = ${Number(req.params.id)}`
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getDataPeminjamanAgen = async (req, res) => {

    try {

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                alsin_id_agen: Number(req.params.idagen),
                permohonan_status_pinjam: Number(req.params.status)
            }
        })
        const detail = []
        for (let i = 0; i < query.length; i++) {

            const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query[i].member_id_pemohon}`
            const cekdetail = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`
            Object.assign(query[i], {
                barang_detail: cekdetail[0],
                member_detail: member[0]
            })
            detail.push(query[i])

        }
        res.json(response.successWithData(detail, 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.filterRekapLaporan = async (req, res) => {

    // console.log(date)
    try {
        const str = req.body.tanggalmulai;
        const [year, month, day] = str.split('/');
        const datemulai = new Date(+year, +month - 1, +day + 1);

        const str2 = req.body.tanggalakhir;
        const [year2, month2, day2] = str2.split('/');
        const dateakhir = new Date(+year2, +month2 - 1, +day2 + 1);

        const getIdStok = await prisma.$queryRaw` SELECT id_stok FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)}`

        let id = []
        for (let i = 0; i < getIdStok.length; i++) {

            id.push(getIdStok[i].id_stok)
        }

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                permohonan_status_pinjam: Number(req.body.permohonan_status_pinjam),
                permohonan_stok_id: { in: id },
                created_at: {
                    gte: datemulai,
                    lte: dateakhir,
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        // const query = await prisma.$queryRaw` SELECT * FROM alsintan_permohonan_peminjaman WHERE permohonan_status_pinjam = ${Number(req.body.permohonan_status_pinjam)}  AND  created_at BETWEEN  ${datemulai} AND ${dateakhir} ORDER BY created_at ASC `
        console.log(query)
        const detail = []
        for (let i = 0; i < query.length; i++) {

            const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query[i].member_id_pemohon}`

            const barang = await prisma.$queryRaw` SELECT mm_nama,mm_merk FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`

            Object.assign(query[i], {
                member_detail: member[0],
                barang_detail: barang[0]
            })
            detail.push(query[i])
        }

        res.json(response.successWithData(detail, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getAllMasterStatusLogTransaksi = async (req, res) => {

    try {
        const query = await prisma.alsintan_masterlogtransaksi.findMany({})

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getAllMasterHarga = async (req, res) => {

    try {
        const query = await prisma.alsintan_master_harga.findMany({})

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getMasterHargaID = async (req, res) => {

    try {
        const query = await prisma.alsintan_master_harga.findMany({
            where: {
                id_harga: Number(req.params.id),
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getMasterHargabyIdStok = async (req, res) => {

    try {
        const idstok = await prisma.alsintan_brigade_stok.findUnique({
            where: {
                id_stok: Number(req.params.id),
            }
        })


        const query = await prisma.alsintan_master_harga.findUnique({
            where: {
                id_harga: Number(idstok.harga_id),
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getMasterHargaUpdate = async (req, res) => {

    try {
        const data = req.body

        const query = await prisma.alsintan_master_harga.update({
            where: {
                id_harga: Number(req.params.id)
            },
            data: {
                harga: Number(data.harga),
                satuan_harga: data.satuan_harga
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Update data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getMasterHargaDelete = async (req, res) => {

    try {
        const query = await prisma.alsintan_master_harga.delete({
            where: {
                id_harga: Number(req.params.id),
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getMasterHargaCreate = async (req, res) => {

    try {
        const data = req.body

        const query = await prisma.alsintan_master_harga.create({
            data: {
                harga: Number(data.harga),
                satuan_harga: data.satuan_harga,
                created_at: await sekarang()
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Simpan data gagal', 400))
        }

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

//-----------------member

exports.getMMForMember = async (req, res) => {

    try {
        // console.log(req.params.idkab)
        const query = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE (gudang_status = ${true}) and (mm_nama ILIKE  ${'%' + req.query.search + '%'} or mm_merk ILIKE  ${'%' + req.query.search + '%'} or gudang_nama ILIKE  ${'%' + req.query.search + '%'} or id_kab ILIKE  ${'%' + req.query.search + '%'})
                                                limit ${Number(req.query.perpage)} OFFSET ${(Number(req.query.page) - 1) * Number(req.query.perpage)}`

        // console.log(query)
        const daftarmm = []
        for (let i = 0; i < query.length; i++) {

            const cekstok = await prisma.alsintan_brigade_sn.aggregate({
                where: {
                    stok_id: Number(query[i].id_stok),
                    status_dipinjam: false
                },
                _count: {
                    stok_id: true
                }
            })
            const harga = await prisma.alsintan_master_harga.findUnique({
                where: {
                    id_harga: Number(query[i].harga_id)
                }
            })

            const kabupaten = await prisma.reg_regencies.findUnique({
                where: {
                    id: query[i].id_kab
                }
            })
            // console.log(harga.harga)
            Object.assign(query[i], {
                stok_ready: cekstok._count.stok_id,
                harga: harga.harga,
                satuan_harga: harga.satuan_harga,
                kabupaten: kabupaten.name
            })
            daftarmm.push(query[i])

        }
        const total = await prisma.$queryRaw` SELECT count(*)  FROM v_alsintan_gudang_barang_member WHERE mm_status = ${true}`

        res.json(response.commonSuccessDataPaginate(daftarmm, total[0].count, Number(req.query.page), Number(req.query.perpage)))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getSummaryMember = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_summary_member WHERE member_id_pemohon = ${Number(req.params.id)}`
        res.json(response.successWithData(getData[0], 200))
        // console.log(getData[0])
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

/*
    **************** END TOOLS MEMBER ALSINTAN **********************
*/

/*
    **************** TRANSAKSI MEMBER ALSINTAN **********************
*/
exports.inputPengajuanPeminjaman = async (req, res) => {

    try {
        const data = JSON.parse(req.body.data)

        // console.log(req.files.FileKTP[0].filename)
        if (req.files.FileKTP[0].filename === undefined) {
            data.permohonan_file_ktp = 'pagenotfound.png'
        } else {
            data.permohonan_file_ktp = req.files.FileKTP[0].filename
        }

        if (req.files.FileSuratPermohonan[0].filename === undefined) {
            data.permohonan_file_suratpermohonan = 'pagenotfound.png'
        } else {
            data.permohonan_file_suratpermohonan = req.files.FileSuratPermohonan[0].filename
        }

        if (req.files.FileRekomendasi[0].filename === undefined) {
            data.permohonan_file_rekomendasi = null
        } else {
            data.permohonan_file_rekomendasi = req.files.FileRekomendasi[0].filename
        }
        data.permohonan_status_pinjam = Number(1)
        data.permohonan_jumlah_barang = Number(data.permohonan_jumlah_barang)
        data.permohonan_stok_id = Number(data.permohonan_stok_id)
        data.created_at = await sekarang()
        let date_pinjam = new Date(data.permohonan_tgl_pinjam)
        let date_kembali = new Date(data.permohonan_tgl_kembali)
        data.permohonan_tgl_pinjam = new Date(date_pinjam.setDate(date_pinjam.getDate() + 1))
        data.permohonan_tgl_kembali = new Date(date_kembali.setDate(date_kembali.getDate() + 1))

        const query = await prisma.alsintan_permohonan_peminjaman.create({
            data: data
        })
        if (query) {
            log_alsintan(data.permohonan_status_pinjam, data.member_id_pemohon, query.permohonan_id)
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.uploadSuratJalan = async (req, res) => {

    try {
        const data = JSON.parse(req.body.data)
        // console.log(req.file.filename)

        if (req.file.filename === undefined) {
            data.surat_jalan = 'pagenotfound.png'
        } else {
            data.surat_jalan = req.file.filename
        }

        const query = await prisma.alsintan_permohonan_peminjaman.update({
            where: {
                permohonan_id: Number(req.params.id)
            },
            data: {
                surat_jalan: data.surat_jalan,
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getRiwayatPengajuanMember = async (req, res) => {

    try {

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                member_id_pemohon: Number(req.params.idmember),
                permohonan_status_pinjam: Number(req.params.status)
            }
        })
        const detail = []
        for (let i = 0; i < query.length; i++) {

            const cekdetail = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`
            Object.assign(query[i], {
                mm_detail: cekdetail[0],
            })
            detail.push(query[i])

        }
        res.json(response.successWithData(detail, 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getDetailRiwayatPengajuanMember = async (req, res) => {

    try {

        const query = await prisma.alsintan_permohonan_peminjaman.findUnique({
            where: {
                permohonan_id: Number(req.params.id),
            }
        })
        // console.log(query)
        const detail = []

        // for (i in query){

        const cekdetail = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query.permohonan_stok_id}`
        const getDesa = await prisma.reg_villages.findUnique({
            where: {
                id: query.permohonan_desa_id
            }
        })
        Object.assign(query, {
            mm_detail: cekdetail[0],
            desa: getDesa.name
        })
        detail.push(query)

        // }
        res.json(response.successWithData(detail[0], 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getLogTransaksi = async (req, res) => {

    try {
        let logmaster = []

        const query = await prisma.alsintan_log_transaksi.findMany({
            where: {
                member_id: Number(req.params.idmember),
                id_permohonan: Number(req.params.idtr)
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        for (let i = 0; i < query.length; i++) {

            const getlog = await prisma.alsintan_masterlogtransaksi.findUnique({
                where: {
                    id: Number(query[i].log_status)
                },
            })

            Object.assign(query[i], {
                log_dtl_status: getlog.log_dtl_status,
                log_keterangan: getlog.log_keterangan
            })
            logmaster.push(query[i])

        }

        res.json(response.successWithData(logmaster, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

const log_alsintan = async (status, member, idtr) => {

    await prisma.alsintan_log_transaksi.create({
        data: {
            log_status: Number(status),
            created_at: await sekarang(),
            member_id: Number(member),
            id_permohonan: Number(idtr)
        }
    })
}


// DATA TRANSAKSI BRIGADE

exports.getBrigadePengajuanBaru = async (req, res) => {
    try {
        const getIdStok = await prisma.$queryRaw` SELECT id_stok FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)}`

        let id = []
        for (let i = 0; i < getIdStok.length; i++) {

            id.push(getIdStok[i].id_stok)
        }

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                OR: [
                    { permohonan_status_pinjam: 1 }
                ],
                permohonan_stok_id: { in: id }
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        const detail = []
        for (let i = 0; i < query.length; i++) {

            const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query[i].member_id_pemohon}`
            const barang = await prisma.$queryRaw` SELECT mm_nama,mm_merk FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`

            Object.assign(query[i], {
                member_detail: member[0],
                barang_detail: barang[0]
            })
            detail.push(query[i])
        }

        res.json(response.successWithData(detail, 200))
        console.log(detail)
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getBrigadePengajuanMM = async (req, res) => {
    try {
        const getIdStok = await prisma.$queryRaw` SELECT id_stok FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)} and id_gudang = ${Number(req.params.idgudang)} and  id_mm = ${Number(req.params.idmm)} and  id_agen = ${Number(req.params.idagen)}`

        let id = []
        for (let i = 0; i < getIdStok.length; i++) {

            id.push(getIdStok[i].id_stok)
        }

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                OR: [
                    { permohonan_status_pinjam: Number(req.params.status) }
                ],
                permohonan_stok_id: { in: id }
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        const detail = []
        for (let i = 0; i < query.length; i++) {

            const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query[i].member_id_pemohon}`
            const barang = await prisma.$queryRaw` SELECT mm_nama,mm_merk FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`

            Object.assign(query[i], {
                member_detail: member[0],
                barang_detail: barang[0]
            })
            detail.push(query[i])
        }

        res.json(response.successWithData(detail, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getBrigadeRiwayatPengajuan = async (req, res) => {
    try {
        const getIdStok = await prisma.$queryRaw` SELECT id_stok FROM v_alsintan_gudang_barang_member WHERE id_member = ${Number(req.params.idmember)}`

        let id = []
        for (let i = 0; i < getIdStok.length; i++) {

            id.push(getIdStok[i].id_stok)
        }

        const query = await prisma.alsintan_permohonan_peminjaman.findMany({
            where: {
                permohonan_status_pinjam: Number(req.params.statuspinjam),
                permohonan_stok_id: { in: id }
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        const detail = []
        for (let i = 0; i < query.length; i++) {

            const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query[i].member_id_pemohon}`

            const barang = await prisma.$queryRaw` SELECT mm_nama,mm_merk FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query[i].permohonan_stok_id}`

            Object.assign(query[i], {
                member_detail: member[0],
                barang_detail: barang[0]
            })
            detail.push(query[i])
        }

        res.json(response.successWithData(detail, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getBrigadeDetailPengajuanPermohonan = async (req, res) => {

    try {

        const query = await prisma.alsintan_permohonan_peminjaman.findUnique({
            where: {
                permohonan_id: Number(req.params.id)
            }
        })

        const detail = []

        const member = await prisma.$queryRaw` SELECT nama,kecamatan,kabupaten FROM v_member WHERE id_member = ${query.member_id_pemohon}`
        const barang = await prisma.$queryRaw` SELECT * FROM v_alsintan_gudang_barang_member WHERE id_stok = ${query.permohonan_stok_id}`
        const getDesa = await prisma.reg_villages.findUnique({
            where: {
                id: query.permohonan_desa_id
            }
        })
        Object.assign(query, {
            member_detail: member[0],
            barang_detail: barang[0],
            desa: getDesa.name
        })
        detail.push(query)

        res.json(response.successWithData(detail[0], 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getStokPeminjaman = async (req, res) => {

    try {

        const query = await prisma.alsintan_brigade_sn.findMany({
            where: {
                stok_id: Number(req.params.id),
                status_dipinjam: false
            }
        })

        res.json(response.successWithData(query, 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.simpanApprovePeminjaman = async (req, res) => {
    try {
        const data = req.body
        data.total_harga = Number(data.lama_sewa) * Number(data.harga) - Number(data.potongan)
        for (let i = 0; i < data.sn_id.length; i++) {
            // console.log(data.sn_id[i].id_sn)
            await prisma.alsintan_persetujuan.create({
                data: {
                    permohonan_id: Number(data.permohonan_id),
                    sn_id: Number(data.sn_id[i].id_sn),
                    pegawai_alsin_id: Number(data.pegawai_alsin_id)
                }
            })
            // await prisma.alsintan_brigade_sn.update({
            //      where: {
            //          id_sn: Number(data.sn_id[i].id_sn)
            //      },
            //      data: {
            //          status_dipinjam : true
            //      }
            //  })

        }

        await prisma.alsintan_permohonan_peminjaman.update({
            where: {
                permohonan_id: Number(data.permohonan_id)
            },
            data: {
                permohonan_jumlah_barang: Number(data.sn_id.length),
                permohonan_status_pinjam: Number(2),
                alsin_id_pegawai: Number(data.pegawai_alsin_id),
                feedback_brigade: data.feedback_brigade,
                alsin_id_agen: Number(data.alsin_id_agen.id_member),
                harga_total: Number(data.total_harga),
                lama_sewa: Number(data.lama_sewa),
                potongan: Number(data.potongan)

            }
        })

        log_alsintan(2, data.id_pemohon, data.permohonan_id)
        res.json(response.success(200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getDataSerialNumberApprove = async (req, res) => {
    try {

        const getdata = await prisma.alsintan_persetujuan.findMany({
            where: {
                permohonan_id: Number(req.params.idpermohonan)
            }
        })

        const sndetail = []
        for (let i = 0; i < getdata.length; i++) {

            const getsn = await prisma.alsintan_brigade_sn.findMany({
                where: {
                    id_sn: Number(getdata[i].sn_id)
                }
            })
            Object.assign(getdata[i], {
                data_sn: getsn
            })
            sndetail.push(getdata[i])

        }

        res.json(response.successWithData(sndetail, 200))

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.simpanRejectPermohonan = async (req, res) => {

    try {
        const data = req.body

        const query = await prisma.alsintan_permohonan_peminjaman.update({
            where: {
                permohonan_id: Number(data.permohonan_id)
            },
            data: {
                permohonan_status_pinjam: Number(9),
                alsin_id_pegawai: Number(data.pegawai_alsin_id),
                feedback_brigade: data.feedback_brigade
            }
        })

        if (query) {
            log_alsintan(9, data.id_pemohon, data.permohonan_id)
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.UpdateKeteranganPermohonan = async (req, res) => {

    try {
        const data = req.body

        const query = await prisma.alsintan_permohonan_peminjaman.update({
            where: {
                permohonan_id: Number(data.permohonan_id)
            },
            data: {
                feedback_brigade: data.feedback_brigade
            }
        })

        if (query) {
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}


exports.konfirmasiSampai = async (req, res) => {

    try {
        const query = await prisma.alsintan_permohonan_peminjaman.update({

            where: {
                permohonan_id: Number(req.params.idtr)
            },
            data: {
                permohonan_status_pinjam: Number(3),
            }
        })

        if (query) {
            log_alsintan(6, req.params.idpemohon, req.params.idtr)
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.UpdateStatusPeminjaman = async (req, res) => {

    try {
        const query = await prisma.alsintan_permohonan_peminjaman.update({

            where: {
                permohonan_id: Number(req.params.idtr)
            },
            data: {
                permohonan_status_pinjam: Number(req.params.status),
            }
        })

        const getsn = await prisma.alsintan_persetujuan.findMany({
            where: {
                permohonan_id: Number(req.params.idtr)
            }
        })

        // if(req.params.status == 4) {
        //     await prisma.alsintan_log_transaksi.create({
        //         data: {
        //             log_status : Number(3),
        //             created_at : await sekarang(),
        //             member_id: Number(req.params.idpemohon),
        //             id_permohonan: Number(req.params.idtr)
        //         }
        //     })
        // }else
        if (req.params.status == 5) {


            for (let i = 0; i < getsn.length; i++) {
                await prisma.alsintan_brigade_sn.update({

                    where: {
                        id_sn: Number(getsn[i].sn_id)
                    },
                    data: {
                        status_dipinjam: true
                    }
                })
            }

        } else if (req.params.status == 7) {


            for (let i = 0; i < getsn.length; i++) {
                await prisma.alsintan_brigade_sn.update({

                    where: {
                        id_sn: Number(getsn[i].sn_id)
                    },
                    data: {
                        status_dipinjam: false
                    }
                })
            }

        }



        if (query) {
            log_alsintan(req.params.status, req.params.idpemohon, req.params.idtr)
            res.json(response.success(200))
        } else {
            res.json(response.errorWithData('Input data gagal', 400))
        }

    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }

}

exports.getSummaryBrigade = async (req, res) => {
    try {
        const getData = await prisma.$queryRaw` SELECT * FROM v_alsintan_summary_brigade WHERE id_member = ${Number(req.params.id)}`
        res.json(response.successWithData(getData[0], 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}


/*
    **************** END TRANSAKSI MEMBER ALSINTAN **********************
*/

//================================================== function =======================================================
const cekMember = (nik) =>
    new Promise(async (resolve, reject) => {
        await prisma.ktp.findUnique({ where: { nik: nik }, include: { member: { include: { users_login: true } } } })
            .then((cekUser) => {
                resolve(cekUser)
            }).catch(err => {
                console.log(err)
                reject(err)
            })
    })