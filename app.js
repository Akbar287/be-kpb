const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const prisma = new PrismaClient();
const morgans = require("morgan");
const cors = require("cors");
const path = require("path");
const apiVersion = process.env.API_VERSION;

const fs = require("fs");
const https = require("https");
const privateKey = fs.readFileSync("./cert/privkey-api.key");
const certificate = fs.readFileSync("./cert/cert-api.crt");

const credential = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credential, app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgans("dev"));
app.use(cors());

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

app.get("/", (req, res) => {
  res.json({ message: "Welcome to my api" });
});

app.use(
  `${apiVersion}/file-syarat`,
  express.static(path.join(__dirname, "public/file_syarat"))
);

app.use(
  `${apiVersion}/file-duta`,
  express.static(path.join(__dirname, "public/file_duta"))
);

app.use(
  `${apiVersion}/file-okkpd`,
  express.static(path.join(__dirname, "public/okkpd"))
);

app.use(
  `${apiVersion}/file-universitas`,
  express.static(path.join(__dirname, "public/universitas"))
);

app.use(
  `${apiVersion}/file-pengajuan`,
  express.static(path.join(__dirname, "public/pengajuan"))
);

app.use(
  `${apiVersion}/image/layanan`,
  express.static(path.join(__dirname, "public/gambar_layanan"))
);

app.use(
  `${apiVersion}/file-sertif`,
  express.static(path.join(__dirname, "public/file_sertif"))
);

app.use(
  `${apiVersion}/file-sertif-pertanian`,
  express.static(path.join(__dirname, "public/file_sertif_pertanian"))
);

app.use(
  `${apiVersion}/file-rut`,
  express.static(path.join(__dirname, "public/file_kur"))
);

app.use(
  `${apiVersion}/file-sarpras`,
  express.static(path.join(__dirname, "public/file_sarpras"))
);

app.use(`${apiVersion}/files`, express.static(path.join(__dirname, "public")));

app.use(
  `${apiVersion}/file-anggota`,
  express.static(path.join(__dirname, "public/file_asuransi"))
);

app.use(
  `${apiVersion}/file-bukti-transfer`,
  express.static(path.join(__dirname, "public/bukti_transfer"))
);

app.use(
  `${apiVersion}/file-alsintan`,
  express.static(path.join(__dirname, "public/file_alsintan"))
);

app.use(
  `${apiVersion}/file-material-master`,
  express.static(path.join(__dirname, "public/file_material_master"))
);

app.use(
  `${apiVersion}/file-dokter`,
  express.static(path.join(__dirname, "public/profile_dokter"))
);

app.use(
  `${apiVersion}/opt-pengaduan`,
  express.static(path.join(__dirname, "public/opt_pengaduan"))
);

app.use(
  `${apiVersion}/opt-pengaduan-dpi`,
  express.static(path.join(__dirname, "public/opt_pengaduan_dpi"))
);

app.use(
  `${apiVersion}/opt-informasi`,
  express.static(path.join(__dirname, "public/file_informasi"))
);

app.use(
  `${apiVersion}/file-duta`,
  express.static(path.join(__dirname, "public/file_duta"))
);

app.use(
  `${apiVersion}/file-sijelabat`,
  express.static(path.join(__dirname, "public/file_sijelabat"))
);

app.use(
  `${apiVersion}/file-sijelabat-buktibayar`,
  express.static(path.join(__dirname, "public/file_sijelabat_buktibayar"))
);

app.use(
  `${apiVersion}/file-klinik`,
  express.static(path.join(__dirname, "public/file_klinik"))
);

app.use(`${apiVersion}/check`, require("./routes/Checking"));
app.use(`${apiVersion}/sertifpertanian`, require('./routes/SertifikasiBenihPertanian'))
app.use(`${apiVersion}/sertif`, require("./routes/SertifikasiBenih"));
app.use(`${apiVersion}/beasiswa`, require("./routes/Beasiswa"));
app.use(`${apiVersion}/okkpd`, require("./routes/Okkpd"));
app.use(`${apiVersion}/auth`, require("./routes/Auth"));
app.use(`${apiVersion}/users`, require("./routes/Member"));
app.use(`${apiVersion}/areas`, require("./routes/Wilayah"));
app.use(`${apiVersion}/master`, require("./routes/Master"));
app.use(`${apiVersion}/kur`, require("./routes/Kur"));
app.use(`${apiVersion}/asuransi`, require("./routes/Asuransi"));
app.use(`${apiVersion}/alsintan`, require("./routes/Alsintan"));
app.use(`${apiVersion}/alokasi`, require("./routes/Alokasi"));
app.use(`${apiVersion}/opt`, require("./routes/OPT"));
app.use(`${apiVersion}/duta`, require("./routes/Duta"));
app.use(`${apiVersion}/sijelabat`, require("./routes/Sijelabat"));
app.use(`${apiVersion}/bantuan`, require("./routes/Bantuan"));
app.use(`${apiVersion}/bantuan`, require("./routes/Bantuan"));
app.use(`${apiVersion}/klinik`, require('./routes/KlinikPerkebunan'))

app.use(
  `${apiVersion}/file-sijelabat-buktibayar`,
  express.static(path.join(__dirname, "public/file_sijelabat_buktibayar"))
);

prisma.$connect().then(() => { console.log('Database Conected') }).catch(() => { console.log('Database NOT Conected') })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
