const express = require("express");
const filmRoutes = express.Router();
const filmController = require("../controllers/filmController");
const { authenticate, authorize } = require("../middlewares/authentication");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.cwd()}/public/images`);
  },
  filename: (req, file, cb) => {
    const d = new Date();
    const newName = d.getTime() + "_" + file.originalname;
    cb(null, newName);
  },
});
const upload = multer({ storage });

filmRoutes.post(
  "/them-phim",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  filmController.addFilm
);
filmRoutes.put(
  "/cap-nhat-phim",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  filmController.updateFilm
);
filmRoutes.post(
  "/them-banner",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  filmController.addBanner
);
filmRoutes.get("/lay-danh-sach-banner", filmController.getBannerList);
filmRoutes.get("/lay-danh-sach-phim", filmController.getFilmList);
filmRoutes.get(
  "/lay-danh-sach-phim-phan-trang",
  filmController.getFilmListPagination
);
filmRoutes.delete(
  "/xoa-phim",
  authenticate,
  authorize("QuanTri"),
  filmController.deleteFilm
);
filmRoutes.get("/lay-thong-tin-phim", filmController.getInfoFilm);

module.exports = filmRoutes;
