const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const ConnectionRequest = require("../Models/connectionRequestModel");
const User = require("../Models/userModel");
const Notification = require("../Models/notificationModel");

exports.sendConnectionRequest = asyncErrorHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const { userId } = req.params;

  if (senderId.toString() === userId) {
    const error = new customError("You cannot send a connection request to yourself", 400);
    return next(error);
  }
  if (req.user.connection.includes(userId)) {
    const error = new customError("You are already connected with this user", 400);
    return next(error);
  }
  const existingRequest = await ConnectionRequest.findOne({
    sender: senderId,
    recipient: userId,
    status: "pending",
  });
  if (existingRequest) {
    const error = new customError("Connection request already sent", 400);
    return next(error);
  }

  const newRequest = new ConnectionRequest({
    sender: senderId,
    recipient: userId,
  });

  await newRequest.save();

  res.status(201).json({
    status: "success",
    message: "Connection request sent",
  });
});

exports.acceptConnectionRequest = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { requestId } = req.params;

  const request = await ConnectionRequest.findById(requestId)
    .populate("sender", "name email username")
    .populate("recipient", "name username");

  if (!request) {
    const error = new customError("Connection request not found", 404);
    return next(error);
  }
  // Check if the recipient is the current user
  if (request.recipient._id.toString() !== userId) {
    const error = new customError("You are not authorized to accept this request", 403);
    return next(error);
  }
  if (request.status !== "pending") {
    const error = new customError("Connection request already processed", 400);
    return next(error);
  }

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(request.sender._id, { $addToSet: { connection: request.recipient._id } });
  await User.findByIdAndUpdate(userId, { $addToSet: { connection: request.sender._id } });

  const notification = new Notification({
    recipient: request.sender._id,
    type: "connectionAccepted",
    relatedUser: userId,
  });
  await notification.save();

  res.status(200).json({
    status: "success",
    message: "Connection request accepted",
  });

  //send email
  const senderEmail = request.sender.email;
  const senderName = request.sender.name;
  const recipientEmail = request.recipient.email;
  const profileUrl = process.env.CLIENT_URL + "/profile/" + userId;

  try {
    await sendConnectionAcceptedEmail(senderEmail, senderName, recipientEmail, profileUrl);
  }
  catch (error) {
    console.log("Error in acceptConnectionRequest controller", error);
  }

});

exports.rejectConnectionRequest = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { requestId } = req.params;

  const request = await ConnectionRequest.findById(requestId);

  if (!request) {
    const error = new customError("Connection request not found", 404);
    return next(error);
  }
  // Check if the recipient is the current user
  if (request.recipient.toString() !== userId) {
    const error = new customError("You are not authorized to reject this request", 403);
    return next(error);
  }

  if (request.status !== "pending") {
    const error = new customError("Connection request already processed", 400);
    return next(error);
  }

  request.status = "rejected";
  await request.save();

  res.status(200).json({
    status: "success",
    message: "Connection request rejected",
  });
});
exports.getConnectionRequests = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const requests = await ConnectionRequest.find({ recipient: userId, status: "pending" })
    .populate("sender", "name username profilePicture headline connections");
  if (!requests) {
    return res.status(200).json({
      status: "success",
      data: {
        requests: [],
      }
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      requests,
    }
  });
});
exports.getUserConnections = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
    .populate("connection", "name username profilePicture headline connections");
  if (!user.connection) {
    return res.status(200).json({
      status: "success",
      data: {
        connections: [],
      }
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      connections: user.connection,
    }
  });
});
exports.removeConnection = asyncErrorHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const myId = req.user._id;

  await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

  res.status(200).json({
    status: "success",
    message: "Connection removed",
  });
});
exports.getConnectionStatus = asyncErrorHandler(async (req, res, next) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user._id;

  const currentUser = req.user;
  if (currentUser.connection.includes(targetUserId)) {
    return res.status(200).json({
      status: "success",
      data: {
        status: "connected",
      }
    });
  }

  const pendingRequest = await ConnectionRequest.findOne({
    $or: [
      { sender: currentUserId, recipient: targetUserId },
      { sender: targetUserId, recipient: currentUserId },
    ],
    status: "pending",
  });

  if (pendingRequest) {
    if (pendingRequest.sender.toString() === currentUserId.toString()) {
      return res.status(200).json({
        status: "success",
        data: {
          status: "pending",
        }
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: {
          status: "received",
          requestId: pendingRequest._id,
        }
      });
    }
  }
  res.status(200).json({
    status: "success",
    data: {
      status: "not_Connected",
    }
  });
});

