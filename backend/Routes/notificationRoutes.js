const express = require('express');
const authController = require('./../Controllers/authController');
const notificationController = require('./../Controllers/notificationController');

const notificationRouter = express.Router();

notificationRouter.route('/')
  .get(authController.protect, notificationController.getUserNotifications);

notificationRouter.route('/:id/read')
  .patch(authController.protect, notificationController.markNotificationAsRead);

notificationRouter.route('/:id')
  .delete(authController.protect, notificationController.deleteNotifications);

module.exports = notificationRouter;


