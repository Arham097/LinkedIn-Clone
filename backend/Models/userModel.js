const mongoose = require('mongoose');
const validator = require('validator')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"]
  },
  username: {
    type: String,
    required: [true, "Please Enter username"],
  },
  email: {
    type: String,
    required: [validator.isEmail, "Please  Enter Email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    select: false,
    minlength: 6,
  },
  profilePicture: {
    type: String,
    default: ""
  },
  bannerImg: {
    type: String,
    default: " "
  },
  headline: {
    type: String,
    default: "LinkedIn User"
  },
  location: {
    type: String,
    default: "Earth"
  },
  about: {
    type: String,
    default: ""
  },
  skills: [String],
  experience: [
    {
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String,
    }
  ],
  education: [
    {
      school: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
    }
  ],
  connections: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  }]

}, { timestamps: true })

const User = mongoose.Model('User', userSchema);

module.exports = User;