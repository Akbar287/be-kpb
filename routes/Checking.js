const router = require("express").Router();
const controller = require("../controller/Checking");
const mdl = require("../middleware/auth")
const mdlDev = require("../middleware/authdev")

router.post('/updateDate', controller.updateDateAlokasi)

router.get('/clearKTP', mdlDev.requireAuthDev, controller.clearKTP)
router.get('/checkIntegrated', mdlDev.requireAuthDev, controller.checkIntegrated)
router.get('/clearOkkpd', mdlDev.requireAuthDev, controller.clearOkkpd)
router.get('/clearSpace', mdlDev.requireAuthDev, controller.clearSpace)
router.post('/encryptionString', controller.encryptionString);

router.get('/resetStokDummy/:kode_kios', controller.resetStokDummy);

router.get('/clearPetik', mdlDev.requireAuthDev, controller.clearPetik);
router.get('/clear', mdlDev.requireAuthDev, controller.clearSertifBenih);

router.post('/createChldTransaksi', mdlDev.requireAuthDev, controller.createChldTransaksi);

router.get('/getStokKios/:id', controller.getStok);

router.get('/getResult', controller.getResult);

// router.get('/getAuth', mdlDev.makeAuthDev)
// router.get('/checkAuth', mdlDev.checkAuthDev)

// Check
router.post('/tembakRole', mdlDev.requireAuthDev, controller.tembakRole);
router.post('/checkalokasi', mdlDev.requireAuthDev, controller.checkAlokasi);

// Reset Alokasi Semula tanpa delete Transaksi
router.post('/resetAlokasiSemula', mdlDev.requireAuthDev, controller.resetAlokasiSemula);

// Reset Transaksi sembari memulangkan kembali
router.post('/resetTransaksibyIdTransaksi', mdlDev.requireAuthDev, controller.resetTransaksibyIdTransaksi);

// Reset Transaksi untuk Dummy
router.get('/resetTransaksi/:nik', controller.resetTransaksi);

// Check check 
router.get('/checkLogin', controller.checkLogin);
router.get('/checkTransaksi', controller.checkTransaksi);
router.get('/checkMember', controller.checkMember);
router.get('/checkKTP', controller.checkKTP);
router.get('/checkKios', controller.checkKios);

// Make Login
router.get('/makeLogin', controller.makeUserLogin);

// Add and Verify
router.get('/verifNik', controller.verifiedKTP);
router.post('/addKTP', mdl.requireAuth, controller.addKTP);
router.post('/addMember', mdl.requireAuth, controller.addMember);
router.post('/addKios', mdl.requireAuth, controller.addKios);

module.exports = router;  