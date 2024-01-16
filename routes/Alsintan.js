const router = require("express").Router();
const alsintan = require("../controller/Alsintan");
const mdl = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const filePengajuanAlsintan = multer({ storage: utilsApps.fileAlsintan }).fields([{ "name": "FileKTP" }, { "name": "FileSuratPermohonan" }, { "name": "FileRekomendasi" }])
const filesuratjalan = multer({ storage: utilsApps.fileAlsintan }).single("filesurat")
/* 
    *************** START ROUTES ALSINTAAN ***********************
*/
// PENYEDIA ALSINTAN
router.post('/jabatan-penyedia', mdl.requireAuth, alsintan.inputJabatanPenyedia)
router.get('/jabatan-penyedia', mdl.requireAuth, alsintan.getAllJabatanPenyedia)
router.get('/jabatan-penyedia/:id', mdl.requireAuth, alsintan.getAllJabatanPenyediaById)
router.put('/jabatan-penyedia/:id', mdl.requireAuth, alsintan.editJabatanPenyedia)
router.delete('/jabatan-penyedia/:id', mdl.requireAuth, alsintan.hapusJabatanPenyedia)

router.get('/master-harga/getAll', mdl.requireAuth, alsintan.getAllMasterHarga)
router.get('/master-harga/getid/:id', mdl.requireAuth, alsintan.getMasterHargaID)
router.get('/master-harga/getbyidstok/:id', mdl.requireAuth, alsintan.getMasterHargabyIdStok)
router.put('/master-harga/update/:id', mdl.requireAuth, alsintan.getMasterHargaUpdate)
router.delete('/master-harga/delete/:id', mdl.requireAuth, alsintan.getMasterHargaDelete)
router.post('/master-harga/create', mdl.requireAuth, alsintan.getMasterHargaCreate)

router.get('/master-logtransaksi/getAll', mdl.requireAuth, alsintan.getAllMasterStatusLogTransaksi)

//Agen
router.get('/agen', mdl.requireAuth, alsintan.getAllAgen)
router.post('/agen-save', mdl.requireAuth, alsintan.simpanAgen)
router.get('/agen-detail/:nik', mdl.requireAuth, alsintan.detailAgen)
router.get('/agen-summary/:id', mdl.requireAuth, alsintan.getSummaryAgen)
router.get('/agen-datapeminjaman/:idagen/:status', mdl.requireAuth, alsintan.getDataPeminjamanAgen)

//PEGAWAI ALSINTAN
router.post('/pegawai', mdl.requireAuth, alsintan.inputPegawaiAlsintan)
router.get('/pegawai', mdl.requireAuth, alsintan.getAllPegawaiAlsintan)

//Gudang Master
router.get('/gudang-master/member/:id', mdl.requireAuth, alsintan.getGudangByIdMember)
router.post('/gudang-master/member/input-stok', mdl.requireAuth, alsintan.inputStokMMKeGudang)
router.post('/gudang-master/member/input-sn', mdl.requireAuth, alsintan.inputSNOnly)
router.put('/gudang-master/member/update-stok/:id', mdl.requireAuth, alsintan.editSerialNumber)
router.get('/gudang-master/member/barang/:idmember/:idgudang', mdl.requireAuth, alsintan.getBarangGudangMember)
router.get('/gudang-master/member/list-barang/serial-number/:idmember/:idmm/:idgudang/:idagen', mdl.requireAuth, alsintan.getSerialNumber)

//Material Master
router.get('/material-master/', mdl.requireAuth, alsintan.getMaterialMaster)
router.get('/material-master/detail/:id/', mdl.requireAuth, alsintan.getMaterialMasterDetail)
router.get('/material-master/for-member/', mdl.requireAuth, alsintan.getMMForMember)

// Transaksi Alsintan
router.post('/transaksi/member/pengajuan', mdl.requireAuth, filePengajuanAlsintan, alsintan.inputPengajuanPeminjaman)
router.get('/transaksi/member/riwayat/:idmember/:status', mdl.requireAuth, alsintan.getRiwayatPengajuanMember)
router.get('/transaksi/member/detail/riwayat/:id', mdl.requireAuth, alsintan.getDetailRiwayatPengajuanMember)
router.get('/transaksi/member/log/:idmember/:idtr', mdl.requireAuth, alsintan.getLogTransaksi)
router.get('/transaksi/member/konfirm-sampai/:idpemohon/:idtr', mdl.requireAuth, alsintan.konfirmasiSampai)
router.get('/transaksi/member/summary/:id/', mdl.requireAuth, alsintan.getSummaryMember)

router.get('/transaksi/brigade/pengajuan/:idmember/', mdl.requireAuth, alsintan.getBrigadePengajuanBaru)
router.get('/transaksi/brigade/pengajuanmm/:idmember/:idgudang/:idmm/:idagen/:status', mdl.requireAuth, alsintan.getBrigadePengajuanMM)
router.get('/transaksi/brigade/riwayat-pengajuan/:idmember/:statuspinjam', mdl.requireAuth, alsintan.getBrigadeRiwayatPengajuan)
router.get('/transaksi/brigade/detail-pengajuan/:id/', mdl.requireAuth, alsintan.getBrigadeDetailPengajuanPermohonan)
router.get('/transaksi/brigade/get-stoksn/:id/', mdl.requireAuth, alsintan.getStokPeminjaman)
router.get('/transaksi/brigade/get-datasnpersetujuan/:idpermohonan/', mdl.requireAuth, alsintan.getDataSerialNumberApprove)
router.put('/transaksi/brigade/uploadsuratjalan/:id', mdl.requireAuth, filesuratjalan, alsintan.uploadSuratJalan)

router.post('/transaksi/brigade/setujui-permohonan/', mdl.requireAuth, alsintan.simpanApprovePeminjaman)
router.post('/transaksi/brigade/tolak-permohonan/', mdl.requireAuth, alsintan.simpanRejectPermohonan)
router.post('/transaksi/brigade/update-keterangan-permohonan/', mdl.requireAuth, alsintan.UpdateKeteranganPermohonan)
router.get('/transaksi/brigade/update-statuspeminjaman/:idpemohon/:idtr/:status', mdl.requireAuth, alsintan.UpdateStatusPeminjaman)
router.get('/transaksi/brigade/summary/:id/', mdl.requireAuth, alsintan.getSummaryBrigade)
router.post('/transaksi/brigade/rekaplaporan/:idmember', mdl.requireAuth, alsintan.filterRekapLaporan)

/*
    *************** END ROUTES ALSINTAAN ***********************
*/

//HELPER ROUTE
router.get('/master-penyedia', mdl.requireAuth, alsintan.getMasterPenyedia)
router.get('/member-access-pegawai-alsintan', mdl.requireAuth, alsintan.getMemberByPegawai)
router.get('/gudang', mdl.requireAuth, alsintan.getGudang)


module.exports = router;