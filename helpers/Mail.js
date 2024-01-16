const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const mustache = require("mustache");
// Konfigurasi transporter (pengirim)
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Ganti dengan layanan email yang Anda gunakan
    auth: {
        user: 'ekpblampung@gmail.com',
        pass: 'iafmcxiuelfqqenn'
    }
});

// Pengaturan email yang akan dikirim
const mailOptions = (pengirim, data) => {
    const template = fs.readFileSync(
        "./helpers/TemplateEmail.html",
        "utf8"
    );
    return {
        from: 'ekpblampung@gmail.com', // Alamat email pengirim
        to: 'freyajoza@gmail.com', // Alamat email penerima
        // to: 'dwi.romadhan@ubl.ac.id', // Alamat email penerima
        subject: `Laporan pengaduan e-POPT dari ${pengirim}`, // Subjek email
        // text: `Berikut ini adalah pengaduan serangan OPT dengan isi pengaduan : ${keterangan} \nTanggal Pengaduan ${tgl} \nSilahkan login ke aplikasi e-KPB (e-kpb.lampungprov.go.id) Untuk tindak lanjut pengaduan ini.` // Isi email dalam teks biasa
        html: mustache.to_html(template, { ...data })
    }
};

module.exports = { mailOptions, transporter }