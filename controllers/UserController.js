const { User, Exercise } = require("../models/User");

module.exports = {
  createUser: async (req, res) => {
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
  },
  createExercise: async (req, res) => {
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
  },
  getUser: async (req, res) => {
    let users = await User.find();
    res.json(users);
  },
  getLogs: async (req, res) => {
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
    let exercise = await Exercise.find(filter).limit(
      limit ? parseInt(limit) : 0
    );
    if (!exercise) {
      return res.json({
        error: "No exercises found for this user",
      });
    }
    let log = exercise.map((ex) => {
      return {
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString("en-GB"),
      };
    });
    res.json({
      username: user.username,
      count: exercise.length,
      _id: user._id,
      log,
    });
  },
};
