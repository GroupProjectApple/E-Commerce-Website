require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OTPRoutes = require('./otpRoutes');
const GenericRoute = require('./CRUD');  // Import the generic POST route

const app = express();
const port = process.env.PORT || 5000;  // Port where the backend server will run

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(`mongodb+srv://groupprojectapple:SamarahaisGreat%402025@cluster0.8cy6o.mongodb.net/mydatabase?retryWrites=true&w=majority`, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/otp', OTPRoutes)// this sets the base URL for all otp service routes
app.use('/api', GenericRoute);  // This sets the base URL for all generic POST routes

// Start the Server
//console.log(process.env.GMAIL_USER);
//console.log(process.env.GMAIL_PASS);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
