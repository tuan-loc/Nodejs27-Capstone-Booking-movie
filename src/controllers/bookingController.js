const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");
const config = require("../config");

const model = new PrismaClient();

const addShowtime = async (req, res) => {
  try {
    const { maPhim, ngayChieuGioChieu, maRap, giaVe } = req.body;
    const errors = {};

    if (!maPhim || !ngayChieuGioChieu || !maRap || !giaVe) {
      if (!maPhim) errors.maPhim = "Mã phim không được bỏ trống.";
      if (!ngayChieuGioChieu)
        errors.ngayChieuGioChieu = "Ngày giờ chiếu không được bỏ trống!";
      if (!maRap) errors.maRap = "Mã rạp không được bỏ trống!";
      if (!giaVe) errors.giaVe = "Giá vé không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const maPhimIsExist = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });

    if (!maPhimIsExist) {
      return res.json(ResponseError(400, "Phim không tồn tại."));
    }

    const maRapIsExist = await model.RapPhim.findFirst({
      where: { ma_rap: Number(maRap) },
    });

    if (!maRapIsExist) {
      return res.json(ResponseError(400, "Rạp không tồn tại."));
    }

    const data = {
      ma_rap: Number(maRap),
      ma_phim: Number(maPhim),
      ngay_gio_chieu: new Date(ngayChieuGioChieu),
      gia_ve: Number(giaVe),
    };

    const result = await model.LichChieu.create({ data });

    const content = {
      maLichChieu: result.ma_lich_chieu,
      maRap,
      maPhim,
      ngayChieuGioChieu: result.ngay_gio_chieu,
      giaVe: result.gia_ve,
    };
    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const bookingTicket = async (req, res) => {
  try {
    const { taiKhoan, maLichChieu, maGhe } = req.body;
    const errors = {};

    if (!taiKhoan || !maLichChieu || !maGhe) {
      if (!taiKhoan) errors.taiKhoan = "Tài khoản không được bỏ trống.";
      if (!maLichChieu)
        errors.maLichChieu = "Mã lịch chiếu không được bỏ trống!";
      if (!maGhe) errors.maGhe = "Mã ghế không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const taiKhoanIsExist = await model.NguoiDung.findFirst({
      where: { tai_khoan: taiKhoan },
    });

    if (!taiKhoanIsExist)
      return res.json(
        ResponseError(
          400,
          "Người dùng không tồn tại.",
          "Người dùng không tồn tại."
        )
      );

    const maLichChieuIsExist = await model.LichChieu.findFirst({
      where: { ma_lich_chieu: Number(maLichChieu) },
    });

    if (!maLichChieuIsExist)
      return res.json(
        ResponseError(
          400,
          "Mã lịch chiếu không tồn tại.",
          "Mã lịch chiếu không tồn tại."
        )
      );

    const maGheIsExist = await model.Ghe.findFirst({
      where: { ma_ghe: Number(maGhe) },
    });

    if (!maGheIsExist)
      return res.json(
        ResponseError(400, "Mã ghế không tồn tại.", "Mã ghế không tồn tại.")
      );

    const data = {
      tai_khoan: taiKhoan,
      ma_lich_chieu: Number(maLichChieu),
      ma_ghe: Number(maGhe),
    };

    const result = await model.DatVe.create({ data });

    const content = {
      taiKhoan,
      maLichChieu,
      maGhe,
    };
    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addSeat = async (req, res) => {
  try {
    const { tenGhe, loaiGhe, maRap } = req.body;
    const errors = {};

    if (!tenGhe || !loaiGhe || !maRap) {
      if (!tenGhe) errors.tenGhe = "Tên ghế không được bỏ trống.";
      if (!loaiGhe) errors.loaiGhe = "Loại ghế không được bỏ trống!";
      if (!maRap) errors.maRap = "Mã rạp không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const rapIsExist = await model.RapPhim.findFirst({
      where: { ma_rap: Number(maRap) },
    });

    if (!rapIsExist) {
      return res.json(ResponseError(400, "Rạp không tồn tại."));
    }

    const data = {
      ten_ghe: tenGhe,
      loai_ghe: loaiGhe,
      ma_rap: Number(maRap),
    };

    const result = await model.Ghe.create({ data });

    const content = {
      maGhe: result.ma_ghe,
      tenGhe,
      loaiGhe,
      maRap,
    };
    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

// later----------------------------------
const getListTicketRoom = async (req, res) => {
  try {
    const { maLichChieu } = req.query;

    if (!maLichChieu)
      return res.json(
        ResponseError(
          400,
          "Mã lịch chiếu không hợp lệ.",
          "Mã lịch chiếu không hợp lệ."
        )
      );

    const maLichChieuIsExist = await model.LichChieu.findFirst({
      where: { ma_lich_chieu: Number(maLichChieu) },
    });

    if (!maLichChieuIsExist)
      return res.json(
        ResponseError(
          400,
          "Lịch chiếu không tồn tại.",
          "Lịch chiếu không tồn tại."
        )
      );

    let data = await model.LichChieu.findMany({
      include: {
        Phim: true,
        RapPhim: { include: { CumRap: { include: { HeThongRap: true } } } },
      },
      where: { ma_lich_chieu: Number(maLichChieu) },
    });

    return res.json(ResponseSuccess(200, data, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = { addShowtime, bookingTicket, addSeat, getListTicketRoom };
