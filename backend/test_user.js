const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne();
  console.log('TEST_USER_ID=' + user._id.toString());
  process.exit(0);
});
