const router = require("express").Router();
const controller = require("../controller/SertifikasiBenihPertanian");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')

const uploadCreate = multer({ storage: utilsApps.fileSertifPertanian }).fields([
    {
        name: 'file_ktp'
    },
    {
        name: 'formulir_pendaftaran'
    },
    {
        name: 'surat_rekomendasi'
    },
    {
        name: 'denah_lokasi'
    },
    {
        name: 'sumber_benih'
    }
])


const uploadUpdate = multer({ storage: utilsApps.fileSertifPertanian }).fields([
    {
        name: 'file_pembayaran'
    },
    {
        name: 'file_pendahuluan'
    },
    {
        name: 'hasil_pendahuluan'
    },
    {
        name: 'file_vegetatif'
    },
    {
        name: 'hasil_vegetatif'
    },
    {
        name: 'file_berbunga'
    },
    {
        name: 'hasil_berbunga'
    },
    {
        name: 'file_masak'
    },
    {
        name: 'hasil_masak'
    },
    {
        name: 'file_pemeriksaan'
    },
    {
        name: 'hasil_pemeriksaan'
    },
    {
        name: 'file_pengawasan'
    },
    {
        name: 'hasil_pengawasan'
    },
    {
        name: 'file_pengujian'
    },
    {
        name: 'hasil_pengujian'
    },
    {
        name: 'sertifikat'
    },
])

router.post('/sertifikasi-benih/create', uploadCreate,  mdl.requireAuth, controller.create)
router.put('/sertifikasi-benih/update/:id_form_sertifikasi', uploadUpdate,  mdl.requireAuth, controller.update)
router.get('/sertifikasi-benih/get-by-user/:nik', mdl.requireAuth, controller.getByUser)
router.get('/sertifikasi-benih/detail/:id', controller.detailSertifikasi)
router.get('/sertifikasi-benih/getall', mdl.requireAuth, controller.getAll)
router.get('/sertifikasi-benih/dashboard', mdl.requireAuth, controller.dashboard)
router.put('/sertifikasi-benih/onCancel/:id_form_sertifikasi', mdl.requireAuth, controller.onCancel)

module.exports = router;