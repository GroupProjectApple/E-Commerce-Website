const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  recommendation: [
    {
      name: { type: String },
      _id: { type: mongoose.Schema.Types.ObjectId },
      rating: { type: Number },
      similarity: { type: Number },
      img: { type: String }
    }
  ],
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

// Create the User model from the schema
const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
