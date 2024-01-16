const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, cekNull } = require('../utils/utils');

exports.addSertif = async (req, res) => {
  try {
    // Make New ID
    // const newId = await prisma.$queryRaw`SELECT id FROM master_sertifikasi_benih ORDER BY id DESC limit 1`;
    // Make Form
    const data = JSON.parse(req.body.data)
    data.surat_permohonan = cekNull(req.files['suratPermohonan'], '../public/file_sertif')
    data.iup = cekNull(req.files['suratIUP'], '../public/file_sertif')
    data.surat_asal_benih = cekNull(req.files['suratAsalBenih'], '../public/file_sertif')
    data.DoPengiriman = cekNull(req.files['suratDO'], '../public/fsile_sertif')
    data.desainKebun = cekNull(req.files['desainKebun'], '../public/file_sertif')
    data.Catatan = cekNull(req.files['Catatan'], '../public/file_sertif')
    data.ktp = cekNull(req.files['ktp'], '../public/file_sertif')
    data.status = Number(0)
    data.maps = `http://www.google.com/maps/place/${data.location.lat},${data.location.lng}`
    // Create Data
    const query = await prisma.master_sertifikasi_benih.create({
      data: {
        // id: Number(newId[0].id) + 1,
        nik: data.nik,
        namaPerusahaan: data.namaPerusahaan,
        alamat: data.alamat,
        maps: data.maps,
        surat_permohonan: data.surat_permohonan,
        iup: data.iup,
        lat: data.location.lat,
        lon: data.location.lng,
        surat_asal_benih: data.surat_asal_benih,
        do_pengiriman: data.DoPengiriman,
        status: Number(0),
        jenis_benih: data.jenis_benih,
        catatan_pemeliharaan_kebun: data.Catatan,
        desain_kebun: data.desainKebun,
        ktp_image: data.ktp,
        benih_diajukan: Number(data.jumlah_benih),
        benih_sertifikasi: 0
      }
    })
    // Create History
    if (query) {
      await prisma.chld_history_sertifikasi_benih.create({
        data: {
          id_master: query.id,
          tanggal_perubahan: await sekarang(),
          status: '0',
          comment: 'Berkas sedang diperiksa oleh pihak bP2MB'
        }
      })
      res.json(response.successWithData({
        id: Number(query.id)
      }))
    } else {
      res.json(response.errorWithData('Terjadi error', 500))
    }
  } catch (error) {
    console.log(error);
    res.json(response.error(400))
  }
}

exports.getSertif = async (req, res) => {
  try {
    let data = await prisma.master_sertifikasi_benih.findMany({
      orderBy: {
        id: 'desc'
      },
      include: {
        ktp: {
          include: {
            member: true
          }
        }
      }
    })
    for (d of data) {
      const date = await prisma.chld_history_sertifikasi_benih.findFirst({
        where: {
          id_master: d.id
        },
        orderBy: {
          tanggal_perubahan: 'asc'
        }
      })
      d.tanggal_awal = date.tanggal_perubahan
    }
    res.json(response.successWithData(data, 201))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
}

exports.getSertifByNik = async (req, res) => {
  try {
    const nik = req.params.nik
    let data = await prisma.master_sertifikasi_benih.findMany({
      where: {
        nik: nik
      },
      orderBy: {
        id: 'desc'
      }
    })
    for (d of data) {
      const date = await prisma.chld_history_sertifikasi_benih.findFirst({
        where: {
          id_master: d.id
        },
        orderBy: {
          tanggal_perubahan: 'asc'
        }
      })
      d.tanggal_awal = date.tanggal_perubahan
      console.log(data)
    }
    res.json(response.successWithData(data, 202))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
}

exports.detailSertif = async (req, res) => {
  try {
    const id = req.params.id
    const dataSertif = await prisma.master_sertifikasi_benih.findFirst({
      where: {
        id: Number(id)
      },
      include: {
        chld_history_sertifikasi_benih: true,
        ktp: {
          include: {
            member: {
              include: {
                reg_districts: true,
                reg_provinces: true,
                reg_regencies: true,
                reg_villages: true,
              }
            }
          }
        }
      }
    })
    console.log(dataSertif);
    res.json(response.successWithData(dataSertif, 201));
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};

exports.updateSertif = async (req, res) => {
  try {
    const id = req.params.id
    const data = req.body
    if (data.status <= 4) {
      const query = await prisma.master_sertifikasi_benih.update({
        where: {
          id: Number(id),
        },
        data: {
          status: Number(data.status),
          benih_sertifikasi: Number(data.status == 3 ? data.jumlah_benih_sertif : 0),
          sertifikat: cekNull(req.files['sertifikat'])
        }
      })
    
      data.status = String(data.status)
      if (query) {
        await prisma.chld_history_sertifikasi_benih.create({
          data: {
            id_master: Number(id),
            status: String(data.status),
            tanggal_perubahan: await sekarang(),
            comment: data.comment,
            file: cekNull(req.files['file'])
          }
        })
      }
    } else {
      const fileerror = cekNull(req.files['file'])
      console.log(fileerror);

      const query = await prisma.master_sertifikasi_benih.update({
        where: {
          id: Number(id),
        },
        data: {
          status: Number(data.status),
          benih_sertifikasi: Number(data.status == 3 ? data.jumlah_benih_sertif : 0),
          keterangan_error: fileerror
        }
      })
    
      if (query) {
        await prisma.chld_history_sertifikasi_benih.create({
          data: {
            id_master: Number(id),
            status: String(data.status),
            tanggal_perubahan: await sekarang(),
            comment: data.comment,
            file: fileerror
          }
        })
      }
    }
    res.json(response.successData('Berhasil Ubah Status'))
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error)
  }
};