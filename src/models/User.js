// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  monthlyEarning: Number,
  occupation: String,
  categories: [String],
  expenses: [
    {
      title: String,
      amount: Number,
      date: String,
      category: String,
    },
  ],
});

export default mongoose.models.User || mongoose.model('User', userSchema);
