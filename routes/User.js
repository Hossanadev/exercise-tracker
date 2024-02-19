const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

router.get("/", controller.getUser);
router.get("/:_id/logs", controller.getLogs);

router.post("/", controller.createUser);
router.post("/:_id/exercises", controller.createExercise);

module.exports = router;
