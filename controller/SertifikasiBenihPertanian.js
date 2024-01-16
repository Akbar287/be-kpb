const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { cekNull, response, sekarang } = require('../utils/utils');
const moment = require('moment');

exports.create = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data)
    data.file_ktp = cekNull(req.files['file_ktp'], '../public/sertif_pertanian')
    data.formulir_pendaftaran = cekNull(req.files['formulir_pendaftaran'], '../public/sertif_pertanian')
    data.surat_rekomendasi = cekNull(req.files['surat_rekomendasi'], '../public/sertif_pertanian')
    data.denah_lokasi = cekNull(req.files['denah_lokasi'], '../public/sertif_pertanian')
    data.sumber_benih = cekNull(req.files['sumber_benih'], '../public/sertif_pertanian')
    data.status = Number(0)
    data.jumlah_benih = Number(data.jumlah_benih)
    data.created_at = await sekarang()
    const formSertif = await prisma.form_sertifikasi_pertanian.create({
      data: data
    })
    await prisma.chld_sertif_pertanian.create({
      data: {
        id_form_sertif_pertanian: formSertif.id,
        status: 0,
      }
    })
    await prisma.history_sertifikasi_pertanian.create({
      data: {
        id_form_sertif_pertanian: formSertif.id,
        status: 0,
        keterangan: 'Pengajuan Permohonan',
      }
    })
    res.json(response.successData('Berhasil Membuat Permintaan'))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getAll = async (req, res) => {
  try {
    const key = req.query.filter
    const status = req.query.status.split(';')
    let queries = ''
    if (status[0].length > 0) {
      for (let i = 0; i < status.length; i++) {
        if (status[i] < status[status.length - 1]) {
          queries += `status = ${Number(status[i])} or `
        } else {
          queries += `status = ${Number(status[i])} and`
        }
      }
    }
    const page = req.query.page
    const perpage = req.query.perpage
    const getData = await prisma.$queryRawUnsafe(`SELECT * FROM view_sertif_pertanian where ${queries} (nama ilike $1 or komoditas ilike $2) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`, `%${key}%`, `%${key}%`)
    const total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM view_sertif_pertanian where ${queries} (nama ilike $1 or komoditas ilike $2)`, `%${key}%`, `%${key}%`)
    res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getByUser = async (req, res) => {
  try {
    const data = await prisma.form_sertifikasi_pertanian.findMany({
      where: {
        nik: req.params.nik
      }
    })
    res.json(response.successWithData(data))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.detailSertifikasi = async (req, res) => {
  try {
    const data = await prisma.form_sertifikasi_pertanian.findFirst({
      where: {
        id: Number(req.params.id)
      },
      include: {
        chld_sertif_pertanian: true,
        history_sertifikasi_pertanian: {
          orderBy: {
            id: 'desc'
          }
        }
      }
    })
    res.json(response.successWithData(data))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.update = async (req, res) => {
  try {
    const dataFromApi = JSON.parse(req.body.data)
    const oldData = await prisma.chld_sertif_pertanian.findFirst({
      where: {
        id_form_sertif_pertanian: Number(req.params.id_form_sertifikasi)
      }
    })
    let data = {}
    data.file_pembayaran = cekNull(req.files['file_pembayaran']) === null ? oldData.file_pembayaran : cekNull(req.files['file_pembayaran']) 
    data.file_pendahuluan = cekNull(req.files['file_pendahuluan']) === null ? oldData.file_pendahuluan : cekNull(req.files['file_pendahuluan'])
    data.tanggal_pendahuluan = dataFromApi.tanggal_pendahuluan === undefined ? oldData.tanggal_pendahuluan : moment(dataFromApi.tanggal_pendahuluan, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_pendahuluan = cekNull(req.files['hasil_pendahuluan']) === null ? oldData.hasil_pendahuluan : cekNull(req.files['hasil_pendahuluan']) 
    data.file_vegetatif = cekNull(req.files['file_vegetatif']) === null ? oldData.file_vegetatif : cekNull(req.files['file_vegetatif']) 
    data.tanggal_vegetatif = dataFromApi.tanggal_vegetatif === undefined ? oldData.tanggal_vegetatif : moment(dataFromApi.tanggal_vegetatif, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_vegetatif = cekNull(req.files['hasil_vegetatif']) === null ? oldData.hasil_vegetatif : cekNull(req.files['hasil_vegetatif']) 
    data.file_berbunga = cekNull(req.files['file_berbunga']) === null ? oldData.file_berbunga : cekNull(req.files['file_berbunga']) 
    data.tanggal_berbunga = dataFromApi.tanggal_berbunga === undefined ? oldData.tanggal_berbunga : moment(dataFromApi.tanggal_berbunga, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_berbunga = cekNull(req.files['hasil_berbunga']) === null ? oldData.hasil_berbunga : cekNull(req.files['hasil_berbunga']) 
    data.file_masak = cekNull(req.files['file_masak']) === null ? oldData.file_masak : cekNull(req.files['file_masak']) 
    data.tanggal_masak = dataFromApi.tanggal_masak === undefined ? oldData.tanggal_masak : moment(dataFromApi.tanggal_masak, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_masak = cekNull(req.files['hasil_masak']) === null ? oldData.hasil_masak : cekNull(req.files['hasil_masak']) 
    data.file_pemeriksaan = cekNull(req.files['file_pemeriksaan']) === null ? oldData.file_pemeriksaan : cekNull(req.files['file_pemeriksaan']) 
    data.tanggal_pemeriksaan = dataFromApi.tanggal_pemeriksaan === undefined ? oldData.tanggal_pemeriksaan : moment(dataFromApi.tanggal_pemeriksaan, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_pemeriksaan = cekNull(req.files['hasil_pemeriksaan']) === null ? oldData.hasil_pemeriksaan : cekNull(req.files['hasil_pemeriksaan']) 
    data.file_pengawasan = cekNull(req.files['file_pengawasan']) === null ? oldData.file_pengawasan : cekNull(req.files['file_pengawasan']) 
    data.tanggal_pengawasan = dataFromApi.tanggal_pengawasan === undefined ? oldData.tanggal_pengawasan : moment(dataFromApi.tanggal_pengawasan, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_pengawasan = cekNull(req.files['hasil_pengawasan']) === null ? oldData.hasil_pengawasan : cekNull(req.files['hasil_pengawasan']) 
    data.file_pengujian = cekNull(req.files['file_pengujian']) === null ? oldData.file_pengujian : cekNull(req.files['file_pengujian']) 
    data.tanggal_pengujian = dataFromApi.tanggal_pengujian === undefined ? oldData.tanggal_pengujian : moment(dataFromApi.tanggal_pengujian, 'dddd, DD MMM YYYY').format('YYYY-MM-DDT00:00:00.000Z').toString()
    data.hasil_pengujian = cekNull(req.files['hasil_pengujian']) === null ? oldData.hasil_pengujian : cekNull(req.files['hasil_pengujian']) 
    data.sertifikat = cekNull(req.files['sertifikat']) === null ? oldData.sertifikat : cekNull(req.files['sertifikat']) 
    if (dataFromApi.isUpdateStatus) {
      data.status = Number(oldData.status) + 1
      await prisma.form_sertifikasi_pertanian.update({
        where: {
          id: Number(req.params.id_form_sertifikasi)
        },
        data: {
          status: Number(oldData.status) + 1
        }
      })
    }
    await prisma.chld_sertif_pertanian.updateMany({
      where: {
        id_form_sertif_pertanian: Number(req.params.id_form_sertifikasi)
      },
      data: data
    })
    await prisma.history_sertifikasi_pertanian.create({
      data: {
        id_form_sertif_pertanian: Number(req.params.id_form_sertifikasi),
        keterangan: dataFromApi.message,
        status: dataFromApi.isUpdateStatus ? Number(oldData.status) + 1 : Number(oldData.status)
      }
    })
    res.json(response.success())
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.onCancel = async (req, res) => {
  try {
    const dataFromApi = req.body
    await prisma.history_sertifikasi_pertanian.create({
      data: {
        id_form_sertif_pertanian: Number(req.params.id_form_sertifikasi),
        keterangan: dataFromApi.message,
        status: 10
      }
    })
    await prisma.chld_sertif_pertanian.updateMany({
      where: {
        id_form_sertif_pertanian: Number(req.params.id_form_sertifikasi)
      },
      data: {
        status: 10
      }
    })
    await prisma.form_sertifikasi_pertanian.updateMany({
      where: {
        id: Number(req.params.id_form_sertifikasi)
      },
      data: {
        status: 10
      }
    })
    res.json(response.success())
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.dashboard = async (req, res) => {
  try {
    const data = await prisma.$queryRawUnsafe(`Select * from view_sertif_pertanian`)
    // console.log(data);
    let form = {}
    form.verifikasi_berkas = data.filter(item => item.status === 0).length
    form.pendahulan = data.filter(item => item.status === 1 || item.status === 2 || item.status === 3 || item.status === 4 || item.status === 5 || item.status === 6 || item.status === 7 || item.status === 8).length
    form.sertifikat = data.filter(item => item.status === 9).length
    form.gagal = data.filter(item => item.status === 10).length
    form.data = data
    console.log(form);
    res.json(response.successWithData(form))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}