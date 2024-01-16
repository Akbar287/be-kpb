const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { response, sekarang } = require('../utils/utils');


exports.getPabrik = async (req, res) => {
    try {
        const data = await prisma.master_pabrik.findMany({
            include: {
                member: {
                    include: {
                        ktp: true
                    }
                }
            }
        })
        res.json(response.successWithData(data, 200))
    } catch (error) {
        console.log(error)
        res.status(500).json(response.error(500))
    }
}