const express = require("express");

const rootRouter = express.Router();

rootRouter.use("/quan-ly-nguoi-dung", require("./userRoutes"));
rootRouter.use("/quan-ly-rap", require("./cinemaRoutes"));
rootRouter.use("/quan-ly-phim", require("./filmRoutes"));
rootRouter.use("/quan-ly-dat-ve", require("./bookingRoutes"));

module.exports = rootRouter;
