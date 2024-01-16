const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, uploadFiles } = require('../utils/utils');
const fs = require('fs')
const randomString = require('randomstring')
const microtime = require('microtime');
const helpers = require('../helpers/Helpers')
const path = require("path");
const https = require("https");
const rootCas = require("ssl-root-cas").create();
const axios = require('axios');
rootCas.addFile(path.resolve(__dirname, "../cert/intermediate1.pem"));
const httpsAgent = new https.Agent({ ca: rootCas });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const baseVaUrl = 'https://api.e-kpb.lampungprov.go.id:8443'
const headers = () => {
    const headers = {
        httpsAgent,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    };
    return headers;
};

const createVa = (req) =>
    new Promise(async (res, rej) => {
        await axios.post(`${baseVaUrl}/bni/create-va`, req, headers())
            .then((response) => {
                res(response)
            })
            .catch((error) => {
                rej(error)
            });
    })

exports.importAlokasi = async (req, res) => {
    try {

        const fileExcel = await uploadFiles(req, res)
        fs.unlink(req.file.path, () => {
            console.log("Berhasil menghapus file")
        });
        const dataInput = []
        const dataError = []

        // for (dataExcel of fileExcel) {
        for (let i = 0; i < fileExcel.length; i++) {
            const dataExcel = fileExcel[i]
            if (dataExcel.NIK !== '' || dataExcel.NIK !== null || dataExcel.NIK !== undefined) {
                //REPLACE NIK
                dataExcel.NIK = dataExcel.NIK.replace(/['"]+/g, "");
                dataExcel.nik_poktan = dataExcel.nik_poktan.replace(/['"]+/g, "");
                dataExcel.penyuluh_nik = dataExcel.penyuluh_nik.replace(/['"]+/g, "");
                //CEK DATA POKTAN DI TABEL PUBERS POKTAN
                const cekPoktan = await prisma.pubers_poktan.findFirst({
                    where: {
                        nik_poktan: dataExcel.nik_poktan,
                        sektor_id: Number(req.body.id_sektor)
                    }
                })

                //CEK DATA MEMBER SUDAH TERDAFTAR ATAU BELUM DITABEL MEMBER
                const cekMember = await prisma.member.findFirst({
                    where: {
                        nik: dataExcel.NIK
                    }
                })

                const cekMemberPenyuluh = await prisma.member.findFirst({
                    where: {
                        nik: dataExcel.penyuluh_nik
                    }
                })

                if (cekMemberPenyuluh) {
                    if (cekMember) {
                        if (cekPoktan) {
                            let idPoktan = Number(cekPoktan.poktan_id)
                            let mainData = {
                                penyuluh_nik: dataExcel.penyuluh_nik,
                                kode_kios: dataExcel.kode_kios,
                                poktan_id: idPoktan,
                                NIK: dataExcel.NIK,
                                tahun: 2023,
                            }
                            const cekMt1 = await prisma.pubers_ealokasi.findFirst({
                                where: {
                                    poktan_id: idPoktan,
                                    komoditas_id: Number(dataExcel.komoditas_idMT1),
                                    NIK: dataExcel.NIK,
                                    masatanam: 1,
                                    tahun: 2023
                                }
                            })
                            const cekMt2 = await prisma.pubers_ealokasi.findFirst({
                                where: {
                                    poktan_id: idPoktan,
                                    komoditas_id: Number(dataExcel.komoditas_idMT2),
                                    NIK: dataExcel.NIK,
                                    masatanam: 2,
                                    tahun: 2023
                                }
                            })
                            const cekMt3 = await prisma.pubers_ealokasi.findFirst({
                                where: {
                                    poktan_id: idPoktan,
                                    komoditas_id: Number(dataExcel.komoditas_idMT3),
                                    NIK: dataExcel.NIK,
                                    masatanam: 3,
                                    tahun: 2023
                                }
                            })
                            if (!cekMt1 && dataExcel.NIK !== '') {
                                dataInput.push({
                                    ...mainData,
                                    masatanam: 1,
                                    komoditas_id: Number(dataExcel.komoditas_idMT1),
                                    luaslahan: Number(dataExcel.luaslahanMT1),
                                    urea: Number(dataExcel.ureaMT1),
                                    npk: Number(dataExcel.npkMT1),
                                    npkfk: Number(dataExcel.npkfkMT1),
                                })
                            }

                            if (!cekMt2 && dataExcel.NIK !== '') {
                                dataInput.push({
                                    ...mainData,
                                    masatanam: 2,
                                    komoditas_id: Number(dataExcel.komoditas_idMT2),
                                    luaslahan: Number(dataExcel.luaslahanMT2),
                                    urea: Number(dataExcel.ureaMT2),
                                    npk: Number(dataExcel.npkMT2),
                                    npkfk: Number(dataExcel.npkfkMT2),
                                })
                            }

                            if (!cekMt3 && dataExcel.NIK !== '') {
                                dataInput.push({
                                    ...mainData,
                                    masatanam: 3,
                                    komoditas_id: Number(dataExcel.komoditas_idMT3),
                                    luaslahan: Number(dataExcel.luaslahanMT3),
                                    urea: Number(dataExcel.ureaMT3),
                                    npk: Number(dataExcel.npkMT3),
                                    npkfk: Number(dataExcel.npkfkMT3),
                                })
                            }
                        } else {
                            // CEK MEMBER POKTAN
                            const cekMemberPoktan = await prisma.member.findFirst({
                                where: {
                                    nik: dataExcel.nik_poktan
                                },
                                include: {
                                    ktp: true
                                }
                            })
                            if (cekMemberPoktan) {
                                console.log({
                                    data: {
                                        nama_poktan: cekMemberPoktan.ktp.nama,
                                        sektor_id: 1,
                                        nik_poktan: cekMemberPoktan.nik
                                    }
                                })
                                // CREATE POKTAN 
                                const createNewPoktan = await prisma.pubers_poktan.create({
                                    data: {
                                        nama_poktan: cekMemberPoktan.ktp.nama,
                                        sektor_id: 1,
                                        nik_poktan: cekMemberPoktan.nik
                                    }
                                })
                                let idPoktan = Number(createNewPoktan.poktan_id)
                                let mainData = {
                                    penyuluh_nik: dataExcel.penyuluh_nik,
                                    kode_kios: dataExcel.kode_kios,
                                    poktan_id: idPoktan,
                                    NIK: dataExcel.NIK,
                                    tahun: 2023,
                                }
                                const cekMt1 = await prisma.pubers_ealokasi.findFirst({
                                    where: {
                                        poktan_id: idPoktan,
                                        komoditas_id: Number(dataExcel.komoditas_idMT1),
                                        NIK: dataExcel.NIK,
                                        masatanam: 1,
                                        tahun: 2023
                                    }
                                })
                                const cekMt2 = await prisma.pubers_ealokasi.findFirst({
                                    where: {
                                        poktan_id: idPoktan,
                                        komoditas_id: Number(dataExcel.komoditas_idMT2),
                                        NIK: dataExcel.NIK,
                                        masatanam: 2,
                                        tahun: 2023
                                    }
                                })
                                const cekMt3 = await prisma.pubers_ealokasi.findFirst({
                                    where: {
                                        poktan_id: idPoktan,
                                        komoditas_id: Number(dataExcel.komoditas_idMT3),
                                        NIK: dataExcel.NIK,
                                        masatanam: 3,
                                        tahun: 2023
                                    }
                                })
                                if (!cekMt1 && dataExcel.NIK !== '') {
                                    dataInput.push({
                                        ...mainData,
                                        masatanam: 1,
                                        komoditas_id: Number(dataExcel.komoditas_idMT1),
                                        luaslahan: Number(dataExcel.luaslahanMT1),
                                        urea: Number(dataExcel.ureaMT1),
                                        npk: Number(dataExcel.npkMT1),
                                        npkfk: Number(dataExcel.npkfkMT1),
                                    })
                                }

                                if (!cekMt2 && dataExcel.NIK !== '') {
                                    dataInput.push({
                                        ...mainData,
                                        masatanam: 2,
                                        komoditas_id: Number(dataExcel.komoditas_idMT2),
                                        luaslahan: Number(dataExcel.luaslahanMT2),
                                        urea: Number(dataExcel.ureaMT2),
                                        npk: Number(dataExcel.npkMT2),
                                        npkfk: Number(dataExcel.npkfkMT2),
                                    })
                                }

                                if (!cekMt3 && dataExcel.NIK !== '') {
                                    dataInput.push({
                                        ...mainData,
                                        masatanam: 3,
                                        komoditas_id: Number(dataExcel.komoditas_idMT3),
                                        luaslahan: Number(dataExcel.luaslahanMT3),
                                        urea: Number(dataExcel.ureaMT3),
                                        npk: Number(dataExcel.npkMT3),
                                        npkfk: Number(dataExcel.npkfkMT3),
                                    })
                                }
                            } else {
                                dataError.push({ nik: `${dataExcel.nik_poktan} Nik Poktan`, keterangan: "Poktan Belum Jadi Member" })
                            }
                        }
                    } else {
                        dataError.push({ nik: `${dataExcel.NIK} Nik Petani`, keterangan: "Petani Belum Jadi Member" })
                    }
                } else {
                    dataError.push({ nik: `${dataExcel.penyuluh_nik} Nik Penyuluh`, keterangan: "Penyuluh Belum Jadi Member" })
                }
            }

        }
        if (dataInput.length > 0) {
            await prisma.pubers_ealokasi.createMany({
                data: dataInput
            })
            await prisma.pubers_ealokasi_stok.createMany({
                data: dataInput
            })


            if (dataError.length > 0) {
                res.json(response.successWithDataNikerror({ dataError: dataError }, true, 200))
            } else {
                res.json(response.successWithDataNikerror({ dataError: dataError }, false, 200))
            }
        } else {
            res.json(response.successWithDataNikerror({ dataError: dataError }, true, 200))
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getAllDataALokasi = async (req, res) => {
    try {
        let query, total
        const key = req.query.filter
        const page = req.query.page
        const perpage = req.query.perpage
        let newQuery = helpers.filterDataAlokasi(req.query);
        let querys = helpers.convertQuery(newQuery)
        query = await prisma.$queryRawUnsafe(`SELECT * FROM v_alokasi ${querys} ORDER BY alokasi_id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)
        let countQuer
        if (querys === '') {
            countQuer = `SELECT count(*) FROM pubers_ealokasi`
        } else {
            countQuer = `SELECT count(alokasi_id) FROM views_alokasi ${querys}`
        }
        console.log(countQuer)
        total = await prisma.$queryRawUnsafe(countQuer)

        res.json(response.commonSuccessDataPaginate(query, total[0].count, Number(page), Number(perpage), key))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.getAllDataALokasiByPoktan = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`
                SELECT * from view_alokasi_stok 
                where 
                    nik_poktan = ${req.params.nik} and 
                    komoditas_id = ${Number(req.params.komoditas)} and 
                    masatanam = ${Number(req.params.masatanam)} and 
                    tahun = ${Number(req.params.tahun)}`

        for (dataAlokasi of query) {
            const getHargaUrea = await prisma.pubers_pupuk.findUnique({ where: { pupuk_id: 1 } })
            const getHargaNpk = await prisma.pubers_pupuk.findUnique({ where: { pupuk_id: 2 } })
            const getHargaNpkFk = await prisma.pubers_pupuk.findUnique({ where: { pupuk_id: 3 } })
            dataAlokasi.harga_urea = Number(getHargaUrea.harga)
            dataAlokasi.harga_npk = Number(getHargaNpk.harga)
            dataAlokasi.harga_npk_fk = Number(getHargaNpkFk.harga)
        }
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}
///belum selesai
exports.getAllDataALokasiByPetani = async (req, res) => {
    try {
        const alokasi = await prisma.pubers_ealokasi.groupBy({
            by: ['NIK'],
            where: {
                NIK: req.params.nik,
                tahun: Number(req.query.tahun)
            },
            _sum: {
                urea: true,
                npk: true,
                npkfk: true
            }
        })
        const sudahDitebus = await prisma.pubers_ealokasi_stok.groupBy({
            by: ['NIK'],
            where: {
                NIK: req.params.nik,
                tahun: Number(req.query.tahun)
            },
            _sum: {
                urea: true,
                npk: true,
                npkfk: true
            }
        })
        const sisaAlokasi = await prisma.$queryRawUnsafe(`
                            SELECT SUM
                                ( urea ) AS urea,
                                SUM ( npk ) AS npk,
                                SUM ( npkfk ) AS npkfk 
                            FROM
                                pubers_chld_transaksi 
                            WHERE
                                nik = '${req.params.nik}' 
                                AND EXTRACT ( YEAR FROM created_at ) = ${Number(req.query.tahun)}
        `)
        res.json(response.successWithData({
            alokasi: alokasi,
            sudahDitebus: sudahDitebus,
            sisaAlokasi: sisaAlokasi,
        }, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}



exports.createUniqNumber = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT count(*) from pubers_master_transaksi where kode_kios  = ${req.body.kode_kios}`
        const totalTransaksi = Number(req.body.totaltransaksi) + Number(query[0].count)
        res.json(response.successDataReturnUniqiD(totalTransaksi, 200))
    } catch (error) {
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.transaksiAlokasiStok = async (req, res) => {
    // res.json(response.errorWithData("OPPS !!!!! Sedang dalam pengembangan", 400))
    try {
        const data = req.body
        const query = await prisma.$queryRaw`SELECT count(*) from pubers_master_transaksi where kode_kios  = ${req.body.kode_kios}`
        const totalTransaksiUniq = Number(data.totaltransaksi) + Number(query[0].count)
        const kodeTransaksi = `TRNS-${randomString.generate(4)}-${microtime.now()}-${data.kode_kios}`
        const getStokKios = await prisma.pubers_stokkios.findFirst({ where: { kode_kios: data.kode_kios } })
        const cekTransaksi = await prisma.pubers_master_transaksi.findMany({ where: { poktan_id: Number(data.poktan_id), NOT: { statustransaksi: 4 } } })
        if (cekTransaksi.length > 0) {
            res.json(response.errorWithData('Mohon selesaikan transaksi sebelumnya!!!', 400))
        } else {
            if (getStokKios) {
                if (Number(data.totalUrea) > Number(getStokKios.UREA)) {
                    res.json(response.errorWithData("Stok Urea DiKios Tidak Mencukupi!!!!!", 400))
                } else if (Number(data.totalNpk) > Number(getStokKios.NPK)) {
                    res.json(response.errorWithData("Stok NPK DiKios Tidak Mencukupi!!!!!", 400))
                } else if (Number(data.totalNpkFk) > Number(getStokKios.NPKFK)) {
                    res.json(response.errorWithData("Stok NPK Formula Khusus DiKios Tidak Mencukupi!!!!!", 400))
                } else {
                    if (Number(data.totaltransaksi) <= 0 || Number(data.totaltransaksi_uniq) <= 0) return res.json(response.errorWithData("Total transaksi harus lebih dari 0", 400))
                    const detailTransaksi = data.detail_transaksi
                    const komoditas = data.komoditas
                    data.statustransaksi = 0
                    data.kode_transaksi = kodeTransaksi
                    data.created_at = await sekarang()
                    data.totaltransaksi_uniq = totalTransaksiUniq
                    delete data.detail_transaksi
                    // ====== CREATE TRANSAKSI ======= 
                    // console.log(data)
                    const createTransaksi = await prisma.pubers_master_transaksi.create({ data: data })
                    if (createTransaksi) {
                        delete data.komoditas
                        // ====== CREATE HISTORY STATUS TRANSAKSI ======= 
                        await prisma.pubers_history_master_transaksi.create({
                            data: {
                                transaksi_id: createTransaksi.transaksi_id,
                                status: 0,
                                tanggalstatus: await sekarang()
                            }
                        })
                        // ====== UPDATE STOK KIOS ======= 
                        const updatePupukKios = await prisma.pubers_stokkios.update({
                            where: { stok_id: getStokKios.stok_id },
                            data: {
                                UREA: Number(getStokKios.UREA) - Number(data.totalUrea),
                                NPK: Number(getStokKios.NPK) - Number(data.totalNpk),
                                NPKFK: Number(getStokKios.NPKFK) - Number(data.totalNpkFk),
                            }
                        })
                        if (updatePupukKios) {
                            // ====== CREATE HISTORY STOK KIOS =======
                            // for (dataDetail of detailTransaksi) {
                            for (let index = 0; index < detailTransaksi.length; index++) {
                                const dataDetail = detailTransaksi[index];

                                if (Number(dataDetail.urea) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: { kode_kios: data.kode_kios, pupuk_id: 1, jumlah: dataDetail.urea }
                                    })
                                }
                                if (Number(dataDetail.npk) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: { kode_kios: data.kode_kios, pupuk_id: 2, jumlah: dataDetail.npk }
                                    })
                                }
                                if (Number(dataDetail.npkfk) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: {
                                            kode_kios: data.kode_kios, pupuk_id: 3, jumlah: dataDetail.npkfk
                                        }
                                    })
                                }
                                // ====== UPDATE STOK PUBERS PUPUK PER PETANI =======
                                await prisma.$queryRaw`
                                                UPDATE pubers_ealokasi_stok 
                                                SET urea =  ${Number(dataDetail.dataAsliUrea) - Number(dataDetail.urea)},
                                                npk =  ${Number(dataDetail.dataAsliNPK) - Number(dataDetail.npk)},
                                                npkfk =  ${Number(dataDetail.dataAsliNPKFK) - Number(dataDetail.npkfk)} 
                                                WHERE
                                                    poktan_id = ${data.poktan_id} 
                                                    AND komoditas_id = ${komoditas} 
                                                    AND masatanam = ${data.masatanam} 
                                                    AND tahun = ${data.tahun} 
                                                    AND "NIK" = ${dataDetail.nik}  
                                                    AND kode_kios = ${data.kode_kios}`
                                dataDetail.transaksi_id = createTransaksi.transaksi_id
                                dataDetail.created_at = await sekarang()
                                delete dataDetail.dataAsliUrea
                                delete dataDetail.dataAsliNPK
                                delete dataDetail.dataAsliNPKFK
                            }

                            // ====== CREATE DETAIL TRANSAKSI ======= 
                            await prisma.pubers_chld_transaksi.createMany({ data: detailTransaksi })
                        }

                        res.json(response.successDataReturnUniqiD(totalTransaksiUniq, 200))
                    }
                }
            } else {
                res.json(response.errorWithData("Kios belum menginput stok!!!!!", 400))
            }
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.transaksiAlokasiStokVirtualAccount = async (req, res) => {
    try {
        const data = req.body
        const query = await prisma.$queryRaw`SELECT count(*) from pubers_master_transaksi where kode_kios  = ${req.body.kode_kios}`
        const totalTransaksiUniq = Number(data.totaltransaksi) + Number(query[0].count)
        const kodeTransaksi = `TRNS-${randomString.generate(8)}-${data.kode_kios}`
        const getStokKios = await prisma.pubers_stokkios.findFirst({ where: { kode_kios: data.kode_kios } })
        const cekTransaksi = await prisma.pubers_master_transaksi.findMany({ where: { poktan_id: Number(data.poktan_id), NOT: { statustransaksi: 4 } } })
        if (cekTransaksi.length > 0) {
            res.json(response.errorWithData('Mohon selesaikan transaksi sebelumnya!!!', 400))
        } else {
            if (Number(data.totalUrea) > Number(getStokKios.UREA)) {
                res.json(response.errorWithData("Stok Urea DiKios Tidak Mencukupi!!!!!", 400))
            } else if (Number(data.totalNpk) > Number(getStokKios.NPK)) {
                res.json(response.errorWithData("Stok NPK DiKios Tidak Mencukupi!!!!!", 400))
            } else if (Number(data.totalNpkFk) > Number(getStokKios.NPKFK)) {
                res.json(response.errorWithData("Stok NPK Formula Khusus DiKios Tidak Mencukupi!!!!!", 400))
            } else {
                if (Number(data.totaltransaksi) <= 0 || Number(data.totaltransaksi_uniq) <= 0) return res.json(response.errorWithData("Total transaksi harus lebih dari 0", 400))
                const detailTransaksi = data.detail_transaksi
                const komoditas = data.komoditas
                data.statustransaksi = 0
                data.kode_transaksi = kodeTransaksi
                data.created_at = await sekarang()
                data.totaltransaksi_uniq = totalTransaksiUniq
                data.expiredVa = new Date(+new Date() + 4.8 * 36000 * 1000);
                // data.expiredVa = new Date(+new Date() + 4.8);
                data.statusVa = 'pending'
                delete data.detail_transaksi
                // ====== CREATE TRANSAKSI =======

                const createVaNumber = await createVa({
                    total: data.totaltransaksi,
                    nama: data.nama_poktan,
                    email: 'ekpblampung@gmail.com',
                    noTelp: '082181555123',
                    deskripsi: `Pembayaran pupuk subsidi dari Kelompk Tani ${data.nama_poktan} sebesar ${data.totaltransaksi}`,
                    idTransaksi: kodeTransaksi
                })

                if (createVaNumber.data.status) {
                    delete data.nama_poktan
                    data.va = createVaNumber.data.result.virtual_account
                    const createTransaksi = await prisma.pubers_master_transaksi.create({ data: data })
                    if (createTransaksi) {
                        delete data.komoditas
                        // ====== CREATE HISTORY STATUS TRANSAKSI ======= 
                        await prisma.pubers_history_master_transaksi.create({
                            data: {
                                transaksi_id: createTransaksi.transaksi_id,
                                status: 0,
                                va: data.va,
                                statusVa: data.statusVa,
                                tanggalstatus: await sekarang()
                            }
                        })
                        // ====== UPDATE STOK KIOS ======= 
                        const updatePupukKios = await prisma.pubers_stokkios.update({
                            where: { stok_id: getStokKios.stok_id },
                            data: {
                                UREA: Number(getStokKios.UREA) - Number(data.totalUrea),
                                NPK: Number(getStokKios.NPK) - Number(data.totalNpk),
                                NPKFK: Number(getStokKios.NPKFK) - Number(data.totalNpkFk),
                            }
                        })
                        if (updatePupukKios) {
                            // ====== CREATE HISTORY STOK KIOS =======
                            // for (dataDetail of detailTransaksi) {
                            for (let index = 0; index < detailTransaksi.length; index++) {
                                const dataDetail = detailTransaksi[index];

                                if (Number(dataDetail.urea) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: { kode_kios: data.kode_kios, pupuk_id: 1, jumlah: dataDetail.urea }
                                    })
                                }
                                if (Number(dataDetail.npk) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: { kode_kios: data.kode_kios, pupuk_id: 2, jumlah: dataDetail.npk }
                                    })
                                }
                                if (Number(dataDetail.npkfk) > 0) {
                                    await prisma.pubers_stokkios_chld.create({
                                        data: {
                                            kode_kios: data.kode_kios, pupuk_id: 3, jumlah: dataDetail.npkfk
                                        }
                                    })
                                }
                                // ====== UPDATE STOK PUBERS PUPUK PER PETANI =======
                                await prisma.$queryRaw`
                                                UPDATE pubers_ealokasi_stok 
                                                SET urea =  ${Number(dataDetail.dataAsliUrea) - Number(dataDetail.urea)},
                                                npk =  ${Number(dataDetail.dataAsliNPK) - Number(dataDetail.npk)},
                                                npkfk =  ${Number(dataDetail.dataAsliNPKFK) - Number(dataDetail.npkfk)} 
                                                WHERE
                                                    poktan_id = ${data.poktan_id} 
                                                    AND komoditas_id = ${komoditas} 
                                                    AND masatanam = ${data.masatanam} 
                                                    AND tahun = ${data.tahun} 
                                                    AND "NIK" = ${dataDetail.nik}  
                                                    AND kode_kios = ${data.kode_kios}`
                                dataDetail.transaksi_id = createTransaksi.transaksi_id
                                dataDetail.created_at = await sekarang()
                                delete dataDetail.dataAsliUrea
                                delete dataDetail.dataAsliNPK
                                delete dataDetail.dataAsliNPKFK
                            }

                            // ====== CREATE DETAIL TRANSAKSI ======= 
                            await prisma.pubers_chld_transaksi.createMany({ data: detailTransaksi })
                        }

                        res.json(response.successWithData(data, 200))
                    }
                } else {
                    res.json(response.errorWithData('Virtual Account gagal dibuat!!!. Silahkan hubungi KPB Center!!!!'))
                }

            }
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.reGenerateVa = async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        const kodeTransaksi = `TRNS-${randomString.generate(8)}-${data.kode_kios}`
        const createVaNumber = await createVa({
            total: data.totaltransaksi,
            nama: data.nama_poktan,
            email: 'e-kpb@lampungprov.go.id',
            noTelp: '082181555123',
            deskripsi: `Penerbitan ulan nomor VA dari Kelompk Tani ${data.nama_poktan} sebesar ${data.totaltransaksi}`,
            idTransaksi: kodeTransaksi
        })
        if (createVaNumber.data.status) {
            await prisma.pubers_master_transaksi.update({
                where: {
                    transaksi_id: data.transaksi_id
                },
                data: {
                    kode_transaksi: kodeTransaksi,
                    va: createVaNumber.data.result.virtual_account,
                    expiredVa: new Date(+new Date() + 4.8 * 36000 * 1000)
                }
            })
            await prisma.pubers_history_master_transaksi.create({
                data: {
                    transaksi_id: data.transaksi_id,
                    status: 0,
                    tanggalstatus: await sekarang(),
                    va: createVaNumber.data.result.virtual_account,
                    statusVa: 'pending'

                }
            })
            await prisma.pubers_history_master_transaksi.create({
                data: {
                    transaksi_id: data.transaksi_id,
                    status: 6,
                    tanggalstatus: await sekarang(),
                    va: data.va,
                    statusVa: 'expired'

                }
            })
            res.json(response.successData('Virtual account berhasil diterbitkan ulang!!!', 200))
        } else {
            res.json(response.errorWithData('Virtual Account gagal dibuat!!!. Silahkan hubungi KPB Center!!!!'))
        }
    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.getDataTransaksi = async (req, res) => {
    try {
        let query, total
        const key = req.query.filter
        const page = req.query.page
        const perpage = req.query.perpage
        let newQuery = helpers.filterData(req.query);
        let querys = helpers.convertQuery(newQuery)
        query = await prisma.$queryRawUnsafe(`SELECT * FROM view_transaksi_pubers ${querys} ORDER BY transaksi_id desc limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`)
        for (dataPetani of query) {
            const tot = await prisma.$queryRaw`SELECT count(*) FROM pubers_master_transaksi INNER JOIN pubers_chld_transaksi ON pubers_master_transaksi.transaksi_id=pubers_chld_transaksi.transaksi_id WHERE pubers_chld_transaksi.transaksi_id=${dataPetani.transaksi_id}`
            dataPetani.totalPetani = tot[0].count
        }
        total = await prisma.$queryRawUnsafe(`SELECT count(*) FROM view_transaksi_pubers ${querys}`)

        res.json(response.commonSuccessDataPaginate(query, total[0].count, Number(page), Number(perpage), key))

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}



exports.getDetailTransaksi = async (req, res) => {
    try {
        const query = await prisma.pubers_master_transaksi.findFirst({
            where: {
                transaksi_id: Number(req.params.id)
            },
            include: {
                pubers_chld_transaksi: {
                    include: {
                        member: {
                            include: { ktp: true }
                        }
                    }
                },
                pubers_poktan: {
                    include: {
                        reg_villages: {
                            include: {
                                reg_districts: {
                                    include: {
                                        reg_regencies: true
                                    }
                                }
                            }
                        }
                    }
                },
                pubers_kios: true

            }
        })
        if (query) {
            res.json(response.successWithData(query, 200))
        } else {
            res.json(response.successWithData({}, 200))
        }

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.updateStatusTransaksi = async (req, res) => {
    const data = req.body
    try {
        if (JSON.parse(data.adaGambar)) {
            data.gambar = req.file.filename
        } else {
            data.gambar = '-'
            // res.json(response.errorWithData('File Tidak Boleh Kosong', 400))
        }
        delete data.adaGambar
        const update = await prisma.pubers_master_transaksi.update({
            where: { transaksi_id: Number(req.params.id) },
            data: {
                bukti_tf: data.gambar,
                statustransaksi: Number(data.statustransaksi)
            }
        })
        if (update) {
            await prisma.pubers_history_master_transaksi.create({
                data: {
                    transaksi_id: Number(req.params.id),
                    status: Number(data.statustransaksi),
                    tanggalstatus: await sekarang()
                }
            })
            res.json(response.success(200))
        } else {
            res.json(response.error(400))
        }

    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.jatahAlokasiKios = async (req, res) => {
    try {
        const findId = await prisma.pubers_kios.findFirst({ where: { nik: req.params.nik } })
        if (!findId) return res.json(response.errorWithData('Kios belum disetting', 400))
        const query = await prisma.pubers_ealokasi.groupBy({
            by: ['kode_kios'],
            where: {
                kode_kios: findId.kode_kios,
                tahun: Number(req.query.tahun)
            },
            _sum: {
                urea: true,
                npk: true,
                npkfk: true
            }
        })
        const query2 = await prisma.pubers_ealokasi_stok.groupBy({
            by: ['kode_kios'],
            where: {
                kode_kios: findId.kode_kios,
                tahun: Number(req.query.tahun)
            },
            _sum: {
                urea: true,
                npk: true,
                npkfk: true
            }
        })
        const query3 = await prisma.pubers_master_transaksi.groupBy({
            by: ['kode_kios'],
            where: {
                kode_kios: findId.kode_kios,
                tahun: Number(req.query.tahun)
            },
            _sum: {
                totalUrea: true,
                totalNpk: true,
                totalNpkFk: true
            }
        })
        res.json(response.successWithData({
            alokasi: query,
            sudahDitebus: query3,
            sisaAlokasi: query2,
        }, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.jatahAlokasiDistriPerKios = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT
        pubers_kios.nama_kios,
            pubers_kios.kode_kios,
            SUM(urea) AS urea,
                SUM(npk) AS npk,
                    SUM(npkfk) AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_ealokasi ON pubers_ealokasi.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_ealokasi.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_kios.kode_kios,
            pubers_kios.nama_kios`


        const query2 = await prisma.$queryRaw`SELECT
        pubers_kios.nama_kios,
            pubers_kios.kode_kios,
            SUM(urea) AS urea,
                SUM(npk) AS npk,
                    SUM(npkfk) AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_ealokasi_stok ON pubers_ealokasi_stok.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_ealokasi_stok.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_kios.kode_kios,
            pubers_kios.nama_kios`
        const query3 = await prisma.$queryRaw`SELECT
        pubers_kios.nama_kios,
            pubers_kios.kode_kios,
            SUM(pubers_master_transaksi."totalUrea") AS urea,
                SUM(pubers_master_transaksi."totalNpk") AS npk,
                    SUM(pubers_master_transaksi."totalNpkFk") AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_master_transaksi ON pubers_master_transaksi.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_master_transaksi.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_kios.kode_kios,
            pubers_kios.nama_kios`
        res.json(response.successWithData({
            alokasi: query,
            sudahDitebus: query3,
            sisaAlokasi: query2,
        }, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.jatahAlokasiDistri = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`SELECT
        SUM(urea) AS urea,
            SUM(npk) AS npk,
                SUM(npkfk) AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_ealokasi ON pubers_ealokasi.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_ealokasi.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_distributor.kode_distributor`


        const query2 = await prisma.$queryRaw`SELECT
        SUM(urea) AS urea,
            SUM(npk) AS npk,
                SUM(npkfk) AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_ealokasi_stok ON pubers_ealokasi_stok.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_ealokasi_stok.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_distributor.kode_distributor`
        const query3 = await prisma.$queryRaw`SELECT
        SUM(pubers_master_transaksi."totalUrea") AS urea,
            SUM(pubers_master_transaksi."totalNpk") AS npk,
                SUM(pubers_master_transaksi."totalNpkFk") AS npkfk
        FROM
        pubers_distributor
                                                LEFT JOIN pubers_kios_distributor ON pubers_distributor.kode_distributor = pubers_kios_distributor.kode_distributor
                                                LEFT JOIN pubers_kios ON pubers_kios.kode_kios = pubers_kios_distributor.kode_kios
                                                LEFT JOIN pubers_master_transaksi ON pubers_master_transaksi.kode_kios = pubers_kios.kode_kios
        WHERE
        pubers_distributor.nik = ${req.params.nik} or
        pubers_master_transaksi.tahun = ${Number(req.query.tahun)}
                                            GROUP BY
        pubers_distributor.kode_distributor`
        res.json(response.successWithData({
            alokasi: query,
            sudahDitebus: query3,
            sisaAlokasi: query2,
        }, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.realokasiPubers = async (req, res) => {
    try {
        let data = req.body

        for (let x = 1; x < Number(data.masatanam); x++) {
            let y = x + 1
            await prisma.$queryRaw`UPDATE pubers_ealokasi_stok AS pub 
            SET urea = sub.ureas + urea,
            npk = sub.npks + npk,
            npkfk = sub.npkfks + npkfk
            FROM
                (SELECT 
                        urea AS "ureas", npk AS "npks", npkfk AS "npkfks", "NIK" AS "niks" 
                    FROM 
                        pubers_ealokasi_stok 
                    WHERE masatanam = ${x} AND 
                            poktan_id = ${data.poktan_id} AND 
                            komoditas_id = ${Number(data.komoditas)
                } ) sub
            WHERE
            masatanam = ${y} AND
            poktan_id = ${Number(data.poktan_id)} 
                        AND komoditas_id = ${Number(data.komoditas)}
                        AND sub.niks = "NIK"`


            await prisma.$queryRaw`UPDATE pubers_ealokasi_stok
                    SET urea = 0, npk = 0, npkfk = 0
            WHERE
            masatanam = ${x} AND
            poktan_id = ${data.poktan_id} 
                        AND komoditas_id = ${Number(data.komoditas)} `
        }

        res.json(response.success(200))

    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}


exports.laporanF9 = async (req, res) => {
    try {
        const dataKios = await prisma.pubers_kios.findFirst({
            where: {
                nik: req.query.nik,
            },
            include: {
                member: {
                    include: {
                        reg_villages: true,
                        reg_districts: true,
                        reg_regencies: true
                    }
                }
            }
        })
        const query = await prisma.$queryRaw`
    SELECT
    pubers_master_transaksi.*,
        pubers_chld_transaksi.*,
        pubers_kios.nama_kios,
        pubers_kios.kode_kios,
        pubers_kios.nik as nikKios,
        pubers_poktan.nik_poktan,
        pubers_poktan.nama_poktan,
        ktpPetani.nama as namaPetani,
        ktpPetani.nik as nikPetani
    FROM
    pubers_master_transaksi
                            INNER JOIN pubers_chld_transaksi ON pubers_master_transaksi.transaksi_id = pubers_chld_transaksi.transaksi_id
                            INNER JOIN pubers_kios ON pubers_kios.kode_kios = pubers_master_transaksi.kode_kios
                            INNER JOIN pubers_poktan ON pubers_poktan.poktan_id = pubers_master_transaksi.poktan_id
                            INNER JOIN "member" memberPetani ON pubers_chld_transaksi.nik = memberPetani.nik
                            INNER JOIN "ktp" ktpPetani ON ktpPetani.nik = memberPetani.nik
    WHERE
    EXTRACT('month' FROM pubers_master_transaksi.created_at) = ${Number(req.query.bulan)} 
                            AND tahun = ${Number(req.query.tahun)} 
                            AND pubers_kios.nik = ${req.query.nik}
                            AND statustransaksi = 4`
        const sums = await prisma.$queryRaw`
    SELECT
    SUM(pubers_master_transaksi."totalUrea") as urea,
        SUM(pubers_master_transaksi."totalNpk") as npk,
        SUM(pubers_master_transaksi."totalNpkFk") as npkfk
    FROM
    pubers_master_transaksi
                                INNER JOIN pubers_chld_transaksi ON pubers_master_transaksi.transaksi_id = pubers_chld_transaksi.transaksi_id
                                INNER JOIN pubers_kios ON pubers_kios.kode_kios = pubers_master_transaksi.kode_kios
                                INNER JOIN pubers_poktan ON pubers_poktan.poktan_id = pubers_master_transaksi.poktan_id
                                INNER JOIN "member" memberPetani ON pubers_chld_transaksi.nik = memberPetani.nik
                                INNER JOIN "ktp" ktpPetani ON ktpPetani.nik = memberPetani.nik
    WHERE
    EXTRACT('month' FROM pubers_master_transaksi.created_at) = ${Number(req.query.bulan)} 
                                AND tahun = ${Number(req.query.tahun)} 
                                AND pubers_kios.nik = ${req.query.nik}
                                AND statustransaksi = 4`

        res.json(response.successWithData({ data: query, sumPupuk: sums[0], kios: dataKios }, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.deleteAlokasi = async (req, res) => {
    try {
        let dataError = []
        const data = req.body
        // console.log(data);
        for (d of data) {
            const chldtransaksi = await prisma.pubers_chld_transaksi.findFirst({
                where: {
                    nik: d.NIK
                }
            })

            if (chldtransaksi) {
                const masterTransaksi = await prisma.pubers_master_transaksi.findFirst({
                    where: {
                        transaksi_id: chldtransaksi.transaksi_id,
                        masatanam: d.masatanam,
                        komoditas: d.komoditas_id,
                        poktan_id: d.poktan_id,
                        kode_kios: d.kode_kios,
                        tahun: d.tahun,
                    }
                })

                console.log(masterTransaksi);
                if (masterTransaksi) {
                    dataError.push({
                        nik: d.NIK,
                        status: `Telah melakukan penebusan di masatanam ${d.masatanam}, tidak bisa dihapus`
                    })
                } else {
                    console.log('delete');
                    await prisma.pubers_ealokasi.deleteMany({
                        where: {
                            NIK: d.NIK,
                            masatanam: d.masatanam,
                            komoditas_id: d.komoditas_id,
                            kode_kios: d.kode_kios,
                            tahun: d.tahun,
                            poktan_id: d.poktan_id
                        }
                    })

                    await prisma.pubers_ealokasi_stok.deleteMany({
                        where: {
                            NIK: d.NIK,
                            masatanam: d.masatanam,
                            komoditas_id: d.komoditas_id,
                            tahun: d.tahun,
                            kode_kios: d.kode_kios,
                            poktan_id: d.poktan_id
                        }
                    });
                }
            } else {
                console.log('delete');
                await prisma.pubers_ealokasi.deleteMany({
                    where: {
                        NIK: d.NIK,
                        masatanam: d.masatanam,
                        komoditas_id: d.komoditas_id,
                        tahun: d.tahun,
                        kode_kios: d.kode_kios,
                        poktan_id: d.poktan_id
                    }
                })

                await prisma.pubers_ealokasi_stok.deleteMany({
                    where: {
                        NIK: d.NIK,
                        masatanam: d.masatanam,
                        komoditas_id: d.komoditas_id,
                        tahun: d.tahun,
                        kode_kios: d.kode_kios,
                        poktan_id: d.poktan_id
                    }
                });
            }

        }
        console.log(dataError);
        if (dataError.length > 0) {
            res.json(response.successWithDataNikerror({ dataError: dataError }, true, 200))
        } else {
            res.json(response.successWithDataNikerror({ dataError: dataError }, false, 200))
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error(500))
    }
}

exports.updateSatatusTfKios = async (req, res) => {
    try {
        const updateStatus = await prisma.pubers_master_transaksi.update({
            where: {
                transaksi_id: Number(req.params.id)
            },
            data: {
                statusTfKios: 1,
                tglStatusTfKios: await sekarang()
            }
        })
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error(500))
    }
}