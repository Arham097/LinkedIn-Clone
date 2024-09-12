const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/customError')
const bcrypt = require('bcryptjs');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const User = require('../Models/userModel');

const signupToken = id => {
  return jwt.sign({ id }, process.env.SECRET_STRING, {
    expiresIn: Number(process.env.LOGIN_EXPIRES)
  })
}
const createSendToken = (user, statusCode, res) => {
  const token = signupToken(user._id);
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: process.env.LOGIN_EXPIRES,
    secure: process.env.NODE_ENV === "production"
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
})
exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new CustomError("Please Provide Email and Password", 400);
    return next(error);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || ! await (user.comparePassword(password, user.password))) {
    const error = new CustomError("Incorrect Email or Password", 401);
    return next(error);
  }
  createSendToken(user, 200, res);
})
exports.logout = async (req, res, next) => {
  res.clearCookie('jwt');
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  })
}