const express = require("express");
const app = express();
const cors = require("cors");
const dbConnection = require("./db/db");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
  dbConnection();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const userRoute = require("./routes/User");
app.use("/api/users", userRoute);

// Hossanadev
