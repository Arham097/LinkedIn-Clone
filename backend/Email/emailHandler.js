const asyncErrorHandler = require('../Utils/asyncErrorHandler')
const { mailtrapClient, sender } = require('../Utils/email');
const { createWelcomeEmailTemplate } = require('./emailTemplates');

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