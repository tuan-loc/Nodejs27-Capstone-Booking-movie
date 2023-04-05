const express = require("express");
const rootRoute = require("./routes/rootRoute");
const cors = require("cors");
const { responseInterceptor } = require("./middlewares/interceptors");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(express.static("."));
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(responseInterceptor);
app.use("/api", rootRoute);

app.listen(8080, () => {
  console.log("This app listening on port 8080");
});
