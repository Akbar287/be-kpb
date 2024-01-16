const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const { transporter, mailOptions } = require('../helpers/Mail')

// pengaduan opt dpi
exports.storePengaduanDpi = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        if (req.files.length < 0) return res.json(response.errorWithData('File tidak boleh kosong', 400))
        data.tanggalpengaduan = await sekarang()
        data.jeniskomoditi = Number(data.jeniskomoditi)

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Ingat bahwa bulan dimulai dari 0 (Januari) hingga 11 (Desember)
        const date = currentDate.getDate();

        const query = await prisma.opt_pengaduan_dpi.create({
            data: data
        })

        if (query) {
            const fileUpload = req.files.map(r => {
                return {
                    id_opt_pengaduan_dpi: Number(query.id_dpi_pengaduan),
                    namafile: r.filename
                }
            })
            await prisma.opt_berkas_pengaduan_dpi.createMany({
                data: fileUpload
            })
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

exports.getOptDpi = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan_dpi.findMany({
            include: {
                ktp: true,
                master_komoditas: true,
                opt_berkas_pengaduan_dpi: true,
                opt_jawaban_dpi: {
                    include: {
                        opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_dokter: {
                            include: { ktp: true }
                        },
                        opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_tenagalab: {
                            include: { ktp: true }
                        }
                    }
                }
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getOptDpiByNik = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan_dpi.findMany({
            where: { nik: req.params.nik },
            include: {
                ktp: true,
                master_komoditas: true,
                opt_berkas_pengaduan_dpi: true,
                opt_jawaban_dpi: {
                    include: {
                        opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_dokter: { include: { ktp: true } },
                        opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_tenagalab: { include: { ktp: true } }
                    }
                }
            }
        })

        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getOptDpiById = async (req, res) => {
    try {
        const query = await prisma.opt_pengaduan_dpi.findUnique({
            where: { id_dpi_pengaduan: Number(req.params.id) },
            include: {
                ktp: true,
                master_komoditas: true,
                opt_berkas_pengaduan_dpi: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}
//end pengaduan opt dpi


//OPT OPH
exports.storeOptOph = async (req, res) => {
    try {
        const data = req.body
        await prisma.opt_aph.create({ data: data })
        res.json(response.success(200))
    } catch (error) {

        res.json(response.error(500))
    }
}

exports.getOptAph = async (req, res) => {
    try {
        const query = await prisma.opt_aph.findMany()
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getOptAphById = async (req, res) => {
    try {
        const query = await prisma.opt_aph.findUnique({ where: { id_aph: Number(req.params.id) } })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.updateOptOph = async (req, res) => {
    try {
        const data = req.body
        await prisma.opt_aph.update({
            where: {
                id_aph: Number(req.params.id)
            },
            data: data
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.deleteOptOph = async (req, res) => {
    try {
        await prisma.opt_aph.delete({
            where: {
                id_aph: Number(req.params.id)
            },
        })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}
//END OPT OPH


// APH Starter
exports.storePermohonanStarter = async (req, res) => {
    try {
        const data = req.body
        data.tanggalpemohon = await sekarang()
        await prisma.opt_permohonan_starter_aph.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getStorePermohonanStarter = async (req, res) => {
    try {
        const query = await prisma.opt_permohonan_starter_aph.findMany({
            include: {
                ktp: true,
                opt_aph: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getStorePermohonanStarterByNik = async (req, res) => {

    try {
        const query = await prisma.opt_permohonan_starter_aph.findMany({
            where: { nik: req.params.nik },
            include: {
                ktp: true,
                opt_aph: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.uptStatusStorePermohonanStarter = async (req, res) => {
    try {
        const query = await prisma.opt_permohonan_starter_aph.update({
            where: { id_permohonan_starter: Number(req.params.id) },
            data: {
                statuspersetujuan: req.body.statuspersetujuan
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}
// END APH Starter

// APH Bimtek
exports.storePermohonanBimtek = async (req, res) => {
    try {
        const data = req.body
        data.tanggalpemohon = await sekarang()
        data.tanggalbimtek = new Date(data.tanggalbimtek)
        data.jumlahpeserta = Number(data.jumlahpeserta)
        await prisma.opt_permohonan_bimtek_aph.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getStorePermohonanBimtek = async (req, res) => {
    try {
        const query = await prisma.opt_permohonan_bimtek_aph.findMany({
            include: {
                ktp: true,
                opt_aph: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.getPermohonanBimtekByNik = async (req, res) => {

    try {
        const query = await prisma.opt_permohonan_bimtek_aph.findMany({
            where: { nik: req.params.nik },
            include: {
                ktp: true,
                opt_aph: true
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}

exports.uptStatusStorePermohonanBimtek = async (req, res) => {
    try {
        const query = await prisma.opt_permohonan_bimtek_aph.update({
            where: { id_permohonan_bimtek: Number(req.params.id) },
            data: {
                onupdate: await sekarang(),
                statuspersetujuan: req.body.statuspersetujuan
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        res.json(response.error(500))
    }
}
// END APH Bimtek


// JAWABAN
exports.inputJawabanDPI = async (req, res) => {
    try {
        const data = req.body
        const cekData = await prisma.opt_jawaban_dpi.findFirst({ where: { id_dpi_pengaduan: data.id_dpi_pengaduan } })
        if (cekData) return res.json(response.errorWithData(`ID => ${data.id_dpi_pengaduan} sudah dijawab`))
        data.tanggaldijawab = await sekarang()
        data.tanggalpublish = await sekarang()
        await prisma.opt_jawaban_dpi.create({ data: data })
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.updateJawaban = async (req, res) => {
    try {
        const data = req.body
        delete data.opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_dokter
        delete data.opt_dokter_opt_dokterToopt_jawaban_dpi_id_opt_tenagalab
        await prisma.opt_jawaban_dpi.update({ where: { id_opt_jawaban: Number(req.params.id) }, data: data })
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