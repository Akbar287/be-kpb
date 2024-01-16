const router = require("express").Router();
const controller = require("../controller/SertifikasiBenih");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')
const uploadFileBuktiBayar = multer({ storage: utilsApps.fileSertifBenih }).fields([
  {
    name: 'suratPermohonan'
  },
  {
    name: 'suratIUP'
  },
  {
    name: 'suratAsalBenih'
  },
  {
    name: 'suratDO'
  },
  {
    name: 'ktp'
  },
  {
    name: 'Catatan'
  },
  {
    name: 'desainKebun'
  },
])

const uploadStat = multer({ storage: utilsApps.fileSertifBenih }).fields([
  {
    name: 'file'
  },
  {
    name: 'sertifikat'
  }
])

router.post('/addSertifikasiBenih', uploadFileBuktiBayar, mdl.requireAuth, controller.addSertif);
router.get('/getListSertifikasiBenih', controller.getSertif);
router.get('/getListSertifikasiBenihByNik/:nik', controller.getSertifByNik);
router.get('/detailSertifikasi/:id', controller.detailSertif);
router.put('/updateStatus/:id', uploadStat, controller.updateSertif)

module.exports = router;