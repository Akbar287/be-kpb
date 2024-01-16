const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const { transporter, mailOptions } = require('../helpers/Mail')
//cari ktp
exports.cariKtp = async (req, res) => {
    try {
        const key = req.query.key
        const query = await prisma.ktp.findUnique({
            where: {
                nik: key
            },
        })
        if (!query) return res.json(response.errorWithData(`Nik ${req.query.key} tidak ditemukan`, 400))
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

// DOKTER
exports.inputDokter = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        data.fotoprofil = req.file.filename
        const query = await prisma.ktp.findUnique({
            where: {
                nik: data.nik
            },
        })
        if (!query) return res.json(response.errorWithData(`Nik ${data.nik} tidak ditemukan`, 400))
        const cekNIk = await prisma.opt_dokter.findFirst({ where: { nik: data.nik } })
        if (cekNIk) return res.json(response.errorWithData(`Nik ${data.nik} sudah terdaftar sebagai OPT Dokter/Laboran`, 400))
        await prisma.opt_dokter.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getDokter = async (req, res) => {
    try {
        const query = await prisma.opt_dokter.findMany({
            include: {
                ktp: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getDokterById = async (req, res) => {
    try {
        const query = await prisma.opt_dokter.findUnique({
            where: {
                id_opt_dokter: Number(req.params.id)
            },
            include: {
                ktp: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getDokterLaboran = async (req, res) => {
    try {
        const query = await prisma.opt_dokter.findMany({
            where: {
                jenis: req.params.id
            },
            include: {
                ktp: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.updateDokter = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        delete data.ktp
        if (req.file) {
            data.fotoprofil = req.file.filename
        } else {
            data.fotoprofil = data.fotoprofil
        }

        const cekNIk = await prisma.opt_dokter.findFirst({ where: { nik: data.nik } })
        if (!cekNIk) return res.json(response.errorWithData(`Nik ${data.nik} tidak terdaftar sebagai OPT Dokter/Laboran`, 400))
        await prisma.opt_dokter.update({ where: { id_opt_dokter: Number(req.params.id) }, data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.deleteDokter = async (req, res) => {
    try {

        await prisma.opt_dokter.delete({
            where: {
                id_opt_dokter: Number(req.params.id)
            }
        })
        res.json(response.success(200))
    } catch (error) {

        res.json(response.errorWithData('Tidak dapat menghapus data!!!', 500))
    }
}
// END DOKTER

// PENGADUAN
exports.inputPengaduan = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        if (!req.files) return res.json(response.errorWithData('File tidak boleh kosong', 400))
        data.tanggalpengaduan = await sekarang()
        data.jeniskomoditi = Number(data.jeniskomoditi)
        data.gambarDaun = req.files.gambarDaun.length > 0 ? req.files.gambarDaun[0].filename : null
        data.gambarBatang = req.files.gambarBatang.length > 0 ? req.files.gambarBatang[0].filename : null
        data.gambarAkar = req.files.gambarAkar.length > 0 ? req.files.gambarAkar[0].filename : null
        data.gambarBuah = req.files.gambarBuah.length > 0 ? req.files.gambarBuah[0].filename : null

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Ingat bahwa bulan dimulai dari 0 (Januari) hingga 11 (Desember)
        const date = currentDate.getDate();
        const query = await prisma.opt_pengaduan.create({
            data: data
        })
        if (query) {
            // const fileUpload = req.files.map(r => {
            //     return {
            //         id_opt_pengaduan: Number(query.id_opt_pengaduan),
            //         namafile: r.filename
            //     }
            // })
            // await prisma.opt_berkas_pengaduan.createMany({
            //     data: fileUpload
            // })
            // Kirim email
            data.tgl = `${date}-${month}-${year}`
            transporter.sendMail(mailOptions(data.namapemiliklahan, data), (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                    res.json(response.errorWithData('Gagal mengirim email', 200))
                } else {
                    console.log('Email sent:', info.response);
                    res.json(response.success(200))
                }
            });

        } else {
            res.json(response.errorWithData('Gagal input pengaduan', 200))
        }


    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.editPengaduan = async (req, res) => {
    try {
        const data = req.body
        // const data = JSON.parse(req.body.data)
        data.onupdate = await sekarang()
        await prisma.opt_pengaduan.update({
            where: { id_opt_pengaduan: Number(req.params.id) },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getPengaduan = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan.findMany({
            include: {
                master_komoditas: true,
                opt_berkas_pengaduan: true,
                opt_jawaban: {
                    include: {
                        opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter: { include: { ktp: true } },
                        opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab: { include: { ktp: true } }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getPengaduanById = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan.findUnique({
            where: { id_opt_pengaduan: req.params.id },
            include: {
                master_komoditas: true,
                opt_berkas_pengaduan: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getPengaduanByNik = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan.findMany({
            where: { nik: req.params.id },
            include: {
                master_komoditas: true,
                opt_berkas_pengaduan: true,
                opt_jawaban: {
                    include: {
                        opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter: { include: { ktp: true } },
                        opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab: { include: { ktp: true } }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.deletePengaduan = async (req, res) => {
    try {
        await prisma.opt_pengaduan.delete({ where: { id_opt_pengaduan: Number(req.params.id) } })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getBerkasPengaduan = async (req, res) => {
    try {
        const query = await prisma.opt_berkas_pengaduan.findMany({
            where: {
                id_opt_pengaduan: Number(req.params.idpengaduan)
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.tambahBerkasPengaduan = async (req, res) => {
    try {
        // const data = req.body
        const data = JSON.parse(req.body.data)
        data.namafile = req.file.namafile
        await prisma.opt_berkas_pengaduan.create({
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.editBerkasPengaduan = async (req, res) => {
    try {
        // const data = req.body
        const data = JSON.parse(req.body.data)
        data.namafile = req.file.namafile
        await prisma.opt_berkas_pengaduan.updateMany({
            where: {
                id_opt_berkas_pengaduan: Number(req.params.id),
                id_opt_pengaduan: Number(req.params.idpengaduan)
            },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.deleteBerkasPengaduan = async (req, res) => {
    try {
        await prisma.opt_berkas_pengaduan.delete({
            where: {
                id_opt_berkas_pengaduan: Number(req.params.id),
                id_opt_pengaduan: Number(req.params.idpengaduan)
            }
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}
// END PENGADUAN

// JAWABAN
exports.inputJawaban = async (req, res) => {
    try {
        const data = req.body
        const cekData = await prisma.opt_jawaban.findFirst({ where: { id_opt_pengaduan: data.id_opt_pengaduan } })
        if (cekData) return res.json(response.errorWithData(`ID => ${data.id_opt_pengaduan} sudah dijawab`))
        data.tanggaldijawab = await sekarang()
        data.tanggalpublish = await sekarang()
        await prisma.opt_jawaban.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.updateJawaban = async (req, res) => {
    try {
        const data = req.body
        delete data.opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter
        delete data.opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab
        await prisma.opt_jawaban.update({ where: { id_opt_jawaban: Number(req.params.id) }, data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getJawaban = async (req, res) => {
    try {
        const query = await prisma.opt_jawaban.findMany({
            include: {
                opt_pengaduan: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getJawabanByIdPengaduan = async (req, res) => {
    try {
        const query = await prisma.opt_jawaban.findFirst({
            where: { id_opt_pengaduan: Number(req.params.id) },
            include: {
                opt_pengaduan: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getJawabanById = async (req, res) => {
    try {
        const query = await prisma.opt_jawaban.findMany({
            where: { id_opt_jawaban: Number(req.params.id) },
            include: {
                opt_pengaduan: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_dokter: true,
                opt_dokter_opt_dokterToopt_jawaban_id_opt_tenagalab: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.deleteJawaban = async (req, res) => {
    try {
        await prisma.opt_jawaban.delete({ where: { id_opt_jawaban: Number(req.params.id) } })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}
// END JAWABAN

// KATEGORI INFORMASI
exports.inputKategoriInformasi = async (req, res) => {
    try {
        const data = req.body
        await prisma.opt_kategori_informasi.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getKategoriInformasi = async (req, res) => {
    try {
        const query = await prisma.opt_kategori_informasi.findMany({})
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getKategoriInformasiById = async (req, res) => {
    try {
        const query = await prisma.opt_kategori_informasi.findMany({ where: { id_opt_kategori_informasi: Number(req.params.id) } })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.updateKategoriInformasi = async (req, res) => {
    try {
        const data = req.body
        await prisma.opt_kategori_informasi.update({
            where: { id_opt_kategori_informasi: Number(req.params.id) },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.deleteKategoriInformasi = async (req, res) => {
    try {
        const data = req.body
        await prisma.opt_kategori_informasi.delete({
            where: { id_opt_kategori_informasi: Number(req.params.id) },
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}
// END KATEGORI INFORMASI

// INFORMASI
exports.inputInformasi = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        console.log(req.files, data)
        if (!req.files) return res.json(response.errorWithData('File tidak boleh kosong', 400))
        data.tanggalinformasi = await sekarang()
        data.filePdf = req.files.filePdf.length > 0 ? req.files.filePdf[0].filename : null
        const create = await prisma.opt_informasi.create({ data: data })
        if (create) {
            const fileUpload = req.files.namafile.map(r => {
                return {
                    id_opt_informasi: Number(create.id_opt_informasi),
                    namafile: r.filename
                }
            })
            await prisma.opt_berkas_informasi.createMany({
                data: fileUpload
            })
            res.json(response.success(200))
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getAllInformasi = async (req, res) => {
    try {
        const query = await prisma.opt_informasi.findMany({
            include: {
                opt_kategori_informasi_opt_informasiToopt_kategori_informasi: true,
                opt_berkas_informasi: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getAllInformasiById = async (req, res) => {
    try {
        const query = await prisma.opt_informasi.findMany({
            where: { id_opt_informasi: Number(req.params.id) },
            include: {
                opt_kategori_informasi_opt_informasiToopt_kategori_informasi: true,
                opt_berkas_informasi: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

// END INFORMASI

