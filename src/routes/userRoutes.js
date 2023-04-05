const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authentication");

userRoutes.get("/lay-danh-sach-loai-nguoi-dung", userController.getRoleUser);
userRoutes.post("/dang-ky", userController.register);
userRoutes.post("/dang-nhap", userController.login);
userRoutes.get("/lay-danh-sach-nguoi-dung", userController.getUser);
userRoutes.get(
  "/lay-danh-sach-nguoi-dung-phan-trang",
  userController.getUserPagination
);
userRoutes.get("/tim-kiem-nguoi-dung", userController.getUser);
userRoutes.get(
  "/tim-kiem-nguoi-dung-phan-trang",
  userController.getUserPagination
);

userRoutes.post(
  "/them-nguoi-dung",
  authenticate,
  authorize("QuanTri"),
  userController.addUser
);
userRoutes.get(
  "/thong-tin-tai-khoan",
  authenticate,
  userController.getInfoAccount
);
userRoutes.get(
  "/lay-thong-tin-nguoi-dung",
  authenticate,
  userController.getInfoUser
);
userRoutes.put(
  "/cap-nhat-thong-tin-nguoi-dung",
  authenticate,
  userController.updateInfoUser
);
userRoutes.put(
  "/cap-nhat-thong-tin-nguoi-dung-admin",
  authenticate,
  authorize("QuanTri"),
  userController.updateInfoUserAdmin
);
userRoutes.delete(
  "/xoa-nguoi-dung",
  authenticate,
  authorize("QuanTri"),
  userController.deleteUser
);

module.exports = userRoutes;
