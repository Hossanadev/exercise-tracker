const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// set up middleware
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// connect to database
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// set up schema
let UserSchema = new mongoose.Schema({
  username: String,
});

let ExerciseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});

// set up model
let User = mongoose.model("user", UserSchema);
let Exercise = mongoose.model("exercise", ExerciseSchema);

// set up routes
app.post("/api/users", async (req, res) => {
  let { username } = req.body;
  let newUser = new User({
    username,
  });
  try {
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.json({
        error: "Username already exists",
      });
    } else {
      return res.json({
        error: error.message,
      });
    }
  }
});

app.get("/api/users", async (req, res) => {
  let users = await User.find();
  res.json(users);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let { description, duration, date } = req.body;
  if (!date) {
    date = new Date().toDateString();
  }
  let newExercise = new Exercise({
    user_id: req.params._id,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  });
  try {
    await newExercise.save();
    let user = await User.findById(req.params._id);
    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: new Date(newExercise.date).toDateString(),
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  let { from, to, limit } = req.query;
  let dateQuery = {};
  if (from) {
    dateQuery["$gte"] = new Date(from);
  }
  if (to) {
    dateQuery["$lte"] = new Date(to);
  }
  let filter = {
    user_id: req.params._id,
  };
  if (from || to) {
    filter.date = dateQuery;
  }
  let user = await User.findById(req.params._id);
  if (!user) {
    return res.json({
      error: "User not found",
    });
  }
  let exercise = await Exercise.find(filter).limit(limit ? parseInt(limit) : 0);
  if (!exercise) {
    return res.json({
      error: "No exercises found for this user",
    });
  }
  let exercises = [];
  for (let element of exercise) {
    exercises.push({
      description: element.description,
      duration: element.duration,
      date: element.date.toDateString(),
    });
  }
  res.json({
    username: user.username,
    count: exercise.length,
    _id: user._id,
    log: exercises,
  });
});

// port listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Hossanadev
