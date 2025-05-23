// db.js
const mongoose = require('mongoose');
//const MONGO_URI = 'mongodb+srv://'+process.env.DB_USERNAME+':'+process.env.DB_PASSWORD+'@companymanagementsystem.setgwnn.mongodb.net/CompanyManagementSystem?retryWrites=true&w=majority';

const MONGO_URI = 'mongodb+srv://'+process.env.DB_USERNAME+':'+process.env.DB_PASSWORD+'@companymanagementsystem.b4cna.mongodb.net/CompanyManagementSystem?retryWrites=true&w=majority';
                   

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};



module.exports = connectDB;