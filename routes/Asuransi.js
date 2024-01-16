const router = require("express").Router();
const controller = require("../controller/Asuransi");
const middleware = require("../middleware/auth")

router.get("/bpjs", controller.getBpjs);
router.get("/fullbpjs", controller.getFullBpjs);
router.get("/autp", controller.getAutph);
router.get("/autsk", controller.getAutsk);

router.post('/export-bpjs', controller.exportBpjs)

//bpjs
router.get('/bpjs/:id', middleware.requireAuth, controller.getBpjsByIdMember)
router.get('/bpjs-status', middleware.requireAuth, controller.getStatusKurBpjs)
router.get('/jasindo-status', middleware.requireAuth, controller.getStatusJasindo)

//acc asuransi
router.put("/acc-bpjs/:id", middleware.requireAuth, controller.updateStatusBpjsMember)
router.put("/acc-jasindo/:id", middleware.requireAuth, controller.updateStatusJasindoMember)


module.exports = router;