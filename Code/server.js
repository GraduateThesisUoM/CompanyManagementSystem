if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.set('strictQuery',false)
const { MongoClient } = require('mongodb');

//Models
const User = require("./User");

const uri = 'mongodb+srv://'+process.env.DB_USER_NAME+':'+process.env.DB_USER_PASSWORD+'@companymanagementsystem.setgwnn.mongodb.net/CompanyManagementSystem?retryWrites=true&w=majority';

app.use(express.urlencoded({ extended: false }));

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', (req, res) => {
  res.render('index.ejs');
});

/*--------   LOG IN */
app.get('/log-in', (req, res) => {
  res.render('log_in.ejs');
});

/*--------   SING UP */
app.get('/sing-up', (req, res) => {
  res.render('sing_up.ejs');
});

app.post('/sing_up', async (req, res) => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    // Create a new user instance with the provided data
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      afm: req.body.afm,
      mydatakey: req.body.mydatakey,
      companyName: req.body.companyName,
      companyLogo: req.body.companyLogo
    });

    // Save the new user to the database
    await newUser.save();

    // Close the MongoDB connection when finished
    await mongoose.disconnect();

    res.redirect('/log_in');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    res.redirect('/sing_up?error');
  }
});


app.listen(3000, () => {
  console.log('App listening on port 3000');
});
