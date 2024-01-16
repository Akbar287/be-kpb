const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang, cekNull } = require('../utils/utils');

exports.addPengajuan = async (req, res) => {
    try {
        // Make New ID
        // const newId = await prisma.$queryRaw`SELECT id FROM master_sertifikasi_benih ORDER BY id DESC limit 1`;
        // Make Form
        const data = JSON.parse(req.body.data)

        data.fotodaun = cekNull(req.files['fotodaun'], '../public/file_klinik')
        data.fotobuah = cekNull(req.files['fotobuah'], '../public/file_klinik')
        data.fotobatang = cekNull(req.files['fotobatang'], '../public/file_klinik')
        data.fotoakar = cekNull(req.files['fotoakar'], '../public/file_klinik')

        const status = data.intensitasserangan === 'Berat' ? 'Verifikasi UPTD' : 'Belum Dijawab'

        const query = await prisma.klinik_perkebunan.create({
            data: {
                nik: data.nik,
                nama: data.nama,
                nohp: data.nohp,
                intensitasserangan: data.intensitasserangan,
                komoditas: data.komoditas.komoditas,
                fotodaun: data.fotodaun,
                fotobuah: data.fotobuah,
                fotobatang: data.fotobatang,
                fotoakar: data.fotoakar,
                deskripsi: data.deskripsi,
                luaslahan: data.luaslahan,
                luasserangan: data.luasserangan,
                alamatlahan: data.alamatlahan,
                provinsi: data.provinsi,
                kabupaten: data.kabupaten,
                kecamatan: data.kecamatan,
                desa: data.desa,
                status,
                created_at: await sekarang(),
                updated_at: await sekarang(),
            }
        })


        // Create History
        if (query) {
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

exports.getAllPengajuan = async (req, res) => {
    try {
        const role = req.params.role
        const type = req.params.type

        const disbunkab = () => {
            if (type === 'terbaru') {
                return {
                    OR: [
                        { status: 'Belum Dijawab' },
                        { status: 'Verifikasi UPTD' }
                    ]
                }
            } else {
                return {
                    OR: [
                        { status: 'Belum Dijawab' },
                        { status: 'Terjawab' },
                        { status: 'Verifikasi UPTD' }
                    ]
                }
            }
        }
        const disbunprov = () => {
            if (type === 'terbaru') {
                return {
                    status: 'Verifikasi UPTD'
                }
            } else {
                return {
                    OR: [
                        { status: 'Belum Dijawab' },
                        { status: 'Terjawab' },
                        { status: 'Verifikasi UPTD' }
                    ]
                }
            }
        }

        let data = await prisma.klinik_perkebunan.findMany({
            orderBy: {
                id: 'desc'
            },
            where: role === 'disbunkabupaten' ? disbunkab() : disbunprov()
        })
        res.json(response.successWithData(data, 201))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
}

exports.getAllPengjuanByNik = async (req, res) => {
    try {
        const nik = req.params.nik
        let data = await prisma.klinik_perkebunan.findMany({
            where: {
                nik: nik
            },
            orderBy: {
                id: 'desc'
            }
        })
        res.json(response.successWithData(data, 202))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
}

exports.detailKlinik = async (req, res) => {
    try {
        const id = req.params.id
        const dataSertif = await prisma.klinik_perkebunan.findFirst({
            where: {
                id: Number(id)
            },
        })
        res.json(response.successWithData(dataSertif, 201));
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
};

exports.jawabPengajuan = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        const update = {
            status: data.status,
            hasil: data.hasil,
            rekomendasi: data.rekomendasi
        }

        const updateWithTanggal = {
            ...update,
            tanggal_kunjungan: new Date(data.tanggal_kunjungan)
        }
        await prisma.klinik_perkebunan.update({
            where: {
                id: Number(id),
            },
            data: data.tanggal_kunjungan ? updateWithTanggal : update
        })

        res.json(response.successData('Berhasil Ubah Status'))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
};

exports.keUptd = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        await prisma.klinik_perkebunan.update({
            where: {
                id: Number(id),
            },
            data: {
                status: data.status,
                hasil: data.hasil,
                rekomendasi: data.rekomendasi
            }
        })

        res.json(response.successData('Berhasil Ubah Status'))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
};

exports.addArtikel = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)

        data.gambar = cekNull(req.files['gambar'], '../public/file_klinik')

        const query = await prisma.klinik_perkebunan_artikel.create({
            data: {
                judul: data.judul,
                gambar: data.gambar,
                narasi: data.narasi,
                created_at: await sekarang(),
                updated_at: await sekarang(),
            }
        })

        if (query) {
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

exports.editArtikel = async (req, res) => {
    try {
        const artikelId = req.params.id; // Assuming you pass the ID as a route parameter
        const existingArtikel = await prisma.klinik_perkebunan_artikel.findUnique({
            where: { id: parseInt(artikelId) }
        });

        if (!existingArtikel) {
            return res.json(response.errorWithData('Artikel not found', 404));
        }

        const data = JSON.parse(req.body.data);

        // Check if a new image is uploaded, if not, use the existing one
        data.gambar = req.files && req.files['gambar'] ?
            cekNull(req.files['gambar'], '../public/file_klinik') :
            existingArtikel.gambar;

        const query = await prisma.klinik_perkebunan_artikel.update({
            where: { id: parseInt(artikelId) },
            data: {
                judul: data.judul,
                gambar: data.gambar,
                narasi: data.narasi,
                updated_at: await sekarang(),
            }
        });

        if (query) {
            res.json(response.successWithData({
                id: Number(query.id)
            }));
        } else {
            res.json(response.errorWithData('Update error', 500));
        }
    } catch (error) {
        console.log(error);
        res.json(response.error(400));
    }
};


exports.getArtikel = async (req, res) => {
    try {
        const id = req.params.id
        const data = await prisma.klinik_perkebunan_artikel.findFirst({
            where: {
                id: Number(id),
            },
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
};

exports.getAllArtikel = async (req, res) => {
    try {
        if (!req.query.page) {
            const data = await prisma.klinik_perkebunan_artikel.findMany()
            res.json(response.successWithData(data, 200))
        } else {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;

            // Calculating the skip value
            const skip = (page - 1) * pageSize;

            const [articles, totalItems] = await Promise.all([
                prisma.klinik_perkebunan_artikel.findMany({
                    take: pageSize,
                    skip: skip,
                    orderBy: {
                        created_at: 'desc',
                    },
                }),
                prisma.klinik_perkebunan_artikel.count(),
            ]);

            res.json(response.successWithData({
                articles,
                totalItems,
                page,
                pageSize,
            }, 200));
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(response.error)
    }
};

exports.deleteArtikel = async (req, res) => {
    try {
        const artikelId = req.params.id; // ID passed as route parameter

        // Optional: Check if the article exists
        const existingArtikel = await prisma.klinik_perkebunan_artikel.findUnique({
            where: { id: parseInt(artikelId) }
        });

        if (!existingArtikel) {
            return res.json(response.errorWithData('Artikel not found', 404));
        }

        // Perform the delete operation
        await prisma.klinik_perkebunan_artikel.delete({
            where: { id: parseInt(artikelId) }
        });

        // Respond with success
        res.json(response.success(200))
    } catch (error) {
        console.log(error);
        res.json(response.error(400));
    }
};