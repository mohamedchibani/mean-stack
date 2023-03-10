const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    const createdUser = await user.save();

    res.status(201).json({ message: "User created!", result: createdUser });
  } catch (error) {
    res.status(500).json({
      message: "Invalid authentication credentials!",
    });
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }

    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "secret_this-should_be_longer",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: user._id,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid authentication credentials",
    });
  }
};
