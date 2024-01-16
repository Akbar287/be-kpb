const router = require("express").Router();
const tipeBantuanController = require("../controller/bantuan/tipe_bantuan");
const bantuanController = require("../controller/bantuan/bantuan");
const pengajuanBantuanController = require("../controller/bantuan/pengajuan_bantuan");
const statusBantuanController = require("../controller/bantuan/list_status_bantuan");
const utilsApps = require("../utils/utils");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mdl = require("../middleware/auth");
const uploadImgBantuan = multer({ storage: utilsApps.imgBantuan }).single(
  "gambar"
);

const directory = "../public/file_bantuan";
const dirPath = path.join(__dirname, directory);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
  console.log("Directory created:", dirPath);
}

//Master tipeBantuan Bantuan
router.post(
  "/tipeBantuan/",

  tipeBantuanController.create
);
router.get("/tipeBantuan/", tipeBantuanController.get);
router.get(
  "/tipeBantuan/getByid/:id",

  tipeBantuanController.getById
);
router.put(
  "/tipeBantuan/update/:id",

  tipeBantuanController.update
);
router.delete(
  "/tipeBantuan/delete/:id",

  tipeBantuanController.delete
);

//Master Status Bantuan
router.get("/statusBantuan/", mdl.requireAuth, statusBantuanController.get);

//Bantuan
router.post("/", mdl.requireAuth, uploadImgBantuan, bantuanController.create);
router.get(
  "/getByLembaga/:id",
  mdl.requireAuth,
  bantuanController.getByLembaga
);
router.get("/", mdl.requireAuth, bantuanController.get);
router.get("/getByid/:id", mdl.requireAuth, bantuanController.getById);
router.put("/update/:id", mdl.requireAuth, bantuanController.update);
router.delete("/delete/:id", mdl.requireAuth, bantuanController.delete);

//Pengajuan Bantuan
router.post("/pengajuan", mdl.requireAuth, pengajuanBantuanController.create);
router.get(
  "/pengajuan/getByUser/:id",
  mdl.requireAuth,
  pengajuanBantuanController.getByUser
);
router.get(
  "/pengajuan/getByLembaga/:id",
  mdl.requireAuth,
  pengajuanBantuanController.getByLembaga
);
router.get("/pengajuan/", mdl.requireAuth, pengajuanBantuanController.get);
router.get(
  "/pengajuan/getByid/:id",
  mdl.requireAuth,
  pengajuanBantuanController.getById
);
router.put(
  "/pengajuan/update/:id",
  mdl.requireAuth,
  pengajuanBantuanController.update
);
router.delete(
  "/pengajuan/delete/:id",
  mdl.requireAuth,
  pengajuanBantuanController.delete
);

module.exports = router;
