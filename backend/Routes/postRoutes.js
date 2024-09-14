const express = require('express');
const authController = require('./../Controllers/authController');
const postController = require('./../Controllers/postController');

const postRouter = express.Router();

postRouter.route('/')
  .get(authController.protect, postController.getFeedPosts);

postRouter.route('/create')
  .post(authController.protect, postController.createPost);

postRouter.route('/delete/:id')
  .delete(authController.protect, postController.deletePost);

postRouter.route('/:id')
  .get(authController.protect, postController.getPostById);

postRouter.route('/:id/comment')
  .post(authController.protect, postController.createComment)

postRouter.route('/:id/like')
  .post(authController.protect, postController.likePost)

module.exports = postRouter;