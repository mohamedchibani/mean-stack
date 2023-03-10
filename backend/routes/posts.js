const express = require("express");
const Post = require("../models/post");
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPR_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPR_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPR_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const createdPost = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
    });

    try {
      await createdPost.save();

      res.status(201).json({
        post: {
          ...createdPost,
          id: createdPost._id,
        },
        message: "Post added successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Creating a post failed!",
      });
    }
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      let imagePath = req.body.imagePath;

      if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
      }
      const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
      });
      const { modifiedCount } = await Post.updateOne(
        { _id: req.params.id },
        post
      );

      if (modifiedCount && modifiedCount > 0) {
        res.status(200).json({ message: "Update successful" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Couldn't update post" });
    }
  }
);

router.get("", async (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;

  let posts = [];

  try {
    if (pageSize && currentPage) {
      posts = await Post.find()
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
    } else {
      posts = await Post.find();
    }

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: posts,
      maxPosts: posts.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fetching posts failed!",
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "fetching post failed!" });
  }
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  try {
    await Post.deleteOne({ _id: req.params.id });

    if (matchedCount && matchedCount > 0) {
      res.status(200).json({ message: "Post deleted!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Deleting post failed" });
  }
});

module.exports = router;
