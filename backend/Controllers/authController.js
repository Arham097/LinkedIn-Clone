const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/customError')
const bcrypt = require('bcryptjs');

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
  })
}

exports.signup = async (req, res, next) => {
}
exports.login = async (req, res, next) => {
  console.log('asv');
}
exports.logout = async (req, res, next) => {
  console.log('logout')
}