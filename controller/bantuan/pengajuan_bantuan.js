const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { response, sekarang } = require("../../utils/utils");
const model = prisma.pengajuan_bantuan;
const helpers = require("../../helpers/Helpers");
// =============================== Data Bantuan ============================================
exports.create = async (req, res) => {
  const data = req.body;
  data.tanggal_pengajuan = await sekarang();
  console.log(data);
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

exports.getByUser = async (req, res) => {
  console.log(req.params.id);
  try {
    const data = await model.findMany({
      where: { id_member: Number(req.params.id) },
      include: {
        bantuan: {
          include: {
            users_login: true, // Include post categories
            ktp: true, // Include post categories
          },
        },
        status_bantuan: true,
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

exports.getByLembaga = async (req, res) => {
  console.log(req.params.id);
  try {
    const data = await model.findMany({
      where: { lembaga_bantuan_id: Number(req.params.id) },
      include: {
        bantuan: {
          include: {
            users_login: true, // Include post categories
            ktp: true, // Include post categories
          },
        },
        member: {
          include: {
            users_login: true,
            ktp: true,
          },
        },
        status_bantuan: true,
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
