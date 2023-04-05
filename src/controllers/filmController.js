const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");
const config = require("../config");

const model = new PrismaClient();

const addFilm = async (req, res) => {
  try {
    const {
      tenPhim,
      trailer,
      moTa,
      ngayKhoiChieu,
      danhGia,
      hot,
      dangChieu,
      sapChieu,
    } = req.body;
    const errors = {};

    if (
      !req.file ||
      !tenPhim ||
      !trailer ||
      !moTa ||
      !ngayKhoiChieu ||
      !danhGia ||
      !hot ||
      !dangChieu ||
      !sapChieu
    ) {
      if (!req.file) errors.file = "Vui lòng upload hình ảnh.";
      if (!tenPhim) errors.tenPhim = "Tên phim không được bỏ trống.";
      if (!trailer) errors.trailer = "Trailer không được bỏ trống!";
      if (!moTa) errors.moTa = "Mô tả không được bỏ trống!";
      if (!ngayKhoiChieu)
        errors.ngayKhoiChieu = "Ngày khởi chiếu không được bỏ trống!";
      if (!danhGia) errors.danhGia = "Đánh giá không được bỏ trống!";
      if (!hot) errors.hot = "Hot không được bỏ trống!";
      if (!dangChieu) errors.dangChieu = "Đang chiếu không được bỏ trống!";
      if (!sapChieu) errors.sapChieu = "Sắp chiếu không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const { filename } = req.file;
    const isExists = await model.Phim.findFirst({
      where: { ten_phim: tenPhim },
    });

    if (isExists) {
      return res.json(ResponseError(400, "Phim đã tồn tại."));
    }

    const data = {
      ten_phim: tenPhim,
      trailer,
      hinh_anh: filename,
      mo_ta: moTa,
      ngay_khoi_chieu: new Date(ngayKhoiChieu),
      danh_gia: Number(danhGia),
      hot: hot === "true" ? true : false,
      sap_chieu: sapChieu === "true" ? true : false,
      dang_chieu: dangChieu === "true" ? true : false,
    };

    const result = await model.Phim.create({ data });

    const content = {
      maPhim: result.ma_phim,
      tenPhim,
      trailer,
      hinhAnh: `${config.url}/${filename}`,
      moTa,
      ngayKhoiChieu: result.ngay_khoi_chieu,
      danhGia: result.danh_gia,
      hot: result.hot,
      sapChieu: result.sap_chieu,
      dangChieu: result.dang_chieu,
    };
    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addBanner = async (req, res) => {
  try {
    const { maPhim } = req.body;

    if (!req.file || !maPhim) {
      const errors = {};
      if (!req.file) errors.hinhAnh = "Vui lòng upload hình ảnh.";
      if (!maPhim) errors.maPhim = "Mã phim không hợp lệ.";
      return res.json(ResponseError(400, errors, errors));
    }

    const film = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });

    if (!film)
      return res.json(
        ResponseError(400, "Phim không tồn tại.", "Phim không tồn tại.")
      );

    const data = await model.banner.create({
      data: { ma_phim: Number(maPhim), hinh_anh: req.file.filename },
    });

    const content = {
      maBanner: data.ma_banner,
      maPhim: data.ma_phim,
      hinhAnh: `${config.url}/${data.hinh_anh}`,
    };

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getBannerList = async (req, res) => {
  try {
    const banner = await model.Banner.findMany();

    const data = banner.map((item) => {
      return {
        maBanner: item.ma_banner,
        maPhim: item.ma_phim,
        hinhAnh: `${config.url}/${item.hinh_anh}`,
      };
    });

    return res.json(ResponseSuccess(200, data, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getFilmList = async (req, res) => {
  try {
    const { tenPhim } = req.query;
    let content = [];

    if (!tenPhim) {
      content = await model.Phim.findMany();
      console.log(content);
    } else {
      content = await model.Phim.findMany({
        where: { ten_phim: { contains: tenPhim } },
      });
    }

    const data = content.map((item) => {
      return {
        maPhim: item.ma_phim,
        tenPhim: item.ten_phim,
        trailer: item.trailer,
        hinhAnh: `${config.url}/${item.hinh_anh}`,
        moTa: item.mo_ta,
        ngayKhoiChieu: item.ngay_khoi_chieu,
        danhGia: item.danhGia,
        hot: item.hot,
      };
    });

    return res.json(ResponseSuccess(200, data, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getFilmListPagination = async (req, res) => {
  try {
    let { tenPhim, soTrang, soPhanTuTrenTrang } = req.query;
    let filmList = [];
    let skip = 0;
    let take = 20;

    if (soPhanTuTrenTrang) {
      take = Number(soPhanTuTrenTrang);
    }

    if (soTrang) {
      skip = (Number(soTrang) - 1) * take;
    }

    if (tenPhim) {
      filmList = await model.Phim.findMany({
        where: { ten_phim: { contains: tenPhim } },
        skip: skip,
        take: take,
      });

      if (userList.length === 0) {
        return res.json(ResponseError(400, [], "Không tìm thấy phim!"));
      }
    } else {
      filmList = await model.Phim.findMany({ skip: skip, take: take });
    }

    let lstPhim = filmList.map((item) => {
      return {
        maPhim: item.ma_phim,
        tenPhim: item.ten_phim,
        trailer: item.trailer,
        hinhAnh: `${config.url}/${item.hinh_anh}`,
        moTa: item.mo_ta,
        ngayKhoiChieu: item.ngay_khoi_chieu,
        hot: item.hot,
        danhGia: item.danh_gia,
        dangChieu: item.dang_chieu,
        sapChieu: item.sap_chieu,
      };
    });

    return res.json(ResponseSuccess(200, lstPhim, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const updateFilm = async (req, res) => {
  try {
    const {
      maPhim,
      tenPhim,
      trailer,
      moTa,
      ngayKhoiChieu,
      danhGia,
      hot,
      dangChieu,
      sapChieu,
    } = req.body;
    const errors = {};

    if (
      !req.file ||
      !maPhim ||
      !tenPhim ||
      !trailer ||
      !moTa ||
      !ngayKhoiChieu ||
      !danhGia ||
      !hot ||
      !dangChieu ||
      !sapChieu
    ) {
      if (!req.file) errors.file = "Vui lòng upload hình ảnh.";
      if (!maPhim) errors.maPhim = "Mã phim không hợp lệ.";
      if (!tenPhim) errors.tenPhim = "Tên phim không được bỏ trống.";
      if (!trailer) errors.trailer = "Trailer không được bỏ trống!";
      if (!moTa) errors.moTa = "Mô tả không được bỏ trống!";
      if (!ngayKhoiChieu)
        errors.ngayKhoiChieu = "Ngày khởi chiếu không được bỏ trống!";
      if (!danhGia) errors.danhGia = "Đánh giá không được bỏ trống!";
      if (!hot) errors.hot = "Hot không được bỏ trống!";
      if (!dangChieu) errors.dangChieu = "Đang chiếu không được bỏ trống!";
      if (!sapChieu) errors.sapChieu = "Sắp chiếu không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const { filename } = req.file;
    const isExists = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });

    if (!isExists) {
      return res.json(
        ResponseError(400, "Phim không tồn tại.", "Phim không tồn tại.")
      );
    }

    const data = {
      ten_phim: tenPhim,
      trailer,
      hinh_anh: filename,
      mo_ta: moTa,
      ngay_khoi_chieu: new Date(ngayKhoiChieu),
      danh_gia: Number(danhGia),
      hot: hot === "true" ? true : false,
      sap_chieu: sapChieu === "true" ? true : false,
      dang_chieu: dangChieu === "true" ? true : false,
    };

    const result = await model.Phim.update({
      where: { ma_phim: Number(maPhim) },
      data,
    });

    const content = {
      maPhim: result.ma_phim,
      tenPhim,
      trailer,
      hinhAnh: `${config.url}/${filename}`,
      moTa,
      ngayKhoiChieu: result.ngay_khoi_chieu,
      danhGia: result.danh_gia,
      hot: result.hot,
      sapChieu: result.sap_chieu,
      dangChieu: result.dang_chieu,
    };
    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const deleteFilm = async (req, res) => {
  try {
    const { maPhim } = req.query;
    const { tai_khoan } = req.user;

    if (!maPhim)
      return res.json(
        ResponseError(400, "Mã phim không hợp lệ.", "Mã phim không hợp lệ.")
      );

    const isUser = await model.NguoiDung.findFirst({ where: { tai_khoan } });
    if (!isUser)
      return res.json(
        ResponseError(
          400,
          "Người dùng không tồn tại",
          "Người dùng không tồn tại"
        )
      );

    const film = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });
    if (!film)
      return res.json(
        ResponseError(400, "Phim không tồn tại.", "Phim không tồn tại.")
      );

    await model.Phim.delete({ where: { ma_phim: Number(maPhim) } });

    return res.json(ResponseSuccess(200, "", "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getInfoFilm = async (req, res) => {
  try {
    const { maPhim } = req.query;

    if (!maPhim)
      return res.json(
        ResponseError(400, "Mã phim không hợp lệ.", "Mã phim không hợp lệ.")
      );

    const film = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
    });
    if (!film)
      return res.json(
        ResponseError(400, "Phim không tồn tại.", "Phim không tồn tại.")
      );

    const data = await model.Phim.findFirst({
      where: { ma_phim: Number(maPhim) },
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

    return res.json(ResponseSuccess(200, content, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = {
  addFilm,
  addBanner,
  getBannerList,
  getFilmList,
  getFilmListPagination,
  updateFilm,
  deleteFilm,
  getInfoFilm,
};
