const router = require("express").Router();
const role = require("../controller/Role");
const layanan = require("../controller/Layanan");
const fitur = require("../controller/Fitur");
const bank = require("../controller/Bank");
const sarpras = require("../controller/Sarpras");
const asuransi = require("../controller/Asuransi");
const auth = require("../controller/Auth");
const barangDistri = require("../controller/BarangDIstri");
const barangPabrik = require("../controller/BarangPabrik");
const barangKios = require("../controller/BarangKios");
const stokPubersKios = require("../controller/StokKios");
const pabrik = require("../controller/Pabrik");
const poktan = require("../controller/PuberPoktan");
const distri = require("../controller/PubersDistributor");
const pubersKios = require("../controller/PubersKios");
const middleware = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const checking = require('../controller/Checking')
const f5f6 = require('../controller/F5F6')
const multer = require('multer')
// const uploadFileLayanan = multer({ storage: utilsApps.imgLayanan }).single("gambar")
const uploadFileLayanan = multer({ storage: utilsApps.imgLayanan }).fields([
  {
    name: 'gambar'
  },
  {
    name: 'icon'
  }
])
const uploadFileFitur = multer({ storage: utilsApps.imgFitur }).single("gambar")
const uploadFileSyarat = multer({ storage: utilsApps.fileSyarat }).single("file_syarat")
const uploadFileSarpras = multer({ storage: utilsApps.fileSarpras }).single("file")
const uploadFileAnggota = multer({ storage: utilsApps.fileAsuransi }).single("file_anggota")

//Master Role
router.post("/create-role", middleware.requireAuth, role.postRole);
router.get("/get-role", middleware.requireAuth, role.getRole);
router.get("/get-role/:id", middleware.requireAuth, role.getRoleById);
router.put("/update-role/:id", middleware.requireAuth, role.updateRole);
router.delete("/delete-role/:id", middleware.requireAuth, role.deleteRole);

//Master Layanan
router.post("/create-layanan", middleware.requireAuth, uploadFileLayanan, layanan.postLayanan);
router.get("/get-layanan", layanan.getLayanan);
router.get("/get-layanan/:id", middleware.requireAuth, layanan.getLayananById);
router.put("/update-layanan/:id", middleware.requireAuth, uploadFileLayanan, layanan.updateLayanan);
router.delete("/delete-layanan/:id", middleware.requireAuth, layanan.deleteLayanan);

//Master Fitur
router.post("/create-fitur", middleware.requireAuth, uploadFileFitur, fitur.postFitur);
router.get("/get-fitur", middleware.requireAuth, fitur.getFitur);
router.get("/get-fitur/:id", middleware.requireAuth, fitur.getFiturById);
router.put("/update-fitur/:id", middleware.requireAuth, uploadFileFitur, fitur.updateFitur);
router.delete("/delete-fitur/:id", middleware.requireAuth, fitur.deleteFitur);

//Menghubungkan Role Ke Layanan
router.get("/role-layanan/:id", middleware.requireAuth, layanan.getLayananByIdRole);
router.get("/role-layanan-belum-relasi/:id", middleware.requireAuth, layanan.getRoleLayanan);
router.post("/create-role-layanan", middleware.requireAuth, layanan.inputRoleLayanan);
router.delete("/delete-role-layanan/:id", middleware.requireAuth, layanan.deleteRoleLayanan);

//Menghubungkan Layanan Ke Fitur
router.get("/layanan-fitur/:id", middleware.requireAuth, fitur.getFiturByIdLayanan);
router.get("/layanan-fitur-belum-relasi/:id", middleware.requireAuth, fitur.getLayananrole);
router.post("/create-layanan-fitur", middleware.requireAuth, fitur.inputLayananFitur);
router.delete("/delete-layanan-fitur/:id", middleware.requireAuth, fitur.deleteLayananFitur);

//data bank
router.get('/bank', middleware.requireAuth, bank.getAllBank)
router.get('/bank/:id', middleware.requireAuth, bank.getBankById)
router.put('/bank/:id', middleware.requireAuth, uploadFileSyarat, bank.editBank)

//sarpras
router.get('/sektor', middleware.requireAuth, sarpras.getSektor)
router.post('/sektor', middleware.requireAuth, sarpras.createSektor)
router.put('/sektor/:id', middleware.requireAuth, sarpras.updateSektor)
router.get('/sektor/:id', middleware.requireAuth, sarpras.getSektorById)
router.get('/sektor-opt', middleware.requireAuth, sarpras.getSektorOpt)
router.get('/sektor-kategori/:id', middleware.requireAuth, sarpras.getKategori)
router.get('/komoditas/:id', middleware.requireAuth, sarpras.getKomoditasBySektorId)
router.get('/komoditas-opt', middleware.requireAuth, sarpras.getKomoditasBySektorOpt)

//->new tabel
router.get('/kategori/:id', middleware.requireAuth, sarpras.getKategoriMaster)
router.post('/create-sektor-kategori', middleware.requireAuth, sarpras.createKategori)
router.put('/update-sektor-kategori/:id', middleware.requireAuth, sarpras.updateKategori)

router.get('/detail-kategori/:id', middleware.requireAuth, sarpras.getDetailKategori)
router.post('/detail-kategori', middleware.requireAuth, sarpras.createDetailKategori)
router.put('/detail-kategori/:id', middleware.requireAuth, sarpras.updateDetailKategori)


router.get('/child-detail-kategori/:id', middleware.requireAuth, sarpras.getChildDetailKategori)
router.post('/child-detail-kategori', middleware.requireAuth, sarpras.createChildDetailKategori)
router.put('/child-detail-kategori/:id', middleware.requireAuth, sarpras.updateChildDetailKategori)


router.post('/sarpras', middleware.requireAuth, uploadFileSarpras, sarpras.postSarprasNew)
router.get('/sarpras', middleware.requireAuth, sarpras.getSarprasNew)
router.get('/sarpras-dropdown', middleware.requireAuth, sarpras.getSarprasDropDown)
router.get('/sarpras/:id', middleware.requireAuth, sarpras.getSarprasByIdNew)
router.put('/sarpras/:id', middleware.requireAuth, uploadFileSarpras, sarpras.updateSarprasNew)
router.delete('/sarpras/:id', middleware.requireAuth, sarpras.deleteSarpras)
//->end new tabel
router.get('/kategori-jenis/:id', middleware.requireAuth, sarpras.getJenis)

//akun dinas
router.get('/dinas', auth.getMemberDinas)

//BPJS
router.post('/bpjs', middleware.requireAuth, asuransi.insertBpjs)
router.get('/bpjs', middleware.requireAuth, asuransi.getAllBpjs)
router.put('/bpjs/:id', middleware.requireAuth, asuransi.updateBpjs)
router.delete('/bpjs/:id', middleware.requireAuth, asuransi.deleteBpjs)
router.get('/bpjs/:id', asuransi.getBpjsById)

//AUTS, AUTP, AUTSK 
router.post('/asuransis', middleware.requireAuth, uploadFileAnggota, asuransi.createDataAsuransi)
router.put('/asuransis', middleware.requireAuth, uploadFileAnggota, asuransi.updateAsuransi)
router.get('/asuransis/:id', middleware.requireAuth, uploadFileAnggota, asuransi.getJasindoByIdMember)
router.get('/asuransis-detail/:id', middleware.requireAuth, uploadFileAnggota, asuransi.getJasindoById)
router.get('/asuransis', middleware.requireAuth, uploadFileAnggota, asuransi.getJasindo)
router.get('/asuransi-type', middleware.requireAuth, asuransi.getDataAsuransi)


//barang pabrik
router.post('/barang-pabrik', middleware.requireAuth, barangPabrik.postBarang)
router.get('/barang-pabrik/:id', middleware.requireAuth, barangPabrik.getDataBarangPabrik)

//barang distri
router.post('/barang-distri', middleware.requireAuth, barangDistri.postBarang)
router.get('/barang-distri/:id', middleware.requireAuth, barangDistri.getDataBarangDistri)
router.get('/barang-distri', middleware.requireAuth, barangDistri.getAllDataBarangDistri)
router.put('/barang-distri/:id', middleware.requireAuth, barangDistri.updateBarangDistri)
router.delete('/barang-distri/:id', middleware.requireAuth, barangDistri.deleteBarangDistri)

//barang kios
router.post('/barang-kios', middleware.requireAuth, barangKios.postBarang)
router.get('/barang-kios/:id', middleware.requireAuth, barangKios.getDataBarangKios)
router.get('/barang-kios', middleware.requireAuth, barangKios.getAllDataBarangKios)

//pabrik
router.get('/pabrik', middleware.requireAuth, pabrik.getPabrik)

//stok kios
router.get('/stok-kios/:nik', middleware.requireAuth, stokPubersKios.getStokKiosByKios)
router.post('/stok-kios/:nik', middleware.requireAuth, stokPubersKios.createData)


//Pubers Kios
router.get('/data-kios/', middleware.requireAuth, pubersKios.getKios)
router.get('/data-poktan-kios/:nik', middleware.requireAuth, pubersKios.getPoktanbyKios)
router.post('/pubers-kios/:nik', middleware.requireAuth, pubersKios.createUpdatePubersKios)
router.get('/pubers-kios/:nik', middleware.requireAuth, pubersKios.getPuberKiosBynik)
router.get('/pubers-kios-belum-ada-distri/:kodedistri', middleware.requireAuth, pubersKios.kiosBelumAdaDistri)

//master poktan
router.get('/anggota-poktan/:nik', middleware.requireAuth, poktan.getDataAnggota)
router.get('/pubers-poktan/:nik', middleware.requireAuth, poktan.getPoktan)
router.post('/pubers-poktan/:nik', middleware.requireAuth, poktan.createUpdatePubersPoktan)
router.get('/ketua-poktan/', middleware.requireAuth, poktan.getKetuaPoktan)
router.put('/update-poktan/', middleware.requireAuth, poktan.updatePoktan)

//master distributor
router.get('/pubers-distri/:nik', middleware.requireAuth, distri.getDistributorByNik)
router.put('/pubers-distri', middleware.requireAuth, distri.updateDistributor)
router.get('/pubers-distri', middleware.requireAuth, distri.getDistributor)
router.get('/data-kios-distri/:nik', middleware.requireAuth, distri.listKiosDistributor)

router.post('/distri-kios', middleware.requireAuth, distri.inputDistriKios)
router.get('/kios-distri/:nik', middleware.requireAuth, distri.getDistributorByNikKios)

//master check
router.get('/landing-page', checking.landingpage)

//master pubers
router.get('/pubers', middleware.requireAuth, f5f6.getListPupuk)

//maseter f6
router.post('/f5f6', middleware.requireAuth, f5f6.insertDataF5F6)
router.get('/f5f6', middleware.requireAuth, f5f6.getF5f6)
router.put('/f5f6/:id', middleware.requireAuth, f5f6.editDataF5F6)
router.get('/f6/:tahun/:bulan/:kode_distributor/:kodekios', middleware.requireAuth, f5f6.getf6)
router.get('/f5/:tahun/:bulan/:kode_distributor', middleware.requireAuth, f5f6.getf5)

module.exports = router;