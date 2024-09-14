const asyncErrorHandler = require('../Utils/asyncErrorHandler')
const { mailtrapClient, sender } = require('../Utils/email');
const { createWelcomeEmailTemplate, createCommentNotificationEmailTemplate } = require('./emailTemplates');

exports.sendWelcomeEmail = asyncErrorHandler(async (email, name, profileUrl) => {
  const recipient = [{ email }]
  const response = await mailtrapClient.send({
    from: sender,
    to: recipient,
    subject: "Welcome to Unlinked",
    html: createWelcomeEmailTemplate(name, profileUrl),
    category: "welcome"
  })
  console.log("welcome email sent successfully ", response);
})

exports.sendCommentNotificationEmail = asyncErrorHandler(async (
  recipientEmail,
  recipientName,
  commenterName,
  postUrl,
  commentContent
) => {
  const recipient = [{ email }];

  const response = await mailtrapClient.send({
    from: sender,
    to: recipient,
    subject: "New Comment on Your Post",
    html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
    category: 'comment_notification'
  })
  console.log(response);
})