const { Schema, model } = require('mongoose');
const formatDate = require('../utils/utils');

const UserSchema = new Schema({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  registrationDate: { type: String, default: formatDate(new Date()) },
  lastLoginDate: { type: String, default: formatDate(new Date()) },
  status: { type: String, default: 'Inactive' },
})

module.exports = model('User', UserSchema);