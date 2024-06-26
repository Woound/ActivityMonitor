const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  vcJoinTime: {type: Date},
  strikes: { type: Number, default: 0 },
  lastCheckConfirmed: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', userSchema);
