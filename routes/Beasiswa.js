const router = require("express").Router();
const controller = require("../controller/Beasiswa");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')
const upload = multer({ storage: utilsApps.fileUniversitas }).fields([
  {
    name: 'image'
  }
])

const uploadFile = multer({ storage: utilsApps.filePengajuan }).fields([
  {
    name: 'file'
  }
])

router.post('/createUniv', upload, mdl.requireAuth, controller.createUniversitas)
router.get('/getAllUniv', mdl.requireAuth, controller.getAllUniversitas)
router.get('/getUnivMember/:id', mdl.requireAuth, controller.getUniv)
router.get('/getPenerima', controller.getPenerima)
router.post('/import-beasiswa', mdl.requireAuth, controller.importPenerima)
router.get('/export-beasiswa', controller.exportPenerima)
router.delete('/deletePenerima/:id', mdl.requireAuth, controller.deletePenerima)

router.post('/create', controller.createBeasiswa)
router.get('/getall', mdl.requireAuth, controller.getAllBeasiswa)
router.get('/getBeasiswa/:id', mdl.requireAuth, controller.getBeasiswa)
router.get('/getBeasiswabyUniv/:id', mdl.requireAuth, controller.getBeasiswabyUniv)
router.put('/updateBeasiswa/:id', mdl.requireAuth, controller.updateBeasiswa)
router.delete('/deleteBeasiswa/:id', mdl.requireAuth, controller.deleteBeasiswa)

router.post('/createRecomendation', controller.createRecomendation)
router.get('/getRecomendationsbyMember/:nik', controller.getRecomendationsbyMember)
router.get('/getRecomendationsbyUniv/:id', controller.getRecomendationsbyUniv)
router.get('/getRecomendations', controller.getRecomendations)
router.get('/getRecomendations/:id', controller.getDetailRecomendation)
router.put('/updateRecomendation/:id', uploadFile, mdl.requireAuth, controller.updateRecomendation)
router.delete('/deleteRecomendations/:id', mdl.requireAuth, controller.deleteRecomendations)
module.exports = router;