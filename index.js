const express = require("express");
const app = express();
const courseRoute = require("./routes/course");
const paymentRoute = require("./routes/payment");
const profileRoute = require("./routes/profile");
const userRoute = require("./routes/auth");
const { cloudinaryConnect } = require("./config/cloudinary");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dbconnect = require("./config/database");
require("dotenv").config();
const PORT = process.env.PORT || 4000;

dbconnect();
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/payment", paymentRoute);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
