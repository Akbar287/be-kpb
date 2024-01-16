const { PrismaClient } = require('@prisma/client');
const { unlink, unlinkSync } = require('fs');
const prisma = new PrismaClient()
const { response, sekarang, cekNull } = require('../utils/utils');
const fs = require('fs');
const path = require('path');

exports.getForm = async (req, res) => {
    try {
        const nik = req.params.nik
        const data = await prisma.okkpd_form_permohonan.findFirst({
            where: {
                nik: nik
            }
        })
        const jenis = await prisma.okkpd_komoditas.findMany({})
        let hasil = {}
        hasil.data = data
        hasil.jenis = jenis.map(item => item.nama_komoditas);
        res.json(response.successWithData(hasil, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.createPengajuan = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        if (data.jenis_komoditi.length == '') {
            res.json(response.errorWithData('Jenis Komoditi Tidak Boleh Kosong', 200))
        } else {
            data.shm = cekNull(req.files['shm'], '../public/okkpd')
            data.ktpfile = cekNull(req.files['ktp'], '../public/okkpd')
            data.npwp = cekNull(req.files['npwp'], '../public/okkpd')
            data.nib = cekNull(req.files['nib'], '../public/okkpd')
            data.suratPermohonan = cekNull(req.files['suratPermohonan'], '../public/okkpd')
            data.informasiProduk = cekNull(req.files['informasiProduk'], '../public/okkpd')
            data.si = cekNull(req.files['si'], '../public/okkpd')
            data.status = Number(0)
            const query = await prisma.okkpd_form_permohonan.findFirst({
                where: {
                    nik: data.nik
                }
            })
            const formSC = await prisma.okkpd_berkas_pengujian_lab.create({
                data: {}
            })
            const formKepuasan = await prisma.okkpd_form_penilaian.create({
                data: {}
            })
            let formBerkas = {}
            if (query) {
                formBerkas = await prisma.okkpd_berkas_permohonan.create({
                    data: {
                        id_form_permohonan: Number(query.id_form_permohonan),
                        jenis_komoditi: data.jenis_komoditi,
                        jumlah_lot: Number(data.jumlah_lot),
                        berat_bersih: data.berat_bersih,
                        berat_kotor: data.berat_kotor,
                        negara_tujuan: data.negara_tujuan,
                        surat_permohonan: data.suratPermohonan,
                        informasi_produk: data.informasiProduk,
                        dokumen_eksport: data.si,
                        tanggal_pengajuan: await sekarang(),
                        status: data.status,
                        id_berkas_pengujian_lab: formSC.id_persyaratan_sc_hc,
                        id_form_penilaian: formKepuasan.id_form_penilaian,
                        nomor_si: data.nomor_si
                    }
                })
            } else {
                formPermohonan = await prisma.okkpd_form_permohonan.create({
                    data: {
                        nik: data.nik,
                        nama_pemohon: data.nama,
                        nama_perusahaan: data.namaPerusahaan,
                        alamat: data.alamatPerusahaan,
                        shm: data.shm,
                        ktpfile: data.ktpfile,
                        npwp: data.npwp,
                        nib: data.nib,
                    }
                })
                formBerkas = await prisma.okkpd_berkas_permohonan.create({
                    data: {
                        id_form_permohonan: Number(formPermohonan.id_form_permohonan),
                        jenis_komoditi: data.jenis_komoditi,
                        jumlah_lot: Number(data.jumlah_lot),
                        berat_bersih: data.berat_bersih,
                        berat_kotor: data.berat_kotor,
                        negara_tujuan: data.negara_tujuan,
                        surat_permohonan: data.suratPermohonan,
                        informasi_produk: data.informasiProduk,
                        dokumen_eksport: data.si,
                        tanggal_pengajuan: await sekarang(),
                        status: data.status,
                        id_berkas_pengujian_lab: formSC.id_persyaratan_sc_hc,
                        id_form_penilaian: formKepuasan.id_form_penilaian,
                        nomor_si: data.nomor_si
                    }
                })
            }
            await prisma.okkpd_chld_berkas_permohonan.create({
                data: {
                    id_berkas_permohonan: Number(formBerkas.id_berkas_permohonan),
                    status: Number(data.status),
                    keterangan: 'Sedang dalam Pengecekan Formulir',
                    tanggal: await sekarang()
                }
            })
            res.json(response.successWithData({ id: formBerkas.id_berkas_permohonan }, 200))
        }
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getPengajuan = async (req, res) => {
    try {
        const data = await prisma.okkpd_berkas_permohonan.findMany({
            include: {
                okkpd_form_permohonan: true
            },
            orderBy: {
                id_berkas_permohonan: 'desc'
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getPengajuanMember = async (req, res) => {
    try {
        const nik = req.params.nik
        const data = await prisma.okkpd_form_permohonan.findFirst({
            where: {
                nik: nik
            },
            include: {
                okkpd_berkas_permohonan: true
            },
            orderBy: {
                id_form_permohonan: 'desc'
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getDetailPengajuan = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(id)
            },
            include: {
                okkpd_form_permohonan: true,
                okkpd_chld_berkas_permohonan: true
            }
        })
        const member = await prisma.ktp.findFirst({
            where: {
                nik: data.okkpd_form_permohonan.nik
            },
            include: {
                member: {
                    include: {
                        reg_provinces: true,
                        reg_regencies: true,
                        reg_districts: true,
                        reg_villages: true
                    }
                }
            }
        })
        data['member'] = member
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.formPengajuan = async (req, res) => {
    try {
        const id = req.params.id
        const idDetail = req.params.idDetail
        let data = {}
        data.alamat_pembeli = req.body.alamat
        data.surat_sc_hc = cekNull(req.files['schc'], '../public/okkpd')
        data.sppb = cekNull(req.files['sppb'], '../public/okkpd')
        data.okratoksin = cekNull(req.files['okratoksin'], '../public/okkpd')
        data.aflatoksin = cekNull(req.files['aflatoksin'], '../public/okkpd')
        data.organoleptik_proksimat = cekNull(req.files['organoleptik'], '../public/okkpd')
        data.residu_pestisida = cekNull(req.files['pestisida'], '../public/okkpd')
        const detail = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(idDetail)
            }
        })
        const form = await prisma.okkpd_berkas_pengujian_lab.update({
            where: {
                id_persyaratan_sc_hc: Number(id)
            },
            data: data
        })
        const updateStatus = await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: detail.id_berkas_permohonan
            },
            data: {
                status: 3
            }
        })
        const chldCreate = await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: detail.id_berkas_permohonan,
                status: 3,
                tanggal: await sekarang(),
                keterangan: 'Menambahkan Hasil Pengujian Lab'
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.updateData = async (req, res) => {
    try {
        const id = req.params.id
        let data = JSON.parse(req.body.data)
        data.surat_permohonan = cekNull(req.files['suratPermohonan'], '../public/okkpd')
        data.informasi_produk = cekNull(req.files['informasiProduk'], '../public/okkpd')
        data.dokumen_eksport = cekNull(req.files['si'], '../public/okkpd')
        const dataOld = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(id)
            }
        })
        data.jumlah_lot = Number(data.jumlah_lot)
        if (!data.surat_permohonan) {
            data.surat_permohonan = dataOld.surat_permohonan
        } else {
            const filePath = path.join('./public/okkpd/', dataOld.surat_permohonan);
            // Mengecek apakah file ada
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File tidak ditemukan.`);
                } else {
                    fs.unlinkSync(`./public/okkpd/${dataOld.surat_permohonan}`)
                }
            });
        }
        if (!data.informasi_produk) {
            data.informasi_produk = dataOld.informasi_produk
        } else {
            const filePath = path.join('./public/okkpd/', dataOld.informasi_produk);
            // Mengecek apakah file ada
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File tidak ditemukan.`);
                } else {
                    // console.log(`File ditemukan.`);
                    fs.unlinkSync(`./public/okkpd/${dataOld.informasi_produk}`)
                }
            });
        }
        if (!data.dokumen_eksport) {
            data.dokumen_eksport = dataOld.dokumen_eksport
        } else {
            const filePath = path.join('./public/okkpd/', dataOld.dokumen_eksport);
            // Mengecek apakah file ada
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File tidak ditemukan.`);
                } else {
                    // console.log(`File ditemukan.`);
                    fs.unlinkSync(`./public/okkpd/${dataOld.dokumen_eksport}`)
                }
            });
        }
        await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id)
            },
            data: data
        })
        if (dataOld.status === 9) {
            await prisma.okkpd_chld_berkas_permohonan.create({
                data: {
                    id_berkas_permohonan: Number(id),
                    status: 10,
                    keterangan: 'Verifikasi Berkas Setelah Revisi'
                }
            })
        }
        res.json(response.success('Berhasil Update Berkas Permohonan', 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        const updateStatus = await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id),
            },
            data: {
                status: data.status,
                tanggal_penerbitan: data.tanggal_penerbitan,
                tanggal_berakhir: data.tanggal_berakhir,
                tanggal_pengambilan: data.tanggal_pengambilan
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: updateStatus.id_berkas_permohonan,
                status: data.status,
                tanggal: await sekarang(),
                keterangan: data.keterangan
            }
        })
        res.json(response.success(201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.updatePengambilanBlanko = async (req, res) => {
    try {
        const id = req.params.id
        const dataGet = JSON.parse(req.body.data)
        const blanko = cekNull(req.files['blanko'], '../public/okkpd')
        const dataOld = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(id)
            }
        })
        if (dataOld.file_blanko) {
            const filePath = path.join('./public/okkpd/', dataOld.file_blanko);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File '${dataOld.file_blanko}' tidak ditemukan.`);
                } else {
                    // console.log(`File '${fileName}' ditemukan.`);
                    fs.unlinkSync(`./public/okkpd/${dataOld.file_blanko}`)
                }
            });
        }
        const data = await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id)
            },
            data: {
                file_blanko: blanko,
                status: dataGet.status,
                tanggal_penerbitan: dataGet.tanggal_penerbitan,
                tanggal_berakhir: dataGet.tanggal_berakhir,
                tanggal_pengambilan: dataGet.tanggal_pengambilan
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: data.id_berkas_permohonan,
                tanggal: await sekarang(),
                status: Number(dataGet.status),
                keterangan: `Selesai`
            }
        })
        res.json(response.successData('Berhasil Penerbitan'))
    } catch (error) {
        console.log(error);
        res.json(response.error)
    }
}

exports.reschedule = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        const berkas = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(id),
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.updateMany({
            where: {
                id_berkas_permohonan: Number(berkas.id_berkas_permohonan),
                status: Number(1)
            },
            data: {
                tanggal: await sekarang(),
                keterangan: data.keterangan
            }
        })
        res.json(response.success(201))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}

exports.getPengujianLab = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.okkpd_berkas_pengujian_lab.findFirst({
            where: {
                id_persyaratan_sc_hc: Number(id)
            }
        })
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.sendBlanko = async (req, res) => {
    try {
        const id = req.params.id
        const blanko = cekNull(req.files['blanko'], '../public/okkpd')
        const status = req.body.status
        const dataOld = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(id)
            }
        })
        if (dataOld.file_blanko) {
            // const fileName = '1686142990747mBWgEsU.jpeg'
            const filePath = path.join('./public/okkpd/', dataOld.file_blanko);
            // Mengecek apakah file ada
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File '${dataOld.file_blanko}' tidak ditemukan.`);
                } else {
                    // console.log(`File '${fileName}' ditemukan.`);
                    fs.unlinkSync(`./public/okkpd/${dataOld.file_blanko}`)
                }
            });
        }
        const data = await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id)
            },
            data: {
                file_blanko: blanko,
                status: Number(status)
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: data.id_berkas_permohonan,
                tanggal: await sekarang(),
                status: Number(status),
                keterangan: `Blanko${status === 6 ? ' Diperbaharui' : ''}`
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.addRating = async (req, res) => {
    try {
        const id = req.params.id
        const idDetail = req.params.idDetail
        const data = req.body
        await prisma.okkpd_form_penilaian.update({
            where: {
                id_form_penilaian: Number(id)
            },
            data: data
        })
        await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(idDetail)
            },
            data: {
                status: 5
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: Number(idDetail),
                status: 5,
                keterangan: 'Rating Kepuasan',
                tanggal: await sekarang()
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getRating = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.okkpd_form_penilaian.findFirst({
            where: {
                id_form_penilaian: Number(id)
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.statusGagal = async (req, res) => {
    try {
        const id = Number(req.params.id)
        const data = JSON.parse(req.body.data)
        const file = cekNull(req.files['fileGagal'], '../public/okkpd')
        data.file = file
        await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: id
            },
            data: {
                status: Number(data.status)
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: id,
                keterangan: data.keterangan,
                status: Number(data.status),
                tanggal: await sekarang(),
                file: data.file
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getSCHC = async (req, res) => {
    try {
        let data = await prisma.okkpd_berkas_permohonan.findMany({
            where: {
                status: {
                    gt: 3,  // Nilai a harus di atas 10
                    lt: 8
                }
            },
            include: {
                okkpd_berkas_pengujian_lab: true,
                okkpd_form_permohonan: true
            }
        })
        for (const d of data) {
            const member = await prisma.ktp.findFirst({
                where: {
                    nik: d.okkpd_form_permohonan.nik
                },
                include: {
                    member: {
                        include: {
                            reg_provinces: true,
                            reg_regencies: true,
                            reg_districts: true,
                            reg_villages: true
                        }
                    }
                }
            })
            d.member = member
        }
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getReview = async (req, res) => {
    try {
        // const data = await prisma.okkpd_form_penilaian.findMany({
        //     include: {
        //         okkpd_berkas_permohonan: {
        //             include: {
        //                 okkpd_form_permohonan: true
        //             }
        //         }
        //     }
        // })
        const data = await prisma.okkpd_berkas_permohonan.findMany({
            where: {
                status: {
                    gt: 4
                }
            },
            include: {
                okkpd_chld_berkas_permohonan: true,
                okkpd_form_permohonan: true,
                okkpd_form_penilaian: true
            }
        })
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getMember = async (req, res) => {
    try {
        const data = await prisma.role_member.findMany({
            where: {
                id_role: 33,
                status: String(1)
            },
            include: {
                member: {
                    include: {
                        ktp: true
                    }
                }
            }
        })
        for (const d of data) {
            const perusahaan = await prisma.okkpd_form_permohonan.findFirst({
                where: {
                    nik: d.member.nik
                }
            })
            d.perusahaan = perusahaan
        }
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.updateTonase = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id)
            },
            data: {
                tonase: Number(data.tonase),
                noScHc: data.noScHc,
                identtitas_lot: data.identtitas_lot
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.updateRevisi = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: Number(id)
            },
            data: {
                status: Number(data.status),
            }
        })
        await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: Number(id),
                status: Number(data.status),
                tanggal: await sekarang(),
                keterangan: data.keterangan
            }
        })
        res.json(response.success('Berhasil Update Status', 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.createKomoditas = async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const listKomoditas = await prisma.okkpd_komoditas.findMany({})
        for (komoditas of listKomoditas) {
            if (komoditas.nama_komoditas.toLowerCase() === data.nama_komoditas.toLowerCase()) {
                return res.json(response.errorWithData(`Komoditas ${data.nama_komoditas} telah ada`, 201))
            }
        }
        data.nama_komoditas = convertToSentenceCase(data.nama_komoditas)
        await prisma.okkpd_komoditas.create({
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.getKomoditas = async (req, res) => {
    try {
        const data = await prisma.okkpd_komoditas.findMany({})
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error());
    }
}

exports.revisiSCHC = async (req, res) => {

    try {
        const id = req.params.id
        const idDetail = req.params.idDetail
        const dataOld = await prisma.okkpd_berkas_pengujian_lab.findFirst({
            where: {
                id_persyaratan_sc_hc: Number(id)
            }
        })
        console.log(dataOld);
        let data = {}
        data.alamat_pembeli = req.body.alamat
        data.surat_sc_hc = cekNull(req.files['schc'], '../public/okkpd') ?? dataOld.surat_sc_hc
        data.sppb = cekNull(req.files['sppb'], '../public/okkpd') ?? dataOld.sppb
        data.okratoksin = cekNull(req.files['okratoksin'], '../public/okkpd') ?? dataOld.okratoksin
        data.aflatoksin = cekNull(req.files['aflatoksin'], '../public/okkpd') ?? dataOld.aflatoksin
        data.organoleptik_proksimat = cekNull(req.files['organoleptik'], '../public/okkpd') ?? dataOld.organoleptik_proksimat
        data.residu_pestisida = cekNull(req.files['pestisida'], '../public/okkpd') ?? dataOld.residu_pestisida
        console.log(data);
        const detail = await prisma.okkpd_berkas_permohonan.findFirst({
            where: {
                id_berkas_permohonan: Number(idDetail)
            }
        })
        const form = await prisma.okkpd_berkas_pengujian_lab.update({
            where: {
                id_persyaratan_sc_hc: Number(id)
            },
            data: data
        })
        const updateStatus = await prisma.okkpd_berkas_permohonan.update({
            where: {
                id_berkas_permohonan: detail.id_berkas_permohonan
            },
            data: {
                status: 10
            }
        })
        const chldCreate = await prisma.okkpd_chld_berkas_permohonan.create({
            data: {
                id_berkas_permohonan: detail.id_berkas_permohonan,
                status: 10,
                tanggal: await sekarang(),
                keterangan: 'Revisi Hasil Pengujian Lab'
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.json(response.error())
    }
}



function convertToSentenceCase(inputString) {
    // Pisahkan kalimat menjadi array kalimat dengan mengidentifikasi titik sebagai pemisah
    const sentences = inputString.split('.');

    // Loop melalui setiap kalimat
    const sentenceCaseSentences = sentences.map((sentence) => {
        // Menghapus spasi putih di awal dan akhir kalimat
        sentence = sentence.trim();

        // Ubah karakter pertama menjadi huruf besar
        if (sentence.length > 0) {
            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
        }

        return sentence;
    });

    // Gabungkan kalimat menjadi satu teks dengan titik sebagai pemisah
    const sentenceCaseString = sentenceCaseSentences.join('.');

    return sentenceCaseString;
}