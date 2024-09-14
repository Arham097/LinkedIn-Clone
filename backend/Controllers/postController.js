const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const Post = require("../Models/postModel");
const Notification = require('../Models/notificationModel')
const cloudinary = require("../Utils/cloudinary");
const { sendCommentNotificationEmail } = require("../Email/emailHandler");

exports.getFeedPosts = asyncErrorHandler(async (req, res, next) => {
  const posts = await Post.find({ author: { $in: req.user.connections } })
    .populate("author", "name username profilePicture headline")
    .populate("comments.user", "name profilePicture")
    .sort({ createdAt: -1 });

  if (!posts) {
    const error = new customError("No posts found", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      posts
    }
  });
});

exports.createPost = asyncErrorHandler(async (req, res, next) => {
  const { content, image } = req.body;
  let newPost;
  if (image) {
    const imgResult = await cloudinary.uploader.upload(image);
    newPost = new Post({
      author: req.user._id,
      content,
      image: imgResult.secure_url
    })
  } else {
    newPost = new Post({
      author: req.user._id,
      content
    })
  };
  await newPost.save();

  res.status(201).json({
    status: "success",
    data: {
      newPost
    }
  });
});

exports.deletePost = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const post = await Post.findById(postId);
  if (!post) {
    const error = new customError("Post not found", 404);
    return next(error);
  }
  if (post.author.toString() !== userId.toString()) {
    const error = new customError("You are not authorized to delete this post", 403);
    return next(error);
  }
  if (post.image) {
    const imageId = post.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imageId);
  }
  await Post.findByIdAndDelete(postId);

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.getPostById = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const post = Post.findById(postId)
    .populate("author", "name username profilePicture headline")
    .populate("comments.user", "name profilePictutre username headline");
  if (!post) {
    const error = new customError("Post not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  })
})

exports.createComment = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const { content } = req.body;
  const post = Post.findByIdAndUpdate(postId,
    {
      $push: { comments: { user: req.user._id, content } }
    },
    { new: true }
  ).populate("author", "name email username headline profilePicture");

  //create notification if the comment owner is not the post owner
  if (post.author.toString() !== req.user._id.toString()) {
    const newNotification = new Notification({
      recipient: post.author,
      type: 'comment',
      relatedUser: req.user._id,
      relatedPost: postId
    })
    await newNotification.save();
    //send email
    try {
      const postUrl = process.env.CLIENT_URL + "/post" + postId;
      await sendCommentNotificationEmail(post.author.email, post.author.name, req.user.name, content, postUrl);
    }
    catch (err) {
      console.log("Error in sending comment notification Email", err);
    }

  }
  res.status(200).json({
    status: "success",
    data: {
      post
    }
  })
});

exports.likePost = asyncErrorHandler(async (req, res, next) => {
  const postId = req.params.id;
  const post = Post.findById(postId);
  const userId = req.user._id;

  // if user want to dislike is Id is already present in post likes
  if (post.likes.include(userId)) {
    post.likes = post.likes.filter(id => id.toString() !== userId.toString())
  }
  else {
    // user want to like the post means is Id is previously not availaible in post likes
    post.likes.push(userId);
    // create a notification if the post owner is not the user who liked
    if (post.author.toString() !== userId.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: 'like',
        relatedUser: userId,
        relatedPost: postId,
      });
      await newNotification.save();
    }
  }
  res.status(200).json({
    status: "success",
    data: {
      post
    }
  });
})