const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { response, sekarang } = require("../../utils/utils");
const model = prisma.bantuan;
const helpers = require("../../helpers/Helpers");
// =============================== Data Bantuan ============================================
exports.create = async (req, res) => {
  const data = JSON.parse(req.body.data);
  if (req.file === undefined) {
    data.gambar = "pagenotfound.png";
  } else {
    data.gambar = req.file.originalname;
  }
  console.log(req.file);
  try {
    const service = await model.create({ data: data });
    if (service) {
      res.json(response.success(200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error(500));
  }
};

exports.getByLembaga = async (req, res) => {
  console.log(req);
  try {
    const data = await model.findMany({
      where: { lembaga_bantuan_id: Number(req.params.id) },
      include: {
        tipe_bantuan: true,
        child_dtl_kategori: true,
        ktp: true,
        users_login: true,
      },
    });
    if (data) {
      res.json(response.successWithData(data, 200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error(500));
  }
};
exports.get = async (req, res) => {
  console.log(req);
  try {
    const data = await model.findMany({
      include: {
        tipe_bantuan: true,
        child_dtl_kategori: true,
        ktp: true,
        users_login: true,
      },
    });
    if (data) {
      res.json(response.successWithData(data, 200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(response.error(500));
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await model.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (data) {
      res.json(response.successWithData(data, 200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    res.status(500).json(response.error(500));
  }
};

exports.update = async (req, res) => {
  const data = req.body;
  try {
    const update = await model.update({
      where: {
        id: Number(req.params.id),
      },
      data: data,
    });
    if (update) {
      res.json(response.success(200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    res.status(500).json(response.error(500));
  }
};

exports.delete = async (req, res) => {
  try {
    const del = await model.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    if (del) {
      res.json(response.success(200));
    } else {
      res.json(response.error(400));
    }
  } catch (error) {
    res.status(500).json(response.error(500));
  }
};
// ============================== END Data Master CRUD ==============================================
