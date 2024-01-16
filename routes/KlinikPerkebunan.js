const router = require("express").Router();
const controller = require("../controller/KlinikPerkebunan");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')

const uploadFile = multer({ storage: utilsApps.fileKlinikPerkebunan }).fields([
    {
        name: 'fotodaun'
    },
    {
        name: 'fotobuah'
    },
    {
        name: 'fotoakar'
    },
    {
        name: 'fotobatang'
    },
])

const uploadArtikel = multer({ storage: utilsApps.fileKlinikPerkebunan }).fields([
    {
        name: 'gambar'
    },
])

router.post('/addpengajuanklinik', uploadFile, mdl.requireAuth, controller.addPengajuan);
router.get('/getlistklinik/:role/:type', controller.getAllPengajuan);
router.get('/getlistklinikbynik/:nik', controller.getAllPengjuanByNik);
router.get('/detailklinik/:id', controller.detailKlinik);
router.put('/jawabpengajuan/:id', controller.jawabPengajuan);
router.put('/keuptd/:id', controller.keUptd);

router.post('/artikel', uploadArtikel, mdl.requireAuth, controller.addArtikel);
router.put('/artikel/:id', uploadArtikel, mdl.requireAuth, controller.editArtikel);
router.delete('/artikel/:id', controller.deleteArtikel);
router.get('/artikels', controller.getAllArtikel);
router.get('/artikel/:id', controller.getArtikel);


module.exports = router;