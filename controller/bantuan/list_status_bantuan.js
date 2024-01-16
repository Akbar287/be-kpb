const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { response, sekarang } = require("../../utils/utils");
const model = prisma.status_bantuan;
const helpers = require("../../helpers/Helpers");
// =============================== Data Bantuan ============================================

exports.get = async (req, res) => {
  try {
    const data = await model.findMany({});
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
