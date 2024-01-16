const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const xlsxtojson = require("xlsx-to-json-lc");
const { response, sekarang, uploadFiles } = require('../utils/utils');
const path = require('path');
const fs = require('fs');
const helpers = require('../helpers/Helpers')

exports.landingpage = async (req, res) => {
    try {
        // const listMember = await prisma.ktp.findMany({
        //     where: {
        //         verified: true
        //     }
        // })
        // const listPoktan = await prisma.pubers_poktan.findMany({})
        // const listKios = await prisma.pubers_kios.findMany({})
        // const result = {
        //     member: listMember.length,
        //     poktan: listPoktan.length,
        //     kios: listKios.length
        // }
        const result = await prisma.$queryRaw`SELECT * from v_landing_page`
        res.json(response.successWithData(result[0]))
    } catch (error) {
        console.log(error);
        res.json((response.error))
    }
}

exports.updateDateAlokasi = async (req, res) => {
    try {
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        let dataError = []
        let dataSuccess = []
        for (const data of fileExcel) {
            if (data.nik.length !== 0) {
                data.nik = data.nik.replace(/['"]+/g, "");
                data.tgl = data.tgl.split(' ')
                data.tgl = `${data.tgl[0]}T${data.tgl[1]}Z`
                const poktan = await prisma.pubers_poktan.findMany({
                    where: {
                        nik_poktan: data.nik
                    }
                })
                if (poktan.length > 1) {
                    dataError.push({
                        nik: data.nik,
                        message: 'Error Duplicate Nik'
                    })
                }
                const master = await prisma.pubers_master_transaksi.findFirst({
                    where: {
                        poktan_id: poktan[0].poktan_id,
                        totalUrea: Number(data.urea),
                        totalNpk: Number(data.npk)
                    }
                })
                await prisma.pubers_master_transaksi.updateMany({
                    where: {
                        transaksi_id: poktan[0].transaksi_id
                    },
                    data: {
                        created_at: data.tgl
                    }
                })
                await prisma.pubers_chld_transaksi.updateMany({
                    where: {
                        transaksi_id: poktan[0].transaksi_id
                    },
                    data: {
                        created_at: data.tgl
                    }
                })
                await prisma.pubers_history_master_transaksi.updateMany({
                    where: {
                        transaksi_id: poktan[0].transaksi_id
                    },
                    data: {
                        tanggalstatus: data.tgl
                    }
                })
                dataSuccess.push(master)
            }
        }
        res.json({
            message: 'Successfully',
            dataleng: dataSuccess.length,
            data: dataSuccess,
            dataError: dataError
        })
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.clearKTP = async (req, res) => {
    try {
        const data = await prisma.$queryRaw`SELECT * FROM ktp left join member on ktp.nik = member.nik where member.id_member is null`
        for (const d of data) {
            await prisma.ktp.deleteMany({
                where: {
                    id: d.id
                }
            })
        }
        res.json({
            message: 'KTP deleted successfully',
            length: data.length,
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.checkIntegrated = async (req, res) => {
    try {
        const data = await prisma.okkpd_berkas_pengujian_lab.findMany({})
        let dumpSampah = []
        for (const d of data) {
            const adaBerkas = await prisma.okkpd_berkas_permohonan.findFirst({
                where: {
                    id_berkas_pengujian_lab: d.id_persyaratan_sc_hc
                }
            })
            if (!adaBerkas) {
                dumpSampah.push(d)
            }
        }
        const datapenilaian = await prisma.okkpd_form_penilaian.findMany({})
        let dumpSampahPenilaian = []
        for (const d of datapenilaian) {
            const adaBerkas = await prisma.okkpd_berkas_permohonan.findFirst({
                where: {
                    id_form_penilaian: d.id_form_penilaian
                }
            })
            if (!adaBerkas) {
                dumpSampahPenilaian.push(d)
            }
        }
        for (const s of dumpSampah) {
            await prisma.okkpd_berkas_pengujian_lab.deleteMany({
                where: {
                    id_persyaratan_sc_hc: s.id_persyaratan_sc_hc
                }
            })
        }
        for (const s of dumpSampahPenilaian) {
            await prisma.okkpd_form_penilaian.deleteMany({
                where: {
                    id_form_penilaian: s.id_form_penilaian
                }
            })
        }
        res.json({
            message: 'ketemu',
            data: {
                ujilab: dumpSampah,
                Banyak_ujilab: dumpSampah.length,
                penilaian: dumpSampahPenilaian,
                Banyak_penilaian: dumpSampahPenilaian.length
            }
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.clearOkkpd = async (req, res) => {
    try {
        const formPengajuan = await prisma.okkpd_form_permohonan.findMany({
            where: {
                OR: [
                    {
                        nik: '000000'
                    },
                    {
                        nik: '1817161718210001'
                    },
                    {
                        nik: '1817161718210012'
                    },
                    {
                        nik: '1801041504000005'
                    },
                    {
                        nik: '131313'
                    }
                ]
            },
            include: {
                okkpd_berkas_permohonan: {
                    include: {
                        okkpd_chld_berkas_permohonan: true,
                        okkpd_berkas_pengujian_lab: true
                    }
                }
            }
        })
        let daftarFile = []
        for (const pengajuan of formPengajuan) {
            daftarFile.push(pengajuan.shm)
            daftarFile.push(pengajuan.ktp)
            daftarFile.push(pengajuan.npwp)
            daftarFile.push(pengajuan.nib)
            for (const berkas of pengajuan.okkpd_berkas_permohonan) {
                daftarFile.push(berkas.surat_permohonan)
                daftarFile.push(berkas.informasi_produk)
                daftarFile.push(berkas.dokumen_eksport)
                daftarFile.push(berkas.file_blanko)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.surat_sc_hc)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.sppb)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.okratoksin)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.aflatoksin)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.residu_pestisida)
                daftarFile.push(berkas.okkpd_berkas_pengujian_lab.organoleptik_proksimat)
                for (const file of berkas.okkpd_chld_berkas_permohonan) {
                    daftarFile.push(file.file)
                }
            }
        }
        for (const pengajuan of formPengajuan) {
            for (const berkas of pengajuan.okkpd_berkas_permohonan) {
                await prisma.okkpd_chld_berkas_permohonan.deleteMany({
                    where: {
                        id_berkas_permohonan: berkas.id_berkas_permohonan
                    }
                })
                await prisma.okkpd_berkas_permohonan.deleteMany({
                    where: {
                        id_berkas_permohonan: berkas.id_berkas_permohonan
                    }
                })
                await prisma.okkpd_berkas_pengujian_lab.deleteMany({
                    where: {
                        id_persyaratan_sc_hc: berkas.id_berkas_pengujian_lab
                    }
                })
                await prisma.okkpd_form_penilaian.deleteMany({
                    where: {
                        id_form_penilaian: berkas.id_form_penilaian
                    }
                })
            }
            await prisma.okkpd_form_permohonan.deleteMany({
                where: {
                    id_form_permohonan: pengajuan.id_form_permohonan
                }
            })
        }
        const filter = daftarFile.filter(item => item !== null)
        for (const f of filter) {
            const filePath = path.join('./public/okkpd/', f);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log(`File '${f}' tidak ditemukan.`);
                } else {
                    fs.unlinkSync(`./public/okkpd/${f}`)
                }
            });
        }
        daftarFile = filter
        res.json({
            message: 'Berhasil',
            data: formPengajuan,
            files: daftarFile
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.clearSpace = async (req, res) => {
    try {
        const listMembers = await prisma.member.findMany({
            where: {
                nik: {
                    contains: ' '
                }
            }
        })
        if (listMembers.length > 0) {
            for (const i in listMembers) {
                const member = listMembers[i]
                await prisma.users_login.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.users_login_2_17.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.users_login_ujicoba_1701.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.role_member.deleteMany({
                    where: {
                        id_member: member.id_member
                    }
                })
                await prisma.role_member_2_17.deleteMany({
                    where: {
                        id_member: member.id_member
                    }
                })
                await prisma.role_membercoba.deleteMany({
                    where: {
                        id_member: member.id_member
                    }
                })
                await prisma.pubers_kios_distributor.deleteMany({
                    where: {
                        kode_kios: member.nik
                    }
                })
                await prisma.pubers_kios.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.pubers_kios_dump13012023.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.pubers_kios_dump_17.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.pubers_kios_duplicate_nik_exam.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
                await prisma.member.deleteMany({
                    where: {
                        nik: member.nik
                    }
                })
            }
        }
        res.json({
            message: `Berhasil menghapus sebanyak ${listMembers.length}`,
            data: {
                length: listMembers.length,
            }
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.clearPetik = async (req, res) => {
    try {
        const data = await prisma.member.findMany({
            where: {
                nik: {
                    contains: "'"
                }
            }
        })
        for (d of data) {
            await prisma.users_login.deleteMany({
                where: {
                    nik: d.nik
                }
            })
            await prisma.users_login_2_17.deleteMany({
                where: {
                    nik: d.nik
                }
            })
            await prisma.users_login_ujicoba_1701.deleteMany({
                where: {
                    nik: d.nik
                }
            })
            await prisma.role_member.deleteMany({
                where: {
                    id_member: d.id_member
                }
            })
            await prisma.role_member_2_17.deleteMany({
                where: {
                    id_member: d.id_member
                }
            })
            await prisma.role_membercoba.deleteMany({
                where: {
                    id_member: d.id_member
                }
            })
        }
        await prisma.member.deleteMany({
            where: {
                nik: {
                    contains: "'"
                }
            }
        })
        await prisma.ktp.deleteMany({
            where: {
                nik: {
                    contains: "'"
                }
            }
        })
        res.json({
            message: 'Selesai menghapus data petik'
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.encryptionString = async (req, res) => {
    try {
        const key = "423F4528482B4D6251655468566D597133743677397A24432646294A404E635266556A586E5A7234753778214125442A472D4B6150645367566B59703373357638792F423F4528482B4D6251655468576D5A7134743777397A24432646294A404E635266556A586E3272357538782F413F442A472D4B6150645367566B597033"
        const data = req.body
        let result = ""
        if (data.isEnc == 1) {
            result = encrypt(data.string, key);
            console.log(result);
        } else {
            result = decrypt(data.string, key);
            console.log(result);
            const dataUser = await prisma.member.findFirst({
                where: {
                    nik: result
                }
            })
            result = dataUser
        }
        res.json(response.successWithData({
            result: result
        }))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.resetStokDummy = async (req, res) => {
    try {
        await prisma.pubers_stokkios.updateMany({
            where: {
                kode_kios: req.params.kode_kios
            },
            data: {
                NPK: 15000,
                UREA: 15000,
                NPKFK: 15000
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

/*
reset daftar sertif benih
NB: ati" dalam penggunaan, karena suka buat orang paleng :V
*/
exports.clearSertifBenih = async (req, res) => {
    try {
        await prisma.chld_history_sertifikasi_benih.deleteMany({})
        await prisma.master_sertifikasi_benih.deleteMany({})
        res.json({
            message: 'Clear Successfully'
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
};

/*
MengCreated chld transaksi yang hilang
NB: Becarefully because is not worings
*/
exports.createChldTransaksi = async (req, res) => {
    try {
        const data = req.body
        let transaksi = []
        if (data.pupuk === 'urea') {
            transaksi = await prisma.pubers_master_transaksi.findMany({
                where: {
                    poktan_id: Number(data.poktan),
                    komoditas: Number(data.komoditas),
                    masatanam: Number(data.masatanam),
                    totalNpk: Number(0),
                    totalNpkFk: Number(0)
                }
            })
        } else if (data.pupuk === 'npk') {
            transaksi = await prisma.pubers_master_transaksi.findMany({
                where: {
                    poktan_id: Number(data.poktan),
                    komoditas: Number(data.komoditas),
                    masatanam: Number(data.masatanam),
                    totalUrea: Number(0),
                    totalNpkFk: Number(0)
                }
            })
        } else {
            transaksi = await prisma.pubers_master_transaksi.findMany({
                where: {
                    poktan_id: Number(data.poktan),
                    komoditas: Number(data.komoditas),
                    masatanam: Number(data.masatanam),
                }
            })
        }

        if (transaksi.length > 1) {
            return res.json({
                message: 'Data Lebih Dari Satu'
            })
        } else {
            // Get Alokasi
            const alokasi = await prisma.pubers_ealokasi.findMany({
                where: {
                    poktan_id: Number(data.poktan),
                    masatanam: Number(data.masatanam),
                    komoditas_id: Number(data.komoditas)
                },
                orderBy: {
                    NIK: 'asc'
                }
            })

            // Get Alokasi Stok
            const alokasiStok = await prisma.pubers_ealokasi_stok.findMany({
                where: {
                    poktan_id: Number(data.poktan),
                    masatanam: Number(data.masatanam),
                    komoditas_id: Number(data.komoditas)
                },
                orderBy: {
                    NIK: 'asc'
                }
            })

            // Get Harga Pupuk
            let getHargaUrea = await prisma.pubers_pupuk.findUnique({ where: { pupuk_id: 1 } })
            let getHargaNPK = await prisma.pubers_pupuk.findUnique({ where: { pupuk_id: 2 } })
            getHargaUrea = Number(getHargaUrea.harga)
            getHargaNPK = Number(getHargaNPK.harga)

            // Decralation of Total For Check
            let totalHarga = 0;
            let totalUrea = 0;
            let totalNPK = 0;
            let totalHargaNPK = 0;
            let campuran = 0

            // Looping Brooo...
            for (let i = 0; i < alokasi.length; i++) {
                totalHarga += (Number(alokasi[i].urea) - Number(alokasiStok[i].urea)) * getHargaUrea
                totalUrea += Number(alokasi[i].urea) - Number(alokasiStok[i].urea)
                totalHargaNPK += (Number(alokasi[i].npk) - Number(alokasiStok[i].npk)) * getHargaNPK
                totalNPK += Number(alokasi[i].npk) - Number(alokasiStok[i].npk)
                campuran += ((Number(alokasi[i].urea) - Number(alokasiStok[i].urea)) * getHargaUrea) + ((Number(alokasi[i].npk) - Number(alokasiStok[i].npk)) * getHargaNPK)
                if (data.pupuk === 'urea') {
                    await prisma.pubers_chld_transaksi.create({
                        data: {
                            transaksi_id: Number(transaksi[0].transaksi_id),
                            urea: Number(alokasi[i].urea) - Number(alokasiStok[i].urea),
                            npk: 0,
                            npkfk: 0,
                            subtotal: ((Number(alokasi[i].urea) - Number(alokasiStok[i].urea)) * getHargaUrea),
                            nik: alokasi[i].NIK,
                            created_at: await sekarang()
                        }
                    })
                } else if (data.pupuk === 'npk') {
                    await prisma.pubers_chld_transaksi.create({
                        data: {
                            transaksi_id: Number(transaksi[0].transaksi_id),
                            urea: 0,
                            npk: Number(alokasi[i].npk) - Number(alokasiStok[i].npk),
                            npkfk: 0,
                            subtotal: ((Number(alokasi[i].npk) - Number(alokasiStok[i].npk)) * getHargaNPK),
                            nik: alokasi[i].NIK,
                            created_at: await sekarang()
                        }
                    })
                } else {
                    await prisma.pubers_chld_transaksi.create({
                        data: {
                            transaksi_id: Number(transaksi[0].transaksi_id),
                            urea: Number(alokasi[i].urea) - Number(alokasiStok[i].urea),
                            npk: Number(alokasi[i].npk) - Number(alokasiStok[i].npk),
                            npkfk: 0,
                            subtotal: ((Number(alokasi[i].urea) - Number(alokasiStok[i].urea)) * getHargaUrea) + ((Number(alokasi[i].npk) - Number(alokasiStok[i].npk)) * getHargaNPK),
                            nik: alokasi[i].NIK,
                            created_at: await sekarang()
                        }
                    })
                }


            }
            // Checking Total
            let tableTotal = []
            tableTotal.push(
                {
                    name: 'Total Urea',
                    key: totalUrea
                },
                {
                    name: 'Total NPK',
                    key: totalNPK
                },
                {
                    name: 'Total Harga',
                    key: totalHarga
                },
                {
                    name: 'Total Harga NPK',
                    key: totalHargaNPK
                },
                {
                    name: 'Total dari NPK + Urea',
                    key: totalHarga + totalHargaNPK
                },
                {
                    name: 'Total Full',
                    key: campuran
                },)
            console.table(tableTotal)

            return res.json({
                message: `Berhasil Upload`,
            })
        }

    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
};

// Untuk Mendapatkan Stok Kios yang digunakan oleh member poktan
exports.getStok = async (req, res) => {
    try {
        const kodeKios = req.params.id
        const kios = await prisma.pubers_stokkios.findMany({
            where: {
                kode_kios: kodeKios
            }
        })
        res.json(response.successWithData(kios));
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getResult = async (req, res) => {
    try {
        let newQuery = helpers.filterCheck(req.query);
        let querys = helpers.convertQuery(newQuery)
        const poktan = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT(pubers_poktan.nik_poktan)) FROM pubers_poktan JOIN "member" on pubers_poktan.nik_poktan = "member".nik ${querys}`)
        const alokasi = await prisma.$queryRawUnsafe(`SELECT COUNT(pubers_ealokasi."NIK") FROM pubers_ealokasi JOIN "member" on pubers_ealokasi."NIK" = "member".nik ${querys}`)
        const penebusan = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM pubers_master_transaksi JOIN pubers_poktan on pubers_master_transaksi.poktan_id = pubers_poktan.poktan_id JOIN "member" on nik_poktan = "member".nik ${querys}`)
        const kios = await prisma.$queryRawUnsafe(`SELECT COUNT(pubers_kios.kode_kios) from pubers_kios JOIN "member" on pubers_kios.nik = "member".nik ${querys}`)
        const kur = await prisma.$queryRawUnsafe(`SELECT COUNT(tr_kur) from tr_kur JOIN "member" on tr_kur.id_member = "member".id_member ${querys}`)

        let data = []
        data.push(
            {
                name: 'Pengajuan KUR',
                jumlah: Number(kur[0].count)
            }, {
            name: 'Data e-Alokasi',
            jumlah: Number(alokasi[0].count)
        }, {
            name: 'Data Penebusan',
            jumlah: Number(penebusan[0].count)
        }, {
            name: 'Kelompok Tani',
            jumlah: Number(poktan[0].count)
        }, {
            name: 'Kios Pubers',
            jumlah: Number(kios[0].count)
        }
        )
        res.json(response.successWithData(data))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

// Tembak Role
exports.tembakRole = async (req, res) => {
    try {
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        let dataError = []
        for (const data of fileExcel) {
            if (data.nik.length !== 0) {
                data.nik = data.nik.replace(/['"]+/g, "");
                const member = await prisma.member.findFirst({
                    where: {
                        nik: data.nik
                    }
                })

                const role = await prisma.role.findFirst({
                    where: {
                        id_role: Number(data.role)
                    }
                })


                if (member) {
                    const roleMember = await prisma.role_member.findMany({
                        where: {
                            id_member: member.id_member,
                            id_role: Number(data.role),
                            status: '1'
                        }
                    })

                    if (roleMember.length === 0) {
                        await prisma.role_member.create({
                            data: {
                                id_member: member.id_member,
                                id_role: Number(data.role),
                                status: '1'
                            }
                        })
                    } else {
                        dataError.push({
                            nik: data.nik,
                            keterangan: `Sudah ada role ${role.nama_role}`
                        })
                    }
                } else {
                    dataError.push({
                        nik: data.nik,
                        keterangan: 'Belum Ada di member'
                    })
                }
            }
        }
        res.json({
            message: 'Berhasil Tambah Role',
            dataError: dataError
        })
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.checkAlokasi = async (req, res) => {
    try {
        const poktanList = await prisma.pubers_poktan.findMany({
            where: {
                nik_poktan: ''
            }
        })
        let alokasi = []
        for (const poktan of poktanList) {
            const data = await prisma.pubers_ealokasi.findMany({
                where: {
                    poktan_id: Number(poktan.poktan_id)
                }
            })
            const dataStok = await prisma.pubers_ealokasi_stok.findMany({
                where: {
                    poktan_id: Number(poktan.poktan_id)
                }
            })
            if (data) {
                alokasi.push({
                    id_poktan: poktan.id_poktan,
                    dataAlokasi: data,
                    dataAlokasiStok: dataStok
                })
            }
        }
        res.json({
            poktan: alokasi
            // poktanList: poktanList,
            // banyaknya: poktanList.length
        })
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

/* 
Reset Alokasi ke semula 
NB: Tanpa Menghapus Transaksi dan chld transaksi
*/
exports.resetAlokasiSemula = async (req, res) => {
    try {
        const data = req.body
        const alokasiAsli = await prisma.pubers_ealokasi.findMany({
            where: {
                poktan_id: Number(data.idPoktan),
                kode_kios: data.kodeKios,
                komoditas_id: Number(data.komoditas),
                masatanam: Number(data.masaTanam)
            },
            orderBy: {
                NIK: 'desc'
            }
        })
        const alokasiStok = await prisma.pubers_ealokasi_stok.findMany({
            where: {
                poktan_id: Number(data.idPoktan),
                kode_kios: data.kodeKios,
                komoditas_id: Number(data.komoditas),
                masatanam: Number(data.masaTanam)
            },
            orderBy: {
                NIK: 'desc'
            }
        })
        let alokasiSama = []
        for (const d of alokasiAsli) {
            for (const s of alokasiStok) {
                if (d.NIK === s.NIK) {
                    alokasiSama.push(d)
                    await prisma.pubers_ealokasi_stok.updateMany({
                        where: {
                            poktan_id: Number(data.idPoktan),
                            kode_kios: data.kodeKios,
                            komoditas_id: Number(data.komoditas),
                            masatanam: Number(data.masaTanam),
                            luaslahan: d.luaslahan,
                            NIK: d.NIK
                        },
                        data: {
                            urea: Number(d.urea),
                            npk: Number(d.npk),
                            npkfk: Number(d.npkfk)
                        }
                    })
                }
            }
        }

        res.json({
            message: `Berhasil Reset Alokasi dari id Poktan ${data.idPoktan}, masatanam ${data.masaTanam}, dan ada ${alokasiSama.length} yang dirubah`,
            alokasi: alokasiAsli
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
}

/* 
Reset Alokasi ke semula 
NB: Menghapus Transaksi dan chld transaksi
*/
exports.resetTransaksibyIdTransaksi = async (req, res) => {
    try {
        const dataBody = req.body
        const masterTransaksi = await prisma.pubers_master_transaksi.findFirst({
            where: {
                transaksi_id: Number(dataBody.idTransaksi)
            }
        })
        const dataTransaksi = await prisma.pubers_chld_transaksi.findMany({
            where: {
                transaksi_id: Number(dataBody.idTransaksi)
            }
        })
        if (dataTransaksi.length > 0) {
            for (const datas of dataTransaksi) {

                const dataEalokasiStok = await prisma.pubers_ealokasi_stok.findFirst({
                    where: {
                        poktan_id: Number(dataBody.idPoktan),
                        masatanam: masterTransaksi.masatanam,
                        komoditas_id: masterTransaksi.komoditas,
                        kode_kios: masterTransaksi.kode_kios,
                        NIK: datas.nik
                    }
                })

                await prisma.pubers_ealokasi_stok.updateMany({
                    where: {
                        poktan_id: Number(dataBody.idPoktan),
                        masatanam: masterTransaksi.masatanam,
                        komoditas_id: masterTransaksi.komoditas,
                        kode_kios: masterTransaksi.kode_kios,
                        NIK: datas.nik
                    },
                    data: {
                        urea: Number(dataEalokasiStok.urea) + Number(datas.urea),
                        npk: Number(dataEalokasiStok.npk) + Number(datas.npk),
                        npkfk: Number(dataEalokasiStok.npkfk) + Number(datas.npkfk)
                    }
                })

                await prisma.pubers_chld_transaksi.deleteMany({
                    where: {
                        transaksi_id: Number(datas.transaksi_id),
                        nik: datas.nik
                    }
                })

            }
        }
        await prisma.pubers_history_master_transaksi.deleteMany({
            where: {
                transaksi_id: Number(dataBody.idTransaksi)
            }
        })

        await prisma.pubers_history_master_transaksi_2_17.deleteMany({
            where: {
                transaksi_id: Number(dataBody.idTransaksi)
            }
        })

        await prisma.pubers_master_transaksi.deleteMany({
            where: {
                transaksi_id: Number(dataBody.idTransaksi)
            }
        })
        res.json(response.successData(`Berhasil Reset ${dataTransaksi.length} data dari id_poktan ${dataBody.idPoktan}`))
    } catch (error) {
        console.log(error);
        res.send(500).json(response.error)
    }
}

exports.resetTransaksi = async (req, res) => {
    try {
        const nik = req.params.nik
        const poktan = await prisma.pubers_poktan.findFirst({
            where: {
                nik_poktan: nik
            }
        })
        const master_transaksi = await prisma.pubers_master_transaksi.findMany({
            where: {
                poktan_id: poktan.poktan_id
            }
        })
        let tr = []
        for (transaksi of master_transaksi) {
            tr.push(transaksi.transaksi_id)
        }
        for (t of tr) {
            await prisma.pubers_chld_transaksi.deleteMany({
                where: {
                    transaksi_id: t
                }
            })
            await prisma.pubers_history_master_transaksi.deleteMany({
                where: {
                    transaksi_id: t
                }
            })
            await prisma.pubers_master_transaksi.delete({
                where: {
                    transaksi_id: t
                }
            })
        }
        await prisma.pubers_ealokasi_stok.updateMany({
            where: {
                poktan_id: poktan.poktan_id,
                komoditas_id: 16
            },
            data: {
                urea: 100,
                npk: 100,
                npkfk: 0
            }
        })
        await prisma.pubers_ealokasi_stok.updateMany({
            where: {
                poktan_id: poktan.poktan_id,
                komoditas_id: 21
            },
            data: {
                urea: 100,
                npk: 100,
                npkfk: 100
            }
        })
        res.json(response.successData('Berhasil', 201))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
};


// Import
exports.addKios = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT kios_id FROM pubers_kios ORDER BY "kios_id" DESC LIMIT 1`
        let id = query[0].kios_id + 1n
        let kiosModel = [];
        let dataError = [];
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        for (dataExcel of fileExcel) {
            if (dataExcel.nik != "") {
                const cekKios = await prisma.pubers_kios.findFirst({
                    where: {
                        nik: String(dataExcel.nik)
                    }
                })

                if (!cekKios) {
                    kiosModel.push({
                        kios_id: id,
                        nik: dataExcel.nik,
                        nama_kios: dataExcel.nama_kios,
                        created_at: await sekarang(),
                        updated_at: await sekarang(),
                        norek_kios: null,
                        kode_kios: dataExcel.kode_kios
                    })
                    id += 1n
                }
            }
        }


        if (kiosModel.length > 0) {
            if (kiosModel.length <= 1) {
                await prisma.pubers_kios.create({ data: kiosModel })
            } else {
                await prisma.pubers_kios.createMany({
                    data: kiosModel
                })
            }
        }
        res.json({
            success: true,
            message: 'Successfully Created!!',
            dataError: dataError
        });
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
};
exports.addKTP = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT id FROM ktp ORDER BY "id" DESC LIMIT 1`
        let id = query[0].id + 1n
        let KtpModel = [];
        let dataError = [];
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        for (dataExcel of fileExcel) {
            if (dataExcel.nik) {
                if (containsNumbers(dataExcel.nik)) {
                    dataExcel.nik = dataExcel.nik.replace(/['"]+/g, "");
                    const cekKtp = await prisma.ktp.findFirst({
                        where: {
                            nik: String(dataExcel.nik)
                        }
                    })

                    if (!cekKtp) {
                        KtpModel.push({
                            id: id,
                            nik: dataExcel.nik,
                            nama: dataExcel.nama,
                            alamat: dataExcel.alamat,
                            jenis_kelamin: dataExcel.jenis_kelamin,
                            verified: true,
                            created_at: await sekarang(),
                            updated_at: await sekarang()
                        })
                        id += 1n
                    }
                } else {
                    dataError.push({
                        nik: `${dataExcel.nik}`,
                        pesan: `Nik diisi ${dataExcel.nik}`
                    })
                }
            }
        }

        if (KtpModel.length > 0) {
            await prisma.ktp.createMany({
                data: KtpModel
            })
        }

        res.json({
            success: true,
            message: 'Successfully created!!',
            dataError: dataError
        })
    } catch (error) {
        console.log(error);
        res.json(response.error(500));
    }
};
exports.addMember = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT id_member FROM member ORDER BY "id_member" DESC LIMIT 1`
        let id = query[0].id_member + 1n
        let memberModel = [];
        let dataError = [];
        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        for (dataExcel of fileExcel) {
            if (dataExcel.nik != "") {
                if (containsNumbers(dataExcel.nik)) {
                    const n = dataExcel.nik
                    if ((dataExcel.id_desa != "" && dataExcel.id_kec != "") || n.includes("RT")) {
                        dataExcel.nik = dataExcel.nik.replace(/['"]+/g, "");
                        const cekMember = await prisma.member.findFirst({
                            where: {
                                nik: String(dataExcel.nik)
                            }
                        })

                        const cekKTP = await prisma.ktp.findFirst({
                            where: {
                                nik: String(dataExcel.nik)
                            }
                        })

                        if (cekKTP) {
                            if (!cekMember) {
                                memberModel.push({
                                    id_member: id,
                                    nik: dataExcel.nik,
                                    status: 'Aktiv',
                                    created_at: await sekarang(),
                                    updated_at: await sekarang(),
                                    no_hp: dataExcel.no_hp,
                                    id_desa: String(dataExcel.id_desa),
                                    id_kec: String(dataExcel.id_kec),
                                    id_kab: String(dataExcel.id_kab),
                                    id_prov: String(dataExcel.id_prov),
                                    kode_pos: dataExcel.kode_pos,
                                })
                                id += 1n
                            } else {
                                await prisma.member.update({
                                    where: {
                                        nik: dataExcel.nik
                                    },
                                    data: ({
                                        updated_at: await sekarang(),
                                        no_hp: dataExcel.no_hp,
                                        id_desa: String(dataExcel.id_desa),
                                        id_kec: String(dataExcel.id_kec),
                                        id_kab: String(dataExcel.id_kab),
                                        id_prov: String(dataExcel.id_prov),
                                        kode_pos: dataExcel.kode_pos,
                                    })
                                })
                            }
                        } else {
                            dataError.push({
                                nik: dataExcel.nik,
                                pesan: 'nik belum terdaftar di ktp'
                            })
                        }

                    } else {
                        dataError.push({
                            nik: dataExcel.nik,
                            pesan: 'id_kec dan id_kab tidak boleh kosong'
                        })
                    }
                } else {
                    dataError.push({
                        nik: `${dataExcel.nik}`,
                        pesan: `Nik diisi ${dataExcel.nik}`
                    })
                }
            }
        }


        memberModel = [...new Map(memberModel.map((m) => [m.nik, m])).values()];

        if (memberModel.length > 0) {
            if (memberModel.length <= 1) {
                await prisma.member.create({ data: memberModel })
            } else {
                await prisma.member.createMany({
                    data: memberModel
                })
            }
        }

        if (memberModel.length > 0) {
            await prisma.$queryRaw`INSERT INTO users_login (nik, status, password, access)
            SELECT "member".nik, 'Aktiv', '$2a$10$sFndEjY39HEdutWVW23wmO1PLFq.lxbc8d3aXimzDKRQ.c.Lb0GB.', 'member' FROM "member" LEFT JOIN users_login ON "member".nik = users_login.nik WHERE id_users IS NULL`
        }
        res.json({
            success: true,
            message: 'Successfully Created!!',
            dataError: dataError
        });
    } catch (error) {
        console.log(error);
        res.json(response.error(500))
    }
};

// Add an Ferivy
exports.verifiedKTP = async (req, res) => {
    try {
        const body = req.body
        if (body.adaList) {
            const listNik = body.listNik;
            for (nik of listNik) {
                await prisma.ktp.update({
                    where: {
                        nik: String(nik)
                    },
                    data: { verified: true }
                })
            }
        } else {
            const query = await prisma.$queryRaw`SELECT nik FROM ktp WHERE verified IS NULL OR verified = false ORDER BY id`
        }
        // for (nik of query) {
        //     await prisma.ktp.update({
        //         where: {
        //             nik: String(nik.nik)
        //         },
        //         data: { verified: true }
        //     })
        // }
        res.json({
            message: `Berhasil Verified Member`
        })
    } catch (error) {
        console.log(error);
        res.json(response.error(500))
    }
};
exports.makeUserLogin = async (req, res) => {
    try {
        const dataUser = await prisma.$queryRaw`SELECT member.nik FROM "member" LEFT JOIN users_login ON "member".nik = users_login.nik WHERE users_login.id_users IS NULL;`
        const id = await prisma.$queryRaw`SELECT id_users FROM users_login ORDER BY id_users DESC LIMIT 1;`
        let idUsers = id[0].id_users + 1n
        let dataUpload = []
        for (data of dataUser) {
            dataUpload.push({
                id_users: idUsers,
                nik: data.nik,
                status: 'Aktiv',
                password: '$2a$10$sFndEjY39HEdutWVW23wmO1PLFq.lxbc8d3aXimzDKRQ.c.Lb0GB.',
                access: 'member'
            })
            idUsers += 1n
        }
        await prisma.users_login.createMany({
            data: dataUpload
        })
        res.json({
            message: 'Berhasil Membuat Login'
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}


// Checking Data
exports.checkKTP = async (req, res) => {
    try {
        const data = req.body
        const listNik = data.nik
        let terdaftar = []
        let belum = []
        let result = []
        for (nik of listNik) {
            const user = await prisma.ktp.findFirst({
                where: {
                    nik: String(nik)
                }
            })
            if (user) {
                terdaftar.push(nik)
            } else {
                belum.push(nik)
            }
        }
        res.json({
            terdaftar: terdaftar,
            belum_terdaftar: belum
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}
exports.checkMember = async (req, res) => {
    try {
        const data = req.body
        const listNik = data.nik
        let terdaftar = []
        let belum = []
        let result = []
        for (nik of listNik) {
            const user = await prisma.member.findFirst({
                where: {
                    nik: String(nik)
                }
            })
            if (user) {
                terdaftar.push(nik)
            } else {
                belum.push(nik)
            }
        }
        res.json({
            terdaftar: terdaftar,
            belum_terdaftar: belum
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}
exports.checkLogin = async (req, res) => {
    try {
        const data = req.body
        const listNik = data.nik
        let terdaftar = []
        let belum = []
        let result = []
        for (nik of listNik) {
            const user = await prisma.users_login.findFirst({
                where: {
                    nik: String(nik)
                }
            })
            if (user) {
                terdaftar.push(nik)
            } else {
                belum.push(nik)
            }
        }
        res.json({
            terdaftar: terdaftar,
            belum_terdaftar: belum
        })
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}
exports.checkTransaksi = async (req, res) => {
    const nik = req.body.nik;
    let file = []
    for (n of nik) {
        const data = await prisma.pubers_chld_transaksi.findMany({
            where: {
                nik: String(n)
            }
        })
        if (data.length != 0) {
            file.push(data)
        }
    }
};
exports.checkKios = async (req, res) => {
    const nik = req.body.nik;
    let file = []
    for (n of nik) {
        const data = await prisma.pubers_kios.findMany({
            where: {
                kode_kios: n
            }
        })
        if (data.length == 0) {
            file.push({
                kode_kios: String(n),
                status: 'belum terdaftar'
            })
        }
    }
    res.json(file)
}


// Function
function containsNumbers(str) {
    return /\d/.test(str);
}
function encrypt(text, key) {
    return [...text].map((x, i) =>
        (x.codePointAt() ^ key.charCodeAt(i % key.length) % 255)
            .toString(16)
            .padStart(2, "0")
    ).join('')
}
function decrypt(text, key) {
    return String.fromCharCode(...text.match(/.{1,2}/g)
        .map((e, i) =>
            parseInt(e, 16) ^ key.charCodeAt(i % key.length) % 255)
    )
}