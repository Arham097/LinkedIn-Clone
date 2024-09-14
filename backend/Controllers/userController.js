const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require("../Models/userModel");
const customError = require("../Utils/customError");
const cloudinary = require("./../Utils/cloudinary");

exports.getSuggestedUsers = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("connections");
  const suggestedUsers = await User.find({
    _id: {
      $ne: req.user._id,
      $nin: user.connections
    }
  }).select("name username profilePicture headline").limit(3);
  res.status(200).json({
    status: "success",
    data: {
      suggestedUsers
    }
  });
})

exports.getPublicProfile = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({
    username: req.params.username
  })
  if (!user) {
    const error = new customError("User not found", 404);
  }
  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
})

exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
  const allowedFields = ["name", "username", "headline", "about", "location", "profilePicture", "bannerImg", "skills", "experience", "education"];

  const updatedData = {};
  for (let field of allowedFields) {
    if (req.body[field]) {
      updatedData[field] = req.body[field];
    }
  }

  if (req.body.profilePicture) {
    const result = await cloudinary.uploader.upload(req.body.profilePicture)
    uploadedData.profilePicture = result.secure_url;
  }
  if (req.body.bannerImg) {
    const result = await cloudinary.uploader.upload(req.body.bannerImg)
    uploadedData.bannerImg = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
}) 