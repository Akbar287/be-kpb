const router = require("express").Router();
const controller = require("../controller/Wilayah");

router.get("/provinsi/:id", controller.getProvinsiByID);
router.get("/kabupaten/:id", controller.getKabupatenByIdProv);
router.get("/kecamatan/:id", controller.getKecamatanByIdKab);
router.get("/desa/:id", controller.getDesaByIdKecamatan);

module.exports = router;