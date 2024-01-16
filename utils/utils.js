const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const randomString = require("randomstring");
const xlsxtojson = require("xlsx-to-json-lc");

const response = {
  errorWithData: (data, code) => {
    return {
      status: false,
      code: code,
      message: `Gagal memuat => ${data}`,
    };
  },
  successWithData: (data, code) => {
    return {
      status: true,
      code: code,
      message: "Berhasil memuat permintaan",
      result: data,
    };
  },
  successWithDataNikerror: (data, error, code) => {
    return {
      status: true,
      code: code,
      message: "Berhasil memuat permintaan",
      nikError: error,
      result: data,
    };
  },
  success: (code) => {
    return {
      status: true,
      code: code,
      message: "Berhasil memuat permintaan",
    };
  },
  successData: (msg, code) => {
    return {
      status: true,
      code: code,
      message: `Berhasil memuat permintaan => ${msg}`,
    };
  },
  successDataReturnUniqiD: (total, code) => {
    return {
      status: true,
      code: code,
      message: `Berhasil memuat permintaan`,
      totalTransaksi: total,
    };
  },
  successNotData: (code) => {
    return {
      status: true,
      code: code,
      message: "Berhasil memuat permintaan. Tidak ada data !!!",
    };
  },
  error: (code) => {
    return {
      status: false,
      code: code,
      message: "Terjadi kesalahan",
    };
  },
  errorAuth: (code) => {
    return {
      status: false,
      code: code,
      message: "Anda harus login!!",
    };
  },

  cekAkses: (status, code, msg) => {
    return {
      status: status,
      code: code,
      message: msg,
    };
  },
  commonSuccessDataPaginate: (data, total, page, perpage, filter) => {
    let message, result;
    if (data === null) {
      message = "Tidak Ada Data";
      result = [];
    } else {
      message = "Berhasil Memuat Permintaan";
      result = data;
    }
    return {
      status: true,
      rc: "0000",
      message: message,
      result: result,
      paginate: {
        rowsNumber: total,
        page: page,
        rowsPerPage: perpage,
        filter: filter,
      },
    };
  },
};

const sekarang = async () => {
  const now =
    await prisma.$queryRaw`SELECT NOW() AT TIME ZONE 'Asia/Jakarta' as sekarang`;
  return now[0].sekarang;
};

const imgLayanan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/gambar_layanan");
  },
});

const imgFitur = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/icon_fitur");
  },
});

const imgBantuan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/icon_fitur");
  },
});

const fileKur = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_kur");
  },
});

const fileSyarat = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_syarat");
  },
});

const fileSarpras = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_sarpras");
  },
});

const fileAsuransi = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_asuransi");
  },
});

const fileAlokasi = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/file_alokasi");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") +
      Math.ceil(Math.random() * 1000000) +
      file.originalname
    );
  },
});

const fileBuktiTransfer = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/bukti_transfer");
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  console.log("type = " + file.mimetype);
  let allowedType = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: fileAlokasi,
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
  fileFilter: fileFilter,
}).single("fileExcel");

const uploadFiles = (req, res) =>
  new Promise(async (resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err);
      }
      if (!req.file) {
        console.log("tidak ada file");
        reject(err);
      }
      try {
        xlsxtojson(
          {
            input: req.file.path,
            output: null, //since we don't need output.json
            lowerCaseHeaders: false,
          },
          async (err, result) => {
            resolve(result);
          }
        );
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  });

const fileAlsintan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_alsintan");
  },
});

const fileMaterialMaster = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_material_master");
  },
});

const fileSertifBenih = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_sertif");
  },
});

const fileSertifPertanian = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    )
    cb(null, Date.now() + randomString.generate(7) + ext)
  },
  destination: async function (req, file, cb) {
    cb(null, './public/file_sertif_pertanian')
  }
})

const fileUniversitas = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/universitas");
  },
});

const filePengajuan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/pengajuan");
  },
});

const fileOkkpd = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/okkpd");
  },
});

const cekNull = (fileUpload) => {
  console.log(__dirname, "../public/file_sertif");
  console.log(fileUpload);
  if (fileUpload === undefined || fileUpload === null) {
    return null;
  } else {
    console.log(fileUpload.length);
    if (fileUpload.length > 1) {
      var namaFile = "";
      for (const file of fileUpload) {
        namaFile = namaFile + "," + file.filename;
      }
      var array = namaFile.split(",");
      array.splice(0, 1);
      return array;
    } else {
      return fileUpload[0].filename;
    }
  }
};

const profileDokter = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/profile_dokter");
  },
});

const optPengaduan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/opt_pengaduan");
  },
});

const optPengaduanDpi = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/opt_pengaduan_dpi");
  },
});

const optInformasi = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_informasi");
  },
});

const fileUpload = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_duta");
  },
});

const fileSijelabat = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    cb(null, Date.now() + randomString.generate(7) + ext);
  },
  destination: async function (req, file, cb) {
    cb(null, "./public/file_sijelabat");
  },
});

const aturSendiri = async (tanggal) => {
  const date = await prisma.$queryRawUnsafe(
    `SELECT TIMESTAMP WITH TIME ZONE '${tanggal} ${jam === "" ? "00:00:" : jam
    }+07' AT TIME ZONE 'Asia/Jakarta' as tanggal`
  );
  return date[0].tanggal;
};

const fileKlinikPerkebunan = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    )
    cb(null, Date.now() + randomString.generate(7) + ext)
  },
  destination: async function (req, file, cb) {
    cb(null, './public/file_klinik')
  }
})

// module.exports = {
//   response,
//   sekarang,
//   imgLayanan,
//   imgFitur,
//   fileKur,
//   fileSyarat,
//   fileSarpras,
//   fileAsuransi,
//   uploadFiles,
//   fileBuktiTransfer,
//   fileAlsintan,
//   fileMaterialMaster,
//   cekNull,
//   fileSertifBenih,
//   fileUniversitas,
//   filePengajuan,
//   fileOkkpd,
//   profileDokter,
//   optPengaduan,
//   optInformasi,
//   fileUpload,
//   optPengaduanDpi,
//   fileSijelabat,
//   aturSendiri,
//   fileKlinikPerkebunan
// };
//     const date = await prisma.$queryRawUnsafe(`SELECT TIMESTAMP WITH TIME ZONE '${tanggal} ${jam === '' ? '00:00:' : jam}+07' AT TIME ZONE 'Asia/Jakarta' as tanggal`)
//     return date[0].tanggal
// }

const fileSijelabatBuktiBayar = multer.diskStorage({
  filename: async function (req, file, cb) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    )
    cb(null, Date.now() + randomString.generate(7) + ext)
  },
  destination: async function (req, file, cb) {
    cb(null, './public/file_sijelabat_buktibayar')
  }
})

module.exports = { response, sekarang, imgLayanan, imgFitur, fileKur, fileSyarat, fileSarpras, fileAsuransi, uploadFiles, fileBuktiTransfer, fileAlsintan, fileMaterialMaster, cekNull, fileSertifBenih, fileUniversitas, filePengajuan, fileOkkpd, profileDokter, optPengaduan, optInformasi, fileUpload, optPengaduanDpi, fileSijelabat, aturSendiri, fileSijelabatBuktiBayar, fileKlinikPerkebunan }
