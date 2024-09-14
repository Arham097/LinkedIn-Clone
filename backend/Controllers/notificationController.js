const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const Notification = require('../Models/notificationModel');

exports.getUserNotifications = asyncErrorHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 })
    .population("relatedUser", "name username profilePicture")
    .population("relatedPost", "content image");

  if (!notifications) {
    const error = new Error("No notifications found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      notifications
    }
  })
})

exports.markNotificationAsRead = asyncErrorHandler(async (req, res, next) => {
  const notiificationId = req.params.id;
  const notification = await Notification.findByIdAndUpdate(
    { _id: notiificationId, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    const error = new Error("Notification not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      notification
    }
  })
});


exports.deleteNotifications = asyncErrorHandler(async (req, res, next) => {
  const notificationId = req.params.id;
  const notification = await Notification.findByIdAndDelete({ _id: notificationId, recipient: req.user._id });
  if (!notification) {
    const error = new Error("Notification not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null
  })
})