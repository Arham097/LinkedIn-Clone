const { MailtrapClient } = require('mailtrap');
const TOKEN = process.env.MAILTRAP_TOKEN;

exports.mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

exports.sender = {
  email: process.env.EMAIL_FROM,
  name: process.env.EMAIL_FROM_NAME
}