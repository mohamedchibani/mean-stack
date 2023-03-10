const Post = require("../models/post");

exports.createPost = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const createdPost = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
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
};

exports.updatePost = async (req, res, next) => {
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

    const { matchedCount } = await Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    );

    if (matchedCount && matchedCount > 0) {
      res.status(200).json({ message: "Update successful!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Couldn't update post" });
  }
};

exports.getPosts = async (req, res, next) => {
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
};

exports.getPost = async (req, res, next) => {
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
};

exports.deletePost = async (req, res, next) => {
  try {
    const { matchedCount } = await Post.deleteOne({ _id: req.params.id });

    if (matchedCount && matchedCount > 0) {
      res.status(200).json({ message: "Post deleted!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Deleting post failed" });
  }
};
