// models/UserAward.js
const mongoose = require('mongoose');

const UserAwardSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  awardKey: { type: String, required: true, index: true },
  collectedAt: { type: Date, default: Date.now },
}, {
  indexes: [
    { fields: { userId: 1, awardKey: 1 }, options: { unique: true } }
  ]
});

module.exports = mongoose.model('UserAward', UserAwardSchema);
