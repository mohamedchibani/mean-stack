const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
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
      creator: req.userData.userId,
    });

    await createdPost.save();

    res.status(201).json({
      post: {
        ...createdPost,
        id: createdPost._id,
      },
      message: "Post added successfully",
    });
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
        creator: req.userData.userId,
      });

      const { modifiedCount } = await Post.updateOne(
        { _id: req.params.id, creator: req.userData.userId },
        post
      );

      if (modifiedCount && modifiedCount > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error while updating a post" });
    }
  }
);

router.get("", async (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;

  let posts = [];
  let count = null;

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
      message: "Server error while fetching posts",
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
    res.status(500).json({ message: "Server error while fetching a post" });
  }
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  try {
    const { matchedCount } = await Post.deleteOne({ _id: req.params.id });
    if (matchedCount && matchedCount > 0) {
      res.status(200).json({ message: "Deletion successful!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting post" });
  }
});

module.exports = router;
