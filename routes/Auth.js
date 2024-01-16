const router = require("express").Router();
const controller = require("../controller/Auth");
const middleware = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const uploadFileSyarat = multer({ storage: utilsApps.fileSyarat }).single("file_syarat")

router.post("/sign-in", controller.signIn);
router.post("/sign-up", controller.signUp);
router.post("/sign-up-bank", middleware.requireAuth, uploadFileSyarat, controller.signUpBank);
router.post("/sign-up-asuransi", middleware.requireAuth, uploadFileSyarat, controller.signUpAsuransi);
router.post("/sign-up-dinas", middleware.requireAuth, uploadFileSyarat, controller.signUpDinas);
router.post("/sign-up-pabrik", middleware.requireAuth, uploadFileSyarat, controller.signUpPabrik);

module.exports = router;