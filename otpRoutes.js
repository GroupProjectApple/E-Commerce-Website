const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const OTPModel = require('./models/OTPModel'); // Import OTP model

const router = express.Router();

// Configure nodemailer for sending OTP via email
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // Your Gmail password or app password
    },
});

// Function to send OTP via email
const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL_USER, // Sender email (GMAIL_USER from .env)
        to: email,                    // Recipient email
        subject: 'Your OTP Code',      // Subject line
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,   // OTP message body
    };

    try {
        // Send the email with OTP
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
        console.error(`Error sending OTP to ${email}: ${error}`);
        throw error;  // Rethrow the error to be caught in the calling function
    }
};

// Route to test OTP sending functionality
router.get('/test-otp', async (req, res) => {
    const testEmail = "panjasamaraha@gmail.com";  // Replace with any email for testing
    const otp = Math.floor(100000 + Math.random() * 900000);  // Simple OTP generation

    // Log OTP for testing
    console.log(`Test OTP sent to ${testEmail}: ${otp}`);

    try {
        // Call the sendOTP function to send the OTP to the test email
        await sendOTP(testEmail, otp);
        res.status(200).json({ message: 'Test OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending OTP', error: err });
    }
});

// Send OTP route (for registration/login)
router.post('/send-otp', async (req, res) => {
    const { identifier } = req.body; // identifier can be email or phone number

    if (!identifier) {
        return res.status(400).json({ message: "Identifier (email/phone) is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    try {
        // Save OTP in database
        await OTPModel.create({ identifier, otp, createdAt: new Date() });

        // Send OTP via email (or phone, depending on your logic)
        await sendOTP(identifier, otp); // Send OTP using the sendOTP function

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
        return res.status(400).json({ message: "Identifier and OTP are required" });
    }

    try {
        // Find OTP record in the database
        const record = await OTPModel.findOne({ identifier });

        if (!record || record.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Delete OTP after successful verification
        await OTPModel.deleteOne({ identifier });

        // Generate a token (optional, if you want to use JWT)
        const token = jwt.sign({ identifier }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "OTP verified successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
});

module.exports = router;
