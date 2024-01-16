const router = require("express").Router();
const controller = require("../controller/Okkpd");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')
const upload = multer({ storage: utilsApps.fileOkkpd }).fields([
    {
        name: 'shm'
    },
    {
        name: 'ktp'
    },
    {
        name: 'npwp'
    },
    {
        name: 'nib'
    },
    {
        name: 'suratPermohonan'
    },
    {
        name: 'informasiProduk'
    },
    {
        name: 'si'
    }
])


const uploadPengajuanLab = multer({ storage: utilsApps.fileOkkpd }).fields([
    {
        name: 'schc'
    },
    {
        name: 'sppb'
    },
    {
        name: 'okratoksin'
    },
    {
        name: 'aflatoksin'
    },
    {
        name: 'organoleptik'
    },
    {
        name: 'pestisida'
    }
])

const uploadBlanko = multer({ storage: utilsApps.fileOkkpd }).fields([
    {
        name: 'blanko'
    }
])

const uploadGagal = multer({ storage: utilsApps.fileOkkpd }).fields([
    {
        name: 'fileGagal'
    }
])


const uploadEdit = multer({ storage: utilsApps.fileOkkpd }).fields([
    {
        name: 'suratPermohonan'
    },
    {
        name: 'informasiProduk'
    },
    {
        name: 'si'
    }
])

router.get('/getForm/:nik', mdl.requireAuth, controller.getForm)
router.post('/createOkkpd', upload, mdl.requireAuth, controller.createPengajuan)
router.get('/getData', mdl.requireAuth, controller.getPengajuan)
router.get('/getData/:nik', mdl.requireAuth, controller.getPengajuanMember)
router.get('/getDetail/:id', mdl.requireAuth, controller.getDetailPengajuan)
router.put('/pengajuan/:idDetail/:id', uploadPengajuanLab, mdl.requireAuth, controller.formPengajuan)
router.put('/updateStatus/:id', mdl.requireAuth, controller.updateStatus)
router.put('/updatePengambilanBlanko/:id', uploadBlanko, mdl.requireAuth, controller.updatePengambilanBlanko)
router.put('/reschedule/:id', mdl.requireAuth, controller.reschedule)
router.get('/getPengujianLab/:id', mdl.requireAuth, controller.getPengujianLab)
router.put('/sendBlanko/:id', uploadBlanko, mdl.requireAuth, controller.sendBlanko)
router.put('/addRating/:idDetail/:id', mdl.requireAuth, controller.addRating)
router.get('/getRating/:id', mdl.requireAuth, controller.getRating)
router.put('/statusGagal/:id', uploadGagal, mdl.requireAuth, controller.statusGagal)
router.get('/getSCHC', mdl.requireAuth, controller.getSCHC)
router.get('/getReview', mdl.requireAuth, controller.getReview)
router.get('/getMember', mdl.requireAuth, controller.getMember)
router.put('/updateTonase/:id', mdl.requireAuth, controller.updateTonase)
router.put('/updateData/:id', uploadEdit, mdl.requireAuth, controller.updateData)
router.put('/statusRevisi/:id', mdl.requireAuth, controller.updateRevisi)
router.post('/createKomoditas', mdl.requireAuth, controller.createKomoditas)
router.get('/getKomoditas', mdl.requireAuth, controller.getKomoditas)
router.put('/pengajuanRevisi/:idDetail/:id', uploadPengajuanLab, mdl.requireAuth, controller.revisiSCHC)

module.exports = router;