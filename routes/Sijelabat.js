const router = require("express").Router();
const BahanBakuController = require("../controller/Sijelabat/BahanBaku");
const ProdusenController = require("../controller/Sijelabat/Produsen");
const UniversalController = require("../controller/Sijelabat/UniversalSijelabat");
const DistributorController = require("../controller/Sijelabat/Distributor");
const KiosController = require("../controller/Sijelabat/Kios");
const PembudiDayaController = require("../controller/Sijelabat/PembudiDaya");
const AdminController = require("../controller/Sijelabat/AdminSijelabat");
const mdl = require("../middleware/auth")
const utilsApps = require('../utils/utils')
const multer = require('multer')
const fileListKatalog = multer({ storage: utilsApps.fileSijelabat }).single("Foto")
const fileBuktiBayar = multer({ storage: utilsApps.fileSijelabatBuktiBayar }).single("Foto")


//============ProfilUsaha====================
router.get('/profil-usaha/show/byidmember/:idmember/:idlayanan', mdl.requireAuth, UniversalController.getProfilUsahaByMember)
router.get('/profil-usaha/master-bank/show', mdl.requireAuth, UniversalController.getMasterBank)
router.post('/profil-usaha/insert/', mdl.requireAuth, UniversalController.saveInputProfilUsaha)
router.put('/profil-usaha/update/:profilusahaid', mdl.requireAuth, UniversalController.saveUpdateProfilUsaha)

//============================CHECKOUT======================
router.post('/checkout/keranjang/input/', mdl.requireAuth, UniversalController.saveKeranjang)
router.put('/checkout/mm/rincian/:idmember/:idlayanan', mdl.requireAuth, UniversalController.getProdukByID)
router.delete('/checkout/keranjang/hapus/:idkeranjang/', mdl.requireAuth, UniversalController.hapusKeranjang)
router.delete('/checkout/keranjang/hapus/:idkeranjang/', mdl.requireAuth, UniversalController.hapusKeranjang)
router.post('/checkout/keranjang/quantity/update', mdl.requireAuth, UniversalController.updateQuantityKeranjang)
router.post('/checkout/pembelian/save', mdl.requireAuth, UniversalController.saveCheckout)

router.put('/universal/detail-transaksi/next-status/:idorder/', mdl.requireAuth, UniversalController.nextStepStatus)
router.put('/universal/laporan-transaksi/:idmember/:idlayanan', mdl.requireAuth, UniversalController.getTransaksi)


//===========================BAHAN BAKU==================================
router.post('/bahan-baku/list-katalog/insert/', mdl.requireAuth, fileListKatalog, BahanBakuController.saveInsertListKatalog)
router.get('/bahan-baku/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, BahanBakuController.getListKatalog)
router.put('/bahan-baku/list-katalog/update/:idmm', mdl.requireAuth, fileListKatalog, BahanBakuController.saveUpdateListKatalog)
router.put('/bahan-baku/list-katalog/update-status/:idmm', mdl.requireAuth, BahanBakuController.saveUpdateStatusListKatalog)
router.post('/bahan-baku/list-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, BahanBakuController.getListTransaksi)
router.get('/bahan-baku/summary-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, BahanBakuController.getSummaryTransaksi)
router.get('/bahan-baku/list-transaksi/detail/:idorder/', mdl.requireAuth, BahanBakuController.getDetailTransaksi)
router.put('/bahan-baku/list-transaksi/konfirmasi-pemesanan/:idorder/', mdl.requireAuth, BahanBakuController.konfirmasiPemesanan)
router.put('/bahan-baku/list-transaksi/konfirmasi-pembayaran/:idorder/', mdl.requireAuth, BahanBakuController.konfirmasiPembayaran)
router.get('/bahan-baku/list-relasi/show/:idmember/:idlayanan', mdl.requireAuth, BahanBakuController.getRelasi)
router.get('/bahan-baku/list-relasi/detail/:profilusahaid', mdl.requireAuth, BahanBakuController.getDetailRelasi)


//===========================PRODUSEN==================================
router.post('/produsen/list-katalog/insert/', mdl.requireAuth, fileListKatalog, ProdusenController.saveInsertListKatalog)
router.get('/produsen/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, ProdusenController.getListKatalog)
router.put('/produsen/list-katalog/update/:idmm', mdl.requireAuth, fileListKatalog, ProdusenController.saveUpdateListKatalog)
router.put('/produsen/list-katalog/update-status/:idmm', mdl.requireAuth, ProdusenController.saveUpdateStatusListKatalog)
router.get('/produsen/list-penyedia/show/', mdl.requireAuth, ProdusenController.getDaftarPenyedia)
router.get('/produsen/list-penyedia/produk/:idprofilusaha', mdl.requireAuth, ProdusenController.getDaftarProdukByPenyedia)
router.get('/produsen/riwayat-pemesanan/get/:idmember/:idlayanan/:idrole', mdl.requireAuth, ProdusenController.getRiwayatPemesanan)
router.get('/produsen/riwayat-pemesanan/detail/:idorder/', mdl.requireAuth, ProdusenController.getDetailRiwayatPemesanan)
router.put('/produsen/riwayat-pemesanan/unggah-bayar/:idorder/', mdl.requireAuth, fileBuktiBayar, ProdusenController.uploadBuktiBayar)

router.post('/produsen/list-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, ProdusenController.getListTransaksi)
router.get('/produsen/summary-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, ProdusenController.getSummaryTransaksi)
router.get('/produsen/list-transaksi/detail/:idorder/', mdl.requireAuth, ProdusenController.getDetailTransaksi)
router.put('/produsen/list-transaksi/konfirmasi-pemesanan/:idorder/', mdl.requireAuth, ProdusenController.konfirmasiPemesanan)
router.put('/produsen/list-transaksi/konfirmasi-pembayaran/:idorder/', mdl.requireAuth, ProdusenController.konfirmasiPembayaran)

router.get('/produsen/list-relasi/show/:idmember/:idlayanan', mdl.requireAuth, ProdusenController.getRelasi)
router.get('/produsen/list-relasi/detail/:profilusahaid', mdl.requireAuth, BahanBakuController.getDetailRelasi)


//===========================DISTRIBUTOR=============================
router.get('/distributor/list-profil-usaha-produsen/byidmember/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getListProfilUsaha)
router.get('/distributor/list-mm-produsen/byidusaha/:idprofilusaha', mdl.requireAuth, DistributorController.getListMMByIDUsaha)
router.post('/distributor/list-katalog/insert/', mdl.requireAuth, DistributorController.saveInsertListKatalog)
router.get('/distributor/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getListKatalog)
router.put('/distributor/list-katalog/update-status/:idmm', mdl.requireAuth, DistributorController.saveUpdateStatusListKatalog)
router.put('/distributor/list-katalog/update/:idmm', mdl.requireAuth, DistributorController.saveUpdateListKatalog)
router.get('/distributor/list-penyedia/show/', mdl.requireAuth, DistributorController.getDaftarPenyedia)
router.get('/distributor/list-penyedia/produk/:idprofilusaha', mdl.requireAuth, DistributorController.getDaftarProdukByPenyedia)
router.get('/distributor/riwayat-pemesanan/get/:idmember/:idlayanan/:idrole', mdl.requireAuth, DistributorController.getRiwayatPemesanan)
router.get('/distributor/riwayat-pemesanan/detail/:idorder/', mdl.requireAuth, DistributorController.getDetailRiwayatPemesanan)
router.put('/distributor/riwayat-pemesanan/unggah-bayar/:idorder/', mdl.requireAuth, fileBuktiBayar, DistributorController.uploadBuktiBayar)

router.post('/distributor/list-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getListTransaksi)
router.get('/distributor/summary-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getSummaryTransaksi)
router.get('/distributor/list-transaksi/detail/:idorder/', mdl.requireAuth, DistributorController.getDetailTransaksi)
router.put('/distributor/list-transaksi/konfirmasi-pemesanan/:idorder/', mdl.requireAuth, DistributorController.konfirmasiPemesanan)
router.put('/distributor/list-transaksi/konfirmasi-pembayaran/:idorder/', mdl.requireAuth, DistributorController.konfirmasiPembayaran)

router.get('/distributor/list-relasi/show/:idmember/:idlayanan', mdl.requireAuth, DistributorController.getRelasi)
router.get('/distributor/list-relasi/detail/:profilusahaid', mdl.requireAuth, DistributorController.getDetailRelasi)


//===========================KIOS=============================
router.get('/kios/list-profil-usaha-distributor/byidmember/:idmember/:idlayanan', mdl.requireAuth, KiosController.getListProfilUsaha)
router.get('/kios/list-mm-distributor/byidusaha/:idprofilusaha', mdl.requireAuth, KiosController.getListMMByIDUsaha)
router.post('/kios/list-katalog/insert/', mdl.requireAuth, KiosController.saveInsertListKatalog)
router.get('/kios/list-katalog/show/:idmember/:idlayanan', mdl.requireAuth, KiosController.getListKatalog)
router.put('/kios/list-katalog/update-status/:idmm', mdl.requireAuth, KiosController.saveUpdateStatusListKatalog)
router.put('/kios/list-katalog/update/:idmm', mdl.requireAuth, KiosController.saveUpdateListKatalog)
router.get('/kios/list-penyedia/show/', mdl.requireAuth, KiosController.getDaftarPenyedia)
router.get('/kios/list-penyedia/produk/:idprofilusaha', mdl.requireAuth, KiosController.getDaftarProdukByPenyedia)
router.get('/kios/riwayat-pemesanan/get/:idmember/:idlayanan/:idrole', mdl.requireAuth, KiosController.getRiwayatPemesanan)
router.get('/kios/riwayat-pemesanan/detail/:idorder/', mdl.requireAuth, KiosController.getDetailRiwayatPemesanan)
router.put('/kios/riwayat-pemesanan/unggah-bayar/:idorder/', mdl.requireAuth, fileBuktiBayar, KiosController.uploadBuktiBayar)

router.post('/kios/list-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, KiosController.getListTransaksi)
router.get('/kios/summary-transaksi/show/:idmember/:idlayanan', mdl.requireAuth, KiosController.getSummaryTransaksi)
router.get('/kios/list-transaksi/detail/:idorder/', mdl.requireAuth, KiosController.getDetailTransaksi)
router.put('/kios/list-transaksi/konfirmasi-pemesanan/:idorder/', mdl.requireAuth, KiosController.konfirmasiPemesanan)
router.put('/kios/list-transaksi/konfirmasi-pembayaran/:idorder/', mdl.requireAuth, KiosController.konfirmasiPembayaran)

router.get('/kios/list-relasi/show/:idmember/:idlayanan', mdl.requireAuth, KiosController.getRelasi)
router.get('/kios/list-relasi/detail/:profilusahaid', mdl.requireAuth, KiosController.getDetailRelasi)

//==========================PEMBUDI-DAYA===============================
router.get('/pembudi-daya/list-produk/', mdl.requireAuth, PembudiDayaController.getDaftarProduk)
router.get('/pembudi-daya/list-produk/detail/:idmm/:idprofilusaha', mdl.requireAuth, PembudiDayaController.getDetailProduk)
router.post('/pembudi-daya/keranjang/input/', mdl.requireAuth, PembudiDayaController.saveKeranjang)
router.get('/pembudi-daya/mm/rincian/:idmember/', mdl.requireAuth, PembudiDayaController.getProdukByID)
router.post('/pembudi-daya/keranjang/quantity/update', mdl.requireAuth, PembudiDayaController.updateQuantityKeranjang)
router.post('/pembudi-daya/pembelian/save', mdl.requireAuth, PembudiDayaController.saveCheckout)
router.get('/pembudi-daya/alamat/show/:idmember/:idlayanan', mdl.requireAuth, PembudiDayaController.getAlamat)
router.put('/pembudi-daya/alamat/update/:idalamat', mdl.requireAuth, PembudiDayaController.saveUpdateAlamat)
router.post('/pembudi-daya/alamat/insert/', mdl.requireAuth, PembudiDayaController.saveAlamat)
router.put('/pembudi-daya/pemesanan/show/:idmember/:idlayanan', mdl.requireAuth, PembudiDayaController.getRiwayatPemesanan)
router.get('/pembudi-daya/pemesanan/summary/:idmember/:idlayanan', mdl.requireAuth, PembudiDayaController.getSummaryTransaksi)
router.get('/pembudi-daya/pemesanan/detail/:idorder/', mdl.requireAuth, PembudiDayaController.getDetailRiwayatPemesanan)
router.put('/pembudi-daya/pemesanan/unggah-bayar/:idorder/', mdl.requireAuth, fileBuktiBayar, PembudiDayaController.uploadBuktiBayar)

//==========================ADMIN===============================
router.get('/admin-sijelabat/dashboard/summary', mdl.requireAuth, AdminController.getSummaryDataDashborad)
router.get('/admin-sijelabat/profil-usaha/unverif', mdl.requireAuth, AdminController.getPUWaitingVerif)
router.get('/admin-sijelabat/profil-usaha/show', mdl.requireAuth, AdminController.getPUVerifikasi)
router.get('/admin-sijelabat/profil-usaha/detail/:profilusahaid', mdl.requireAuth, AdminController.getDetailPU)
router.get('/admin-sijelabat/profil-usaha/delete/:profilusahaid', mdl.requireAuth, AdminController.deletePU)
router.put('/admin-sijelabat/profil-usaha/action/:profilusahaid', mdl.requireAuth, AdminController.saveUpdateProfilUsaha)
router.post('/admin-sijelabat/laporan/data-transaksi/show', mdl.requireAuth, AdminController.getTransaksi)
router.get('/admin-sijelabat/laporan/data-transaksi/detail/:idorder/', mdl.requireAuth, AdminController.getDetailTransaksi)


module.exports = router;