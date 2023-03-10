const express = require("express");

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const {
  createPost,
  updatePost,
  getPosts,
  getPost,
  deletePost,
} = require("../controllers/post");

const router = express.Router();

router.post("", checkAuth, extractFile, createPost);

router.put("/:id", checkAuth, extractFile, updatePost);

router.get("", getPosts);

router.get("/:id", getPost);

router.delete("/:id", checkAuth, deletePost);

module.exports = router;
