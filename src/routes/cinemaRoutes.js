const express = require("express");
const cinemaRoutes = express.Router();
const cinemaController = require("../controllers/cinemaController");
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

cinemaRoutes.post(
  "/them-he-thong-rap",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  cinemaController.addCinemaSystem
);
cinemaRoutes.get(
  "/lay-thong-tin-he-thong-rap",
  cinemaController.getListCinemaSystem
);
cinemaRoutes.post(
  "/them-cum-rap",
  authenticate,
  authorize("QuanTri"),
  cinemaController.addCinemaComplex
);
cinemaRoutes.post(
  "/them-rap-phim",
  authenticate,
  authorize("QuanTri"),
  cinemaController.addCinema
);
cinemaRoutes.get(
  "/lay-thong-tin-cum-rap-theo-he-thong",
  cinemaController.getCinemaComplexList
);
cinemaRoutes.get(
  "/lay-thong-tin-lich-chieu-phim",
  cinemaController.getInfoShowtime
);

module.exports = cinemaRoutes;
