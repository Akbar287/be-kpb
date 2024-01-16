const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');

exports.listKiosDistributor = async (req, res) => {
    try {
        const findId = await prisma.pubers_distributor.findFirst({ where: { nik: req.params.nik } })
        if (!findId) return res.json(response.errorWithData('Kios belum disetting', 400))
        console.log(findId.kode_distributor)
        const query = await prisma.pubers_kios_distributor.findMany({
            where: {
                kode_distributor: findId.kode_distributor
            },
            include: {
                pubers_kios: {
                    include: {
                        member: {
                            include: {
                                reg_villages: true,
                                reg_districts: true,
                                reg_regencies: true
                            }
                        }
                    }
                }
            }
        })
        res.json(response.successWithData(query, 200))
    } catch (error) {
        console.log(error)
        res.json(response.errorWithData('Terjadi kesalahan pada server', 500))
    }
}