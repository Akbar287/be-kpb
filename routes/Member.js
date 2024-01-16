const router = require("express").Router();
const controller = require("../controller/Member");
const mdl = require("../middleware/auth")

//akses member
router.get("/layanan/:id", mdl.requireAuth, controller.getLayananUsers);
router.get("/fitur/:id", mdl.requireAuth, controller.getFiturUser);
router.get("/cek-roles/:idmember/:idrole", mdl.requireAuth, controller.cekRoleMember);
router.get("/cek-layanan/:idrole/:idlayanan", mdl.requireAuth, controller.cekLayananMember);
router.get("/cek-fitur/:idlayanan/:idfitur", mdl.requireAuth, controller.cekFiturMember);
router.get("/cek-verified-ktp/:ktp", controller.cekVerifiedKtpByKtp);
router.get("/ktp-belum-aktif", mdl.requireAuth, controller.getKtpBelumAktif);
router.get("/ktp-ditolak", mdl.requireAuth, controller.getKtpDiTolak);
router.put("/verifikasi-ktp/:nik", mdl.requireAuth, controller.verifikasiKtp);
router.put("/verifikasi-all-ktp", mdl.requireAuth, controller.verifikasiAllKtp);

//hubungan member ke role
router.post("/create-member-role", mdl.requireAuth, controller.hubunganMemberKeRole)
router.get("/cek-role-member/:idmember", mdl.requireAuth, controller.getRoleMember)
router.post("/create-role-member", mdl.requireAuth, controller.inputRoleMember)
router.get("/role-member/:idmember", mdl.requireAuth, controller.getRoleMemberWithParams)

//hubungan layanan ke fitur

//member for admin
router.put("/update-status-role-member/:id", mdl.requireAuth, controller.updateStatusRoleMember)
router.put("/update-status-role-all-member", mdl.requireAuth, controller.updateStatusRoleAllMember)
router.get("/get-all-role-member", mdl.requireAuth, controller.getRoleMemberAll)
// router.get("/member-aktif", controller.getMemberAktif)
router.get("/member-aktif", mdl.requireAuth, controller.getMemberAktif)
router.get("/member-aktif/:id", mdl.requireAuth, controller.getMemberAktifByNik)
router.get("/member", mdl.requireAuth, controller.getAllMember)

//member by id role
router.get("/member-by-role/:id", mdl.requireAuth, controller.getMemberByIdRole)


// reset password member
router.put("/reset-password/:nik", mdl.requireAuth, controller.resetPassword);
router.put("/change-password/:nik", mdl.requireAuth, controller.changePassword);
router.put("/update-profile/:nik", mdl.requireAuth, controller.updateProfile);

module.exports = router;