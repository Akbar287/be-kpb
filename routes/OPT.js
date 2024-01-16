const router = require("express").Router();
const controller = require("../controller/OPT");
const controllerDpi = require("../controller/OPT_DPI_OPH");
const mdl = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const fileFoto = multer({ storage: utilsApps.profileDokter }).single("fotoprofil")
const filePengaduan = multer({ storage: utilsApps.optPengaduan }).fields([
    {
        name: "gambarDaun",
        maxCount: 1
    },
    {
        name: 'gambarBuah',
        maxCount: 1
    },
    {
        name: 'gambarBatang',
        maxCount: 1
    },
    {
        name: 'gambarAkar',
        maxCount: 1
    }
])
const gambarInformasi = multer({ storage: utilsApps.optInformasi }).fields([
    {
        name: "namafile"
    },
    {
        name: 'filePdf',
        maxCount: 1
    }
])
const fileOptDpi = multer({ storage: utilsApps.optPengaduanDpi }).array("namafile")

// DOKTER
router.post('/dokter', mdl.requireAuth, fileFoto, controller.inputDokter);
router.get('/ktp-dokter', mdl.requireAuth, controller.cariKtp);
router.get('/dokter', mdl.requireAuth, controller.getDokter);
router.put('/dokter/:id', mdl.requireAuth, fileFoto, controller.updateDokter);
router.delete('/dokter/:id', mdl.requireAuth, controller.deleteDokter);
router.get('/dokter/:id', mdl.requireAuth, controller.getDokterById);
router.get('/dokter-laboran/:id', mdl.requireAuth, controller.getDokterLaboran);

//PENGADUAN
router.post('/pengaduan', mdl.requireAuth, filePengaduan, controller.inputPengaduan);
router.put('/pengaduan/:id', mdl.requireAuth, filePengaduan, controller.editPengaduan);
router.get('/pengaduan', mdl.requireAuth, controller.getPengaduan);
router.get('/pengaduan/:id', mdl.requireAuth, controller.getPengaduanById);
router.get('/pengaduan-by-nik/:id', mdl.requireAuth, controller.getPengaduanByNik);
router.delete('/pengaduan/:id', mdl.requireAuth, controller.deletePengaduan);
router.get('/berkas-pengaduan/:id', mdl.requireAuth, controller.getBerkasPengaduan);
router.post('/berkas-pengaduan', mdl.requireAuth, controller.tambahBerkasPengaduan);
router.put('/berkas-pengaduan/:id/:idpengaduan', mdl.requireAuth, controller.editBerkasPengaduan);

// JAWABAN
router.post('/jawaban', mdl.requireAuth, controller.inputJawaban);
router.put('/jawaban/:id', mdl.requireAuth, controller.updateJawaban);
router.get('/jawaban', mdl.requireAuth, controller.getJawaban);
router.get('/jawaban-by-id-pengaduan/:id', mdl.requireAuth, controller.getJawabanByIdPengaduan);
router.get('/jawaban/:id', mdl.requireAuth, controller.getJawabanById);
router.delete('/jawaban/:id', mdl.requireAuth, controller.deleteJawaban);

//KATEGORI INFORMASI
router.post('/kategori-informasi', mdl.requireAuth, controller.inputKategoriInformasi);
router.get('/kategori-informasi', mdl.requireAuth, controller.getKategoriInformasi);
router.get('/kategori-informasi/:id', mdl.requireAuth, controller.getKategoriInformasiById);
router.put('/kategori-informasi/:id', mdl.requireAuth, controller.updateKategoriInformasi);
router.delete('/kategori-informasi/:id', mdl.requireAuth, controller.deleteKategoriInformasi);

// INFORMASI
router.post('/informasi', mdl.requireAuth, gambarInformasi, controller.inputInformasi);
router.get('/informasi', mdl.requireAuth, gambarInformasi, controller.getAllInformasi);
router.get('/informasi/:id', mdl.requireAuth, gambarInformasi, controller.getAllInformasiById);

//Pengaduan OPT DPI
router.post('/pengaduan-dpi', mdl.requireAuth, fileOptDpi, controllerDpi.storePengaduanDpi);
router.get('/pengaduan-dpi', mdl.requireAuth, controllerDpi.getOptDpi);
router.get('/pengaduan-dpi/:id', mdl.requireAuth, controllerDpi.getOptDpiById);
router.get('/pengaduan-dpi-nik/:nik', mdl.requireAuth, controllerDpi.getOptDpiByNik);

//OPT OPH
router.post('/aph', mdl.requireAuth, controllerDpi.storeOptOph);
router.get('/aph', mdl.requireAuth, controllerDpi.getOptAph);
router.get('/aph/:id', mdl.requireAuth, controllerDpi.getOptAphById);
router.put('/aph/:id', mdl.requireAuth, controllerDpi.updateOptOph);
router.delete('/aph/:id', mdl.requireAuth, controllerDpi.deleteOptOph);

//OPT OPH Starter
router.post('/permohonan-starter', mdl.requireAuth, controllerDpi.storePermohonanStarter);
router.get('/permohonan-starter-nik/:nik', mdl.requireAuth, controllerDpi.getStorePermohonanStarterByNik);
router.get('/permohonan-starter', mdl.requireAuth, controllerDpi.getStorePermohonanStarter);
router.put('/permohonan-starter/:id', mdl.requireAuth, controllerDpi.uptStatusStorePermohonanStarter);

//OPT OPH Bimtek
router.post('/permohonan-bimtek', mdl.requireAuth, controllerDpi.storePermohonanBimtek);
router.get('/permohonan-bimtek-nik/:nik', mdl.requireAuth, controllerDpi.getPermohonanBimtekByNik);
router.get('/permohonan-bimtek', mdl.requireAuth, controllerDpi.getStorePermohonanBimtek);
router.put('/permohonan-bimtek/:id', mdl.requireAuth, controllerDpi.uptStatusStorePermohonanBimtek);

// JAWABAN DPI
router.post('/jawaban-dpi', mdl.requireAuth, controllerDpi.inputJawabanDPI);
router.put('/jawaban-dpi/:id', mdl.requireAuth, controllerDpi.updateJawaban);
// router.get('/jawaban', mdl.requireAuth, controllerDpi.getJawaban);
// router.get('/jawaban-by-id-pengaduan/:id', mdl.requireAuth, controllerDpi.getJawabanByIdPengaduan);
// router.get('/jawaban/:id', mdl.requireAuth, controllerDpi.getJawabanById);
// router.delete('/jawaban/:id', mdl.requireAuth, controllerDpi.deleteJawaban);


module.exports = router;