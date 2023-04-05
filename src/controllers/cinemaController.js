const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");
const config = require("../config");

const model = new PrismaClient();

const addCinemaSystem = async (req, res) => {
  try {
    const { maHeThongRap, tenHeThongRap } = req.body;
    const errors = {};

    if (!req.file || !maHeThongRap || !tenHeThongRap) {
      if (!req.file) errors.file = "Vui lòng upload hình ảnh!";
      if (!maHeThongRap)
        errors.maHeThongRap = "Mã hệ thống rạp không được bỏ trống!";
      if (!tenHeThongRap)
        errors.tenHeThongRap = "Tên hệ thống rạp không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const { filename } = req.file;
    const isExists = await model.HeThongRap.findFirst({
      where: { ma_he_thong_rap: maHeThongRap },
    });

    if (isExists) {
      return res.json(ResponseError(400, "Mã hệ thống rạp đã tồn tại!"));
    }

    const result = await model.HeThongRap.create({
      data: {
        ma_he_thong_rap: maHeThongRap,
        ten_he_thong_rap: tenHeThongRap,
        logo: `${config.url}/${filename}`,
      },
    });
    return res.json(ResponseSuccess(200, result, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getListCinemaSystem = async (req, res) => {
  try {
    let { maHeThongRap } = req.query;
    let data = [];

    if (!maHeThongRap) {
      data = await model.HeThongRap.findMany();
    }

    data = await model.HeThongRap.findMany({
      where: { ma_he_thong_rap: maHeThongRap },
    });

    const content = data.map((cinema) => {
      return {
        maHeThongRap: cinema.ma_he_thong_rap,
        tenHeThongRap: cinema.ten_he_thong_rap,
        logo: `${config.url}/${cinema.logo}`,
      };
    });

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addCinemaComplex = async (req, res) => {
  try {
    let { tenCumRap, diaChi, maHeThongRap } = req.body;

    if (!tenCumRap || !diaChi || !maHeThongRap) {
      const errors = {};
      if (!tenCumRap) errors.tenCumRap = "Tên cụm rạp không được bỏ trống.";
      if (!diaChi) errors.diaChi = "Địa chỉ cụm rạp không được bỏ trống.";
      if (!maHeThongRap)
        errors.maHeThongRap = "Mã hệ thống rạp không được bỏ trống.";
      return res.json(ResponseError(400, errors, errors));
    }

    const maHeThongRapIsExist = await model.HeThongRap.findFirst({
      where: { ma_he_thong_rap: maHeThongRap },
    });

    if (!maHeThongRapIsExist)
      return res.json(
        ResponseError(
          400,
          "Mã hệ thống rạp không tồn tại.",
          "Mã hệ thống rạp không tồn tại."
        )
      );

    const cumRapIsExist = await model.CumRap.findFirst({
      where: { ten_cum_rap: tenCumRap },
    });

    if (cumRapIsExist)
      return res.json(
        ResponseError(400, "Cụm rạp đã tồn tại.", "Cụm rạp đã tồn tại.")
      );

    const data = {
      ten_cum_rap: tenCumRap,
      dia_chi: diaChi,
      ma_he_thong_rap: maHeThongRap,
    };
    const result = await model.CumRap.create({ data });

    const content = {
      maCumRap: result.ma_cum_rap,
      tenCumRap,
      diaChi,
      maHeThongRap,
    };

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addCinema = async (req, res) => {
  try {
    let { maCumRap, tenRap } = req.body;

    if (!maCumRap || !tenRap) {
      const errors = {};
      if (!maCumRap) errors.maCumRap = "Mã cụm rạp không được bỏ trống.";
      if (!tenRap) errors.tenRap = "Tên rạp không được bỏ trống.";
      return res.json(ResponseError(400, errors, errors));
    }

    const maCumRapIsExist = await model.CumRap.findFirst({
      where: { ma_cum_rap: Number(maCumRap) },
    });

    if (!maCumRapIsExist)
      return res.json(
        ResponseError(
          400,
          "Mã cụm rạp không tồn tại.",
          "Mã cụm rạp không tồn tại."
        )
      );

    const rapIsExist = await model.RapPhim.findFirst({
      where: { ten_rap: tenRap },
    });

    const data = {
      ten_rap: tenRap,
      ma_cum_rap: Number(maCumRap),
    };
    const result = await model.RapPhim.create({ data });

    const content = {
      maRap: result.ma_rap,
      tenRap,
      maCumRap,
    };

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getCinemaComplexList = async (req, res) => {
  try {
    let { maHeThongRap } = req.query;

    if (!maHeThongRap)
      return res.json(
        ResponseError(
          400,
          "Mã hệ thống rạp không hợp lệ.",
          "Mã hệ thống rạp không hợp lệ."
        )
      );

    const data = await model.CumRap.findMany({
      where: { ma_he_thong_rap: maHeThongRap },
      include: { RapPhim: true },
    });

    const content = data.map((item) => {
      return {
        maCumRap: item.ma_cum_rap,
        tenCumRap: item.ten_cum_rap,
        diaChi: item.dia_chi,
        maHeThongRap: item.ma_he_thong_rap,
        danhSachRap: item.RapPhim?.map((rap) => {
          return { maRap: rap.ma_rap, tenRap: rap.ten_rap };
        }),
      };
    });

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getInfoShowtime = async (req, res) => {
  try {
    const { maPhim } = req.query;

    if (!maPhim)
      return res.json(
        ResponseError(400, "Mã phim không hợp lệ.", "Mã phim không hợp lệ.")
      );

    const data = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });

    const lichChieu = await model.LichChieu.findMany({
      where: { ma_phim: Number(maPhim) },
    });

    const heThongRap = await model.HeThongRap.findMany({
      include: {
        CumRap: {
          include: { RapPhim: true },
        },
      },
    });

    const content = {
      maPhim: data.ma_phim,
      tenPhim: data.ten_phim,
      trailer: data.trailer,
      hinhAnh: `${config.url}/${data.hinh_anh}`,
      moTa: data.mo_ta,
      ngayKhoiChieu: data.ngay_khoi_chieu,
      danhGia: data.danh_gia,
      hot: data.hot,
      dangChieu: data.dang_chieu,
      sapChieu: data.sap_chieu,
    };

    return res.json(ResponseSuccess(200, heThongRapChieu, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = {
  addCinemaSystem,
  getListCinemaSystem,
  addCinemaComplex,
  addCinema,
  getCinemaComplexList,
  getInfoShowtime,
};
