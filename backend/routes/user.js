const express = require("express");
const { createUser, userLogin } = require("../controllers/user");

const router = express.Router();

router.post("/signup", createUser);

router.post("/login", userLogin);

module.exports = router;
