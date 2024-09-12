const dotenv = require('dotenv');
dotenv.config({ path: './Config/config.env' });
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect('mongodb://127.0.0.1:27017/linkedin-clone')
  .then(() => {
    console.log("Database connect succesfully");
  })
  .catch(() => {
    console.log("Database does not connect succesfully")
  })
app.listen(process.env.PORT || 5000, () => {
  console.log("Server has started on localhost:3000")
})
