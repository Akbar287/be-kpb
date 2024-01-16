const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');
const helpers = require('../helpers/Helpers')

exports.updatePoktan = async (req, res) => {
    try {
        const data = req.body.data
        console.log(data);
        await prisma.pubers_poktan.updateMany({
            where: {
                poktan_id: Number(data.poktan_id)
            },
            data: {
                nik_poktan: data.nik_poktan,
                nama_poktan: data.nama_poktan
            }
        })
        res.json(response.successData('Berhasil Edit Poktan', 201))
    } catch (error) {
        console.log(error);
        res.json(response.errorWithData('Gagal Edit Poktan', 200))
    }
}

exports.getKetuaPoktan = async (req, res) => {
    const key = `${req.query.filter}`;
    const prov = `${req.query.prov}`;
    const kab = `${req.query.kab}`;
    const kec = `${req.query.kec}`;
    const desa = `${req.query.desa}`;
    const perpage = `${Number(req.query.perpage)}`;
    const page = `${Number(req.query.page)}`;
    await helpers.paginatePoktan(key, prov, kab, kec, desa, perpage, page, res)
}

exports.getDataAnggota = async (req, res) => {
    try {
        const query = await prisma.$queryRaw`
                SELECT DISTINCT ON (nik_petani) nik_petani,nama_petani, desa_petani, kecamatan_petani, kabupaten_petani from view_alokasi_stok 
                where 
                    nik_poktan = ${req.params.nik}`
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}

exports.createUpdatePubersPoktan = async (req, res) => {
    try {
        const data = req.body
        if (data.adaData) {
            delete data.adaData
            await prisma.pubers_poktan.updateMany({
                where: {
                    nik_poktan: req.params.nik
                },
                data: data
            })
        } else {
            // const lastData = await prisma.pubers_kios.findMany({ orderBy: { kios_id: 'desc' } });
            delete data.adaData
            // data.created_at = await sekarang()
            // data.kios_id = Number(lastData[0].kios_id) + 1
            data.nik_poktan = req.params.nik
            await prisma.pubers_poktan.create({ data: data })
        }
        res.json(response.success(200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

exports.getPoktan = async (req, res) => {
    try {
        const query = await prisma.pubers_poktan.findFirst({
            where: {
                nik_poktan: req.params.nik
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}

// exports.updateNamaPoktan = async (req, res) => {
//     try {
//         const query = await prisma.pubers_poktan.updateMany({
//             where: {
//                 nik_poktan: req.params.nik
//             },

//         })
//     } catch (error) {

//     }
// }