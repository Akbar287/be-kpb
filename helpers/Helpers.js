const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

const paginateMember = async (key, role, prov, kab, kec, desa, perpage, page, res) => {
    try {
        if (role === '') {
            if (kab === '' && kec === '' && desa === '') {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec === '' && desa === '') {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec !== '' && desa === '') {
                const getData = await prisma.$queryRaw`SELECT * FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec !== '' && desa !== '') {
                const getData = await prisma.$queryRaw`SELECT * FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and desa = ${desa} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and desa = ${desa}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            }

        } else {
            if (kab === '' && kec === '' && desa === '') {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_role = ${Number(role)} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_role = ${Number(role)}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec === '' && desa === '') {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and id_role = ${Number(role)} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and id_role = ${Number(role)}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec !== '' && desa === '') {
                const getData = await prisma.$queryRaw`SELECT * FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and id_role = ${Number(role)} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and id_role = ${Number(role)}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else if (kab !== '' && kec !== '' && desa !== '') {
                const getData = await prisma.$queryRaw`SELECT * FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and desa = ${desa} and id_role = ${Number(role)} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and kabupaten = ${kab} and kecamatan = ${kec} and desa = ${desa} and id_role = ${Number(role)}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            } else {
                const getData = await prisma.$queryRaw`
                SELECT * FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_role = ${Number(role)} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
                const total = await prisma.$queryRaw`SELECT count(*) FROM v_member_role WHERE verified = true and (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_role = ${Number(role)}`
                res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
            }

        }
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error(500))
    }
}

const paginatePoktan = async (key, prov, kab, kec, desa, perpage, page, res) => {
    try {
        if (kab === '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'})`
            console.log('getAwal');
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab}`
            console.log(getData);
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa === '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa !== '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_ketua_poktan WHERE (nama_poktan ilike ${'%' + key + '%'} or nik_poktan ilike ${'%' + key + '%'})`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        }
    } catch (error) {

    }
}

const paginateKios = async (key, prov, kab, kec, desa, perpage, page, res) => {
    try {
        if (kab === '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
            console.log('getAwal');
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab}`
            console.log(getData);
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa === '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa !== '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_kios WHERE (nama_kios ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        }
    } catch (error) {

    }
}

const filterData = (query) => {
    let newQuery = [];
    if (query.kios !== "null" && query.kios !== undefined && query.kios !== "") {
        newQuery.push({
            field: `"nik"`,
            val: query.kios,
            isNumber: false,
            isDate: false
        })
    }
    if (query.poktan !== "null" && query.poktan !== undefined && query.poktan !== "") {
        newQuery.push({
            field: `"nik_poktan"`,
            val: query.poktan,
            isNumber: false,
            isDate: false
        })
    }
    if (query.masatanam !== "null" && query.masatanam !== undefined && query.masatanam !== "") {
        newQuery.push({
            field: `"masatanam"`,
            val: query.masatanam,
            isNumber: true,
            isDate: false
        })
    }
    if (query.kab !== "null" && query.kab !== undefined && query.kab !== "") {
        newQuery.push({
            field: `"Kabupaten"`,
            val: query.kab,
            isNumber: false,
            isDate: false
        })
    }
    if (query.kec !== "null" && query.kec !== undefined && query.kec !== "") {
        newQuery.push({
            field: `"kecamatan"`,
            val: query.kec,
            isNumber: false,
            isDate: false
        })
    }
    if (query.desa !== "null" && query.desa !== undefined && query.desa !== "") {
        newQuery.push({
            field: `"desa"`,
            val: query.desa,
            isNumber: false,
            isDate: false
        })
    }
    if (query.sektor !== "null" && query.sektor !== undefined && query.sektor !== "") {
        newQuery.push({
            field: `"sektor"`,
            val: query.sektor,
            isNumber: false,
            isDate: false
        })
    }
    if (query.komoditas !== "null" && query.komoditas !== undefined && query.komoditas !== "") {
        newQuery.push({
            field: `"komoditas"`,
            val: query.komoditas,
            isNumber: false,
            isDate: false
        })
    }
    if (query.tanggal !== "null" && query.tanggal !== undefined && query.tanggal !== "") {
        newQuery.push({
            field: `tanggaltransaksi`,
            val: query.tanggal,
            isNumber: false,
            isDate: true
        })
    }
    return newQuery;
};

const filterDataAlokasi = (query) => {
    let newQuery = [];

    if (query.masatanam !== "null" && query.masatanam !== undefined && query.masatanam !== "") {
        newQuery.push({
            field: `"masatanam"`,
            val: query.masatanam,
            isNumber: true
        })
    }
    if (query.kab !== "null" && query.kab !== undefined && query.kab !== "") {
        newQuery.push({
            field: `"kabupaten_petani"`,
            val: query.kab,
            isNumber: false
        })
    }
    if (query.kec !== "null" && query.kec !== undefined && query.kec !== "") {
        newQuery.push({
            field: `"kecamatan_petani"`,
            val: query.kec,
            isNumber: false
        })
    }
    if (query.desa !== "null" && query.desa !== undefined && query.desa !== "") {
        newQuery.push({
            field: `"desa_petani"`,
            val: query.desa,
            isNumber: false
        })
    }
    if (query.sektor !== "null" && query.sektor !== undefined && query.sektor !== "") {
        newQuery.push({
            field: `"sektor"`,
            val: query.sektor,
            isNumber: false
        })
    }
    if (query.komoditas !== "null" && query.komoditas !== undefined && query.komoditas !== "") {
        newQuery.push({
            field: `"komoditas"`,
            val: query.komoditas,
            isNumber: false
        })
    }
    return newQuery;
};

const convertQuery = (arr) => {
    let query = ''
    for (let i = 0; i < arr.length; i++) {
        const field = arr[i]
        if (i === 0) {
            if (field.isDate) {
                query = `WHERE ${field.field} >= '${field.val} 00:00:00' AND ${field.field} <= '${field.val} 23:59:59'`
            } else {
                query = `WHERE ${field.field} = ${field.isNumber ? Number(field.val) : `'${field.val}'`}`
            }
        } else {
            if (field.isDate) {
                query += `and ${field.field} >= '${field.val} 00:00:00' AND ${field.field} <= '${field.val} 23:59:59'`
            } else {
                query += `and ${field.field} = ${field.isNumber ? Number(field.val) : `'${field.val}'`}`
            }
            // query += ` and ${field.field} = ${field.isNumber ? Number(field.val) : `'${field.val}'`}`
        }
    }
    console.log(query);
    return query.toString()
}

const filterCheck = (query) => {
    let newQuery = []
    if (query.kab !== "null" && query.kab !== undefined && query.kab !== "") {
        newQuery.push({
            field: `"member".id_kab`,
            val: query.kab,
            isNumber: false,
            isDate: false
        })
    }
    if (query.kec !== "null" && query.kec !== undefined && query.kec !== "") {
        newQuery.push({
            field: `"member".id_kec`,
            val: query.kec,
            isNumber: false,
            isDate: false
        })
    }
    return newQuery
}

const paginateBPJS = async (key, prov, kab, kec, desa, perpage, page, res) => {
    try {
        if (kab === '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            // console.log(`SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`);
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
            console.log('getAwal');
            // console.log(getData);
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec === '' && desa === '') {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab}`
            console.log(getData);
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa === '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else if (kab !== '' && kec !== '' && desa !== '') {
            const getData = await prisma.$queryRaw`SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa} limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) and id_kab = ${kab} and id_kec = ${kec} and id_desa = ${desa}`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        } else {
            const getData = await prisma.$queryRaw`
            SELECT * FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'}) limit ${Number(perpage)} OFFSET ${(Number(page) - 1) * Number(perpage)}`
            const total = await prisma.$queryRaw`SELECT count(*) FROM v_bpjs WHERE (nama ilike ${'%' + key + '%'} or nik ilike ${'%' + key + '%'})`
            res.json(response.commonSuccessDataPaginate(getData, total[0].count, Number(page), Number(perpage), key))
        }
    } catch (error) {
        console.log(error);
    }
}

const filterBea = (query) => {
    let newQuery = []
    if (query.universitas !== "null" && query.universitas !== undefined && query.universitas !== "") {
        newQuery.push({
            field: `"universitas"`,
            val: query.universitas,
            isNumber: false,
            isDate: false
        })
    }
    if (query.fakultas !== "null" && query.fakultas !== undefined && query.fakultas !== "") {
        newQuery.push({
            field: `"fakultas"`,
            val: query.fakultas,
            isNumber: false,
            isDate: false
        })
    }
    if (query.tahun !== "null" && query.tahun !== undefined && query.tahun !== "") {
        newQuery.push({
            field: `"tahun"`,
            val: query.tahun,
            isNumber: false,
            isDate: false
        })
    }
    return newQuery;
}

module.exports = { paginateMember, paginatePoktan, filterData, convertQuery, filterDataAlokasi, filterCheck, paginateKios, paginateBPJS, filterBea }