const express = require("express");
const bookingRoutes = express.Router();
const bookingController = require("../controllers/bookingController");
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

bookingRoutes.post(
  "/tao-lich-chieu",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  bookingController.addShowtime
);
bookingRoutes.post("/dat-ve", authenticate, bookingController.bookingTicket);
bookingRoutes.post(
  "/them-ghe",
  authenticate,
  authorize("QuanTri"),
  bookingController.addSeat
);
bookingRoutes.get(
  "/lay-danh-sach-phong-ve",
  bookingController.getListTicketRoom
);

module.exports = bookingRoutes;
