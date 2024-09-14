const express = require('express');
const authController = require('./../Controllers/authController');
const userController = require('./../Controllers/userController');
const userRouter = express.Router();

userRouter.route('/suggestions')
  .get(authController.protect, userController.getSuggestedUsers);

userRouter.route('/:username')
  .get(authController.protect, userController.getPublicProfile);

userRouter.route('/profile')
  .patch(authController.protect, userController.updateProfile);

module.exports = userRouter;