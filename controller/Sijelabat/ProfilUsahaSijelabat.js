const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../../utils/utils');
const { constVoid } = require("prisma/prisma-client/generator-build");
const bcrypt = require("bcryptjs");
const { get } = require("https");

//====================================================Profil Usaha================================

exports.getProfilUsahaBahanBakuByMember = async (req, res) => {
    try {
        const query = await prisma.profil_usaha.findMany({
            where: {
                member_id: Number(atob(req.params.idmember)),
                layanan_id: Number(atob(req.params.idlayanan))
            },
            include: {
                reg_provinces: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_regencies: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_districts: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reg_villages: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                rekening_bank_usaha: {
                    select: {
                        nomor_rekening: true,
                        master_bank: {
                            select: {
                                id: true,
                                nama_bank: true
                            }
                        }
                    }
                }
            }
        })

        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));

    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }
}

exports.saveInputProfilUsaha = async (req, res) => {
    try {
        const usaha = req.body[0]
        usaha.created_at = await sekarang()
        usaha.update_at = await sekarang()

        const usahaquery = await prisma.profil_usaha.create({
            data: usaha
        });


        const rekening = req.body[1]
        rekening.profil_usaha_id = usahaquery.profil_usaha_id
        rekening.created_at = await sekarang()
        rekening.update_at = await sekarang()

        const rekeningquery = await prisma.rekening_bank_usaha.create({
            data: rekening
        });

        res.json(usahaquery && rekeningquery ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        console.log(error)
        res.json(response.error(500))
    }

}


exports.saveUpdateProfilUsaha = async (req, res) => {
    try {
        const id = Number(atob(req.params.profilusahaid))
        const usaha = req.body[0]
        usaha.update_at = await sekarang()

        const usahaquery = await prisma.profil_usaha.update({
            where: {
                profil_usaha_id: id
            },
            data: {
                nama_usaha: usaha.nama_usaha,
                profil_usaha_provinsi: usaha.profil_usaha_provinsi,
                profil_usaha_kabupaten: usaha.profil_usaha_kabupaten,
                profil_usaha_kecamatan: usaha.profil_usaha_kecamatan,
                profil_usaha_desa: usaha.profil_usaha_desa,
                alamat_usaha: usaha.alamat_usaha,
                update_at: usaha.update_at,
                kontak: usaha.kontak
            }
        });


        const rekening = req.body[1]
        rekening.update_at = await sekarang()
        const rekeningquery = await prisma.rekening_bank_usaha.updateMany({
            where: {
                profil_usaha_id: id
            },
            data: {
                master_bank_id: rekening.master_bank_id,
                nomor_rekening: rekening.nomor_rekening
            }
        });

        res.json(usahaquery && rekeningquery ? response.success(200) : response.errorWithData('Input data gagal', 400));


    } catch (error) {
        res.json(response.error(500))
    }

}

exports.getMasterBank = async (req, res) => {
    try {
        const query = await prisma.master_bank.findMany({})
        res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));
    } catch (error) {
        res.json(response.error(500))
    }
}



//============================MATERIAL MASTER GET CHECKOUT====================

exports.saveKeranjang = async (req, res) => {
    try {
        const data = req.body;
        data.profil_usaha_penyedia_id = Number(data.profil_usaha_penyedia_id);
        data.created_at = await sekarang();
        data.update_at = await sekarang();

        let querySuccess = true;
        for (let i = 0; i < data.mm_id.length; i++) {
            const keranjang = await cekKeranjang(data.mm_id[i], data.member_id_pembeli, data.profil_usaha_penyedia_id);
            if (!keranjang) {
                try {
                    await prisma.keranjang_sijelabat.create({
                        data: {
                            mm_id: data.mm_id[i],
                            profil_usaha_penyedia_id: data.profil_usaha_penyedia_id,
                            quantity: 1,
                            member_id_pembeli: data.member_id_pembeli,
                            created_at: data.created_at,
                            update_at: data.update_at
                        }
                    });
                } catch (error) {
                    querySuccess = false;
                    console.error(`Error saat menambahkan ke keranjang: ${error.message}`);
                    continue;
                }
            }
        }

        res.json(querySuccess ? response.success(200) : response.errorWithData('Input data gagal', 400));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.json(response.error(500));
    }
};

exports.getProdukByID = async (req, res) => {
    try {
        const idmember = Number(atob(req.params.idmember));
        const idlayanan = Number(atob(req.params.idlayanan));
        const usaha = await findProfilUsaha(idmember, idlayanan);

        if (!usaha) {
            return res.json(response.errorWithData('Harap Lengkapi Profil Usaha dan Tunggu Verifikasi Admin', 507));
        }

        const data = req.body;
        const profilUsahaPenyediaId = Number(atob(data.profil_usaha_penyedia_id));
        const member_id_pembeli = data.member_id_pembeli;

        const query = await prisma.material_master.findMany({
            where: {
                keranjang_sijelabat: {
                    some: {
                        profil_usaha_penyedia_id: profilUsahaPenyediaId,
                        member_id_pembeli: member_id_pembeli
                    }
                }
            },
            include: {
                stok_pakan: {
                    where: {
                        profil_usaha_id: profilUsahaPenyediaId
                    }
                },
                harga_jelabat: {
                    where: {
                        profil_usaha_id: profilUsahaPenyediaId
                    }
                },
                keranjang_sijelabat: {
                    where: {
                        profil_usaha_penyedia_id: profilUsahaPenyediaId,
                        member_id_pembeli: member_id_pembeli
                    }
                }
            }
        });

        return res.json(query ? response.successWithData(query, 200) : response.errorWithData('Get Data Gagal', 400));
    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.updateQuantityKeranjang = async (req, res) => {
    try {
        const data = req.body
        let query
        for (let i = 0; i < data.length; i++) {
            query = await prisma.keranjang_sijelabat.update({
                where: {
                    keranjang_id: data[i].keranjang_sijelabat[0].keranjang_id
                },
                data: {
                    quantity: Number(data[i].keranjang_sijelabat[0].quantity)
                }
            })
        }
        res.json(query ? response.success(200) : response.errorWithData('Hapus data gagal', 400));

    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}

exports.hapusKeranjang = async (req, res) => {
    try {
        const query = await prisma.keranjang_sijelabat.delete({
            where: {
                keranjang_id: Number(atob(req.params.idkeranjang))
            }
        })
        res.json(query ? response.success(200) : response.errorWithData('Hapus data gagal', 400));
    } catch (error) {
        console.error(error);
        return res.json(response.error(500));
    }
}


//======================================Function=============================
const findProfilUsaha = async (idmember, idlayanan) => {
    const usaha = await prisma.profil_usaha.findFirst({ where: { member_id: idmember, layanan_id: idlayanan, verifikasi_admin: true } });
    return usaha;
}

const cekKeranjang = async (idmm, idmember, idpenyedia) => {
    const keranjang = await prisma.keranjang_sijelabat.findFirst({ where: { mm_id: idmm, profil_usaha_penyedia_id: idpenyedia, member_id_pembeli: idmember } });
    return keranjang;
};