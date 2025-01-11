const mongoose = require('mongoose');

// Define OTP schema
const OTPSchema = new mongoose.Schema({
    identifier: { type: String, required: true }, // Email or phone number
    otp: { type: String, required: true }, // OTP value
    createdAt: { type: Date, default: Date.now, expires: '5m' }, // Auto-delete after 5 minutes
});

module.exports = mongoose.model('OTP', OTPSchema);
