const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
});

const ExerciseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  Exercise: mongoose.model("Exercise", ExerciseSchema),
};
