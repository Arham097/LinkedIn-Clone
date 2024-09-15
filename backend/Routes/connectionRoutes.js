const express = require('express');
const authController = require('./../Controllers/authController');
const connectionController = require('../Controllers/connectionController');

const connectionRouter = express.Router();

connectionRouter.route('/request/:userId')
  .post(authController.protect, connectionController.sendConnectionRequest);

connectionRouter.route('/accept/:requestId')
  .patch(authController.protect, connectionController.acceptConnectionRequest);

connectionRouter.route('/reject/:requestId')
  .patch(authController.protect, connectionController.rejectConnectionRequest);

connectionRouter.route('/requests')
  .get(authController.protect, connectionController.getConnectionRequests)

connectionRouter.route('/')
  .get(authController.protect, connectionController.getUserConnections)
connectionRouter.route('/:userId')
  .delete(authController.protect, connectionController.removeConnection);
connectionRouter.route('/status/:userId')
  .get(authController.protect, connectionController.getConnectionStatus)

module.exports = connectionRouter;