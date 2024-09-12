const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    required: [true, "Please Enter Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Enter Valid Email"]
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
})

userSchema.methods.comparePassword = async function (password, passwordDB) {
  return (await bcrypt.compare(password, passwordDB));
}

const User = mongoose.model('User', userSchema);

module.exports = User;
