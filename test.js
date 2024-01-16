const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const allUsers = await prisma.member.findMany({
        include: {
            type_member: {
                include: {
                    blah: {
                        where: {
                            id_type: 1
                        },
                    },
                }
            },
        }
    })

    console.log(JSON.stringify(allUsers))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })