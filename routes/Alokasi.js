const router = require("express").Router();
const alokasi = require("../controller/Alokasi");
const mdl = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const uploadFileBuktiBayar = multer({ storage: utilsApps.fileBuktiTransfer }).single("gambar")

router.post('/import-alokasi', mdl.requireAuth, alokasi.importAlokasi)
router.delete('/delete_alokasi', alokasi.deleteAlokasi)
router.get('/data', alokasi.getAllDataALokasi)
router.get('/data-by-poktan/:nik/:komoditas/:masatanam/:tahun', mdl.requireAuth, alokasi.getAllDataALokasiByPoktan)
router.put('/realokasi', mdl.requireAuth, alokasi.realokasiPubers)
router.get('/data-alokasi-pernik/:nik', mdl.requireAuth, alokasi.getAllDataALokasiByPetani)

//transaksi alokasi
router.post('/transaksi-subsidi', mdl.requireAuth, alokasi.transaksiAlokasiStok)
router.post('/create-uniq-number', mdl.requireAuth, alokasi.createUniqNumber)
router.get('/transaksi-subsidi', alokasi.getDataTransaksi)
router.get('/transaksi-subsidi/:id', mdl.requireAuth, alokasi.getDetailTransaksi)
router.put('/transaksi-subsidi/:id', mdl.requireAuth, uploadFileBuktiBayar, alokasi.updateStatusTransaksi)
router.post('/transaksi-subsidi-va', mdl.requireAuth, alokasi.transaksiAlokasiStokVirtualAccount)
router.post('/re-transaksi-subsidi-va', mdl.requireAuth, alokasi.reGenerateVa)

//alokasi kios
router.get('/jatah-kios/:nik', mdl.requireAuth, alokasi.jatahAlokasiKios)

//alokasi distri
router.get('/jatah-kios-distributor/:nik', mdl.requireAuth, alokasi.jatahAlokasiDistriPerKios)
router.get('/jatah-distributor/:nik', mdl.requireAuth, alokasi.jatahAlokasiDistri)

//laporan F9
router.get('/laporan-f9', mdl.requireAuth, alokasi.laporanF9)

//update status tf kios
router.put('/update-status-tf-kios/:id', mdl.requireAuth, alokasi.updateSatatusTfKios)

module.exports = router;