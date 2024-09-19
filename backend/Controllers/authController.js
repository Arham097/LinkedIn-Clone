const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../Email/emailHandler');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/customError')
const bcrypt = require('bcryptjs');
const User = require('../Models/userModel');
const util = require('util')

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
    data: {
      user
    }
  })
}

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
  const profileUrl = process.env.CLIENT_URL + '/profile/' + newUser.username;
  try {
    await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
  }
  catch (err) {
    console.log("Error in sending Email", err);
  }
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

exports.protect = asyncErrorHandler(async (req, res, next) => {
  // Read the token & check if it is exist or not
  const token = req.cookies.jwt;
  if (!token) {
    const error = new CustomError("You are not logged in! Please Login to get access", 401);
    return next(error);
  }
  // Validate the token
  const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STRING);
  console.log(decodedToken);
  if (!decodedToken) {
    const error = new CustomError("Invalid Token! Unauthorized", 401);
  }

  // Check if the user is still exist in DB
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError('User with this token does not exist', 401);
    next(error);
  };

  // Check if user does not changed the password
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
  if (isPasswordChanged) {
    const error = new CustomError('Password has been changed recently, please  login again.', 401);
    next(error);
  }
  req.user = user;
  next();
})

exports.getCurrentUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  })
})