const router = require("express").Router();
const controller = require("../controller/Duta");
const mdl = require("../middleware/auth")
const multer = require('multer')
const utilsApps = require('../utils/utils')
const uploadFile = multer({ storage: utilsApps.fileUpload })

router.post('/createActivity', uploadFile.array('images', 6), controller.createActivity)
router.put('/updateActivity/:id', uploadFile.array('images', 6), mdl.requireAuth, controller.updateActivity)
router.delete('/delete/:id', mdl.requireAuth, controller.deleteAktivity)
router.get('/getActivity/:nik', mdl.requireAuth, controller.getActivity)
router.get('/getAllActivity', mdl.requireAuth, controller.getUserActivity)
router.get('/getDetail/:id', mdl.requireAuth, controller.getDetailActiviy)

module.exports = router;