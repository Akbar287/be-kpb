const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const xlsxtojson = require("xlsx-to-json-lc");
const { response, sekarang, uploadFiles, cekNull } = require('../utils/utils');
const path = require('path');
const fs = require('fs');
const helpers = require('../helpers/Helpers')
const moment = require('moment');

exports.exportPenerima = async (req, res) => {
  try {
    let getData
    const key = req.query.filter
    let newQuery = helpers.filterBea(req.query);
    let querys = helpers.convertQuery(newQuery)
    if (newQuery.length > 0) {
        getData = await prisma.$queryRawUnsafe(`SELECT * FROM tr_penerimaan_beasiswa ${querys} and (nama ilike $1 or npm ilike $2)`, `%${key}%`, `%${key}%`)
    } else {
        getData = await prisma.$queryRaw`SELECT * FROM tr_penerimaan_beasiswa where (nama ilike ${'%' + key + '%'} or npm ilike ${'%' + key + '%'})`
    }
    // console.log(getData);
    res.json(response.successWithData(getData))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.deletePenerima = async (req, res) => {
  try {
    await prisma.tr_penerimaan_beasiswa.delete({
      where: {
        id: Number(req.params.id)
      }
    })
    res.json(response.successData('Berhasil Menghapus'))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.importPenerima = async (req, res) => {
  try {
    const fileExcel = await uploadFiles(req, res)
    fs.unlink(req.file.path, () => {
        console.log("Berhasil menghapus file")
    });
    for (const data of fileExcel) {
        if (data.npm.length !== 0) {
            // console.log(data);
            await prisma.tr_penerimaan_beasiswa.create({
                data: {
                  npm: data.npm,
                  nama: data.nama,
                  universitas: data.universitas,
                  fakultas: data.fakultas,
                  prodi: data.prodi,
                  tanggal_masuk: data.tanggal_masuk,
                  tanggal_selesai: data.tanggal_selesai,
                  alamat: data.alamat,
                  tahun: data.tahun
                }
            })
        }
    }
    res.json({
        status: true,
        message: 'Berhasil Import Beasiswa',
    }) 
} catch (error) {
    console.log(error);
    res.status(500).json(response.error(500))
}
}

exports.getPenerima = async (req, res) => {
  try {
    let getData, total, data
    const key = req.query.filter
    const page = req.query.page
    const perpage = req.query.perpage
    let newQuery = helpers.filterBea(req.query);
    // console.log(req.query);
    // console.log(newQuery.length);
    let querys = helpers.convertQuery(newQuery)
    if (newQuery.length > 0) {
        getData = await prisma.$queryRawUnsafe(`SELECT * FROM tr_penerimaan_beasiswa ${querys} and (nama ilike $1 or npm ilike $2) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`, `%${key}%`, `%${key}%`)
        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM tr_penerimaan_beasiswa ${querys} and (nama ilike $1 or npm ilike $2)`, `%${key}%`, `%${key}%`)
    } else {
        getData = await prisma.$queryRaw`SELECT * FROM tr_penerimaan_beasiswa where (nama ilike ${'%' + key + '%'} or npm ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
        total = await prisma.$queryRaw`SELECT count(*) FROM tr_penerimaan_beasiswa where (nama ilike ${'%' + key + '%'} or npm ilike ${'%' + key + '%'})`
    }
    data = {
      universitas: [...new Set(getData.map(item => item.universitas))],
      fakultas: [...new Set(getData.map(item => item.fakultas))],
      tahun: [...new Set(getData.map(item => item.tahun))],
      data: getData
    }
    res.json(response.commonSuccessDataPaginate(data, total[0].count, Number(page), Number(perpage), key))
    // const data = await prisma.tr_penerimaan_beasiswa.findMany({})
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.createUniversitas = async (req, res) => {
  try {
    // const data = req.body
    let data = JSON.parse(req.body.data)
    // console.log(data);
    const image = cekNull(req.files['image'], '../public/universitas')
    const dataUniv = await prisma.institusi_pendidikan.findFirst({
      where: {
        member_id: Number(data.member_id)
      }
    })
    if (dataUniv) {
      if (image && data.logo) {
        // console.log(data.logo);
        fs.unlinkSync(`./public/universitas/${data.logo}`)
        data.logo = image
        // console.log(data.logo);
      } else if (image) {
        data.logo = image
      }
      const update = await prisma.institusi_pendidikan.update({
        where: {
          id: Number(dataUniv.id)
        },
        data: data
      })
    } else {
      data.logo = image
      const create = await prisma.institusi_pendidikan.create({
        data: data
      })
    }
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getAllUniversitas = async (req, res) => {
  try {
    const data = await prisma.users_login.findMany({
      where: {
        access: 'institusi'
      },
      include: {
        member: {
          include: {
            ktp: true,
            institusi_pendidikan: true
          }
        }
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getUniv = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.institusi_pendidikan.findFirst({
      where: {
        member_id: Number(id)
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.createBeasiswa = async (req, res) => {
  try {
    let data = req.body
    // console.log(data);
    data.tanggal_dimulai = await moment(data.tanggal_dimulai, "dddd, D MMM YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';
    data.tanggal_selesai = await moment(data.tanggal_selesai, "dddd, D MMM YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';
    // console.log('================================');
    // console.log(data);
    const createBeasiswa = await prisma.beasiswa.create({
      data: data
    })
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getAllBeasiswa = async (req, res) => {
  try {
    const data = await prisma.beasiswa.findMany({
      include: {
        institusi_pendidikan: true
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getBeasiswa = async (req, res) => {
  try {
    const id = req.params.id
    // console.log(id);
    const data = await prisma.beasiswa.findFirst({
      where: {
        id: Number(id)
      },
      include: {
        institusi_pendidikan: true
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getBeasiswabyUniv = async (req, res) => {
  try {
    const id = req.params.id
    const data = await prisma.beasiswa.findMany({
      where: {
        id_institusi: Number(id)
      },
      include: {
        institusi_pendidikan: true
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.updateBeasiswa = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = req.body
    // console.log(data);
    data.tanggal_dimulai = await moment(data.tanggal_dimulai, "dddd, D MMM YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';
    data.tanggal_selesai = await moment(data.tanggal_selesai, "dddd, D MMM YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';
    const update = await prisma.beasiswa.update({
      where: {
        id: id
      },
      data: data
    })
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.deleteBeasiswa = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const dataPengajuan = await prisma.master_beasiswa.findMany({
      where: {
        id_beasiswa: id
      }
    })
    if (dataPengajuan.length <= 0) {
      const deleteItem = await prisma.beasiswa.delete({
        where: {
          id: id
        }
      })
      res.json(response.success(200))
    } else {
      res.json(response.successData('Ada Pengajuan di Beasiswa Ini'))
    }
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.createRecomendation = async (req, res) => {
  try {
    const data = req.body
    data.nilai_un = parseFloat(data.nilai_un)
    data.id_beasiswa = Number(data.id_beasiswa)
    data.status_pengajuan = Number(0)
    // console.log(data);
    const create = await prisma.master_beasiswa.create({
      data: data
    })
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getRecomendations = async (req, res) => {
  try {
    const data = await prisma.master_beasiswa.findMany({
      include: {
        beasiswa: {
          include: {
            institusi_pendidikan: true
          }
        },
        member: {
          include: {
            ktp: true
          }
        }
      },
      orderBy: {
        id_master_beasiswa: 'desc'
      }
    })
    // console.log(data);
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getRecomendationsbyMember = async (req, res) => {
  try {
    const nik = req.params.nik
    const data = await prisma.master_beasiswa.findMany({
      where: {
        nik_wali: nik
      },
      include: {
        beasiswa: {
          include: {
            institusi_pendidikan: true
          }
        },
        member: {
          include: {
            ktp: true
          }
        }
      }
    })
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getRecomendationsbyUniv = async (req, res) => {
  try {
    const id = req.params.id
    const dataUniv = await prisma.institusi_pendidikan.findFirst({
      where: {
        member_id: Number(id),
      },
      include: {
        beasiswa: {
          include: {
            master_beasiswa: {
              include: {
                beasiswa: true,
                member: {
                  include: {
                    ktp: true
                  }
                }
              }
            }
          }
        }
      }
    })
    let data = null
    let finalData = []
    for (let i = 0; i < dataUniv.beasiswa.length; i++) {
      data = dataUniv.beasiswa[i].master_beasiswa
      for (let j = 0; j < data.length; j++) {
        finalData.push(data[j])
      }
    }
    // console.log(finalData);
    res.json(response.successWithData(finalData, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.getDetailRecomendation = async (req, res) => {
  try {
    const id = req.params.id
    const data = await prisma.master_beasiswa.findFirst({
      where: {
        id_master_beasiswa: Number(id)
      },
      include: {
        beasiswa: {
          include: {
            institusi_pendidikan: true
          }
        },
        member: {
          include: {
            ktp: true
          }
        }
      }
    })
    res.json(response.successWithData(data, 200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}

exports.updateRecomendation = async (req, res) => {
  try {
    const id = req.params.id
    const status = req.body.status
    const file = cekNull(req.files['file'], '../public/pengajuan')
    const update = await prisma.master_beasiswa.update({
      where: {
        id_master_beasiswa: Number(id),
      },
      data: {
        status_pengajuan: Number(status),
        file_pengajuan: file
      }
    })
    res.json(response.success(200))
  } catch (error) {
    console.log(error)
    res.json(response.error)
  }
}

exports.deleteRecomendations = async (req, res) => {
  try {
    const id = req.params.id
    const data = await prisma.master_beasiswa.findFirst({
      where: {
        id_master_beasiswa: Number(id)
      }
    })
    const deleteMaster = await prisma.master_beasiswa.delete({
      where: {
        id_master_beasiswa: Number(id)
      }
    })
    if (data.file_pengajuan) {
      fs.unlinkSync(`./public/pengajuan/${data.file_pengajuan}`)
    }
    res.json(response.success(200))
  } catch (error) {
    console.log(error);
    res.json(response.error)
  }
}
