const express = require('express');
const authController = require('./../Controllers/authController')

const authRouter = express.Router();

authRouter.route('/signup')
  .post(authController.signup);

authRouter.route('/login')
  .post(authController.login)

authRouter.route('/logout')
  .post(authController.logout);

module.exports = authRouter;