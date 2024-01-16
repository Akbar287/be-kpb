const router = require("express").Router();
const controller = require("../controller/Kur");
const middleware = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const uploadFileKur = multer({ storage: utilsApps.fileKur }).fields([{ "name": "file_rut" }, { "name": "file_lainnya1" }])

router.post("/pengajuan", middleware.requireAuth, uploadFileKur, controller.postkur);
router.get("/pengajuan-member/:id", middleware.requireAuth, controller.getKurByMember);
router.get("/pengajuan/:id", middleware.requireAuth, controller.getKurByBank);
router.get("/pengajuan-detail/:id", controller.getKurByIdKur);
router.get("/pengajuan-wilayah-penyuluh/:id", middleware.requireAuth, controller.getKurByWilayahPenyuluh);
router.get("/pengajuan-wilayah-dinas-kab/:idkab/:idrole", middleware.requireAuth, controller.getKurByWilayahDinasKab);
router.get("/pengajuan-wilayah-dinas-prov/:idrole", middleware.requireAuth, controller.getKurByWilayahDinasProv);
router.get("/pengajuan-wilayah-dinas-kpb-center", middleware.requireAuth, controller.getKurByWilayahKpbCenter);

//kur dinas dkp
router.get("/pengajuan-wilayah-dinas-kab-dkp/:idkab", controller.getKurDkpByWilayahDinasKab);
router.get("/pengajuan-wilayah-dinas-prov-dkp", controller.getKurDkpByWilayahDinasrov);

//status 
router.get("/status-kur", middleware.requireAuth, controller.getStatusKur)
router.put("/status-kur/:id", middleware.requireAuth, controller.editStatusKur)
router.get("/status-kur-bank", controller.getStatusKurBank)
router.get("/status-history-kur/:id", middleware.requireAuth, controller.getHistoryStatusByIdKur)

//acc kur
router.put("/acc/:id", middleware.requireAuth, controller.udpdateStatusPengajuanKur)

//realisasi kur
router.get("/realisasi", middleware.requireAuth, controller.getKurRealisassi)

router.get("/temp-pinjaman", controller.getPeminjaman);
router.get("/get-export", controller.getExports);

module.exports = router;