if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

//Models
const User = require("./User");

const uri = 'mongodb+srv://'+process.env.DB_USER_NAME+':'+process.env.DB_USER_PASSWORD+'@companymanagementsystem.setgwnn.mongodb.net/?retryWrites=true&w=majority';

app.use(express.urlencoded({ extended: false }));

app.use(express.static('./public/css'));

/*--------   INDEX */
app.get('/', (req, res) => {
  res.render('index.ejs');
});

/*--------   LOG IN */
app.get('/log_in', (req, res) => {
  res.render('log_in.ejs');
});

/*--------   SING UP */
app.get('/sing_up', (req, res) => {
  res.render('sing_up.ejs');
});

app.post('/sing_up', async (req, res) => {
  try {
    // Connect to MongoDB Atlas
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the 'Users' collection within your database (replace 'your_db_name' with your actual database name)
    const db = client.db('CompanyManagementSystem');
    const collection = db.collection('Users');

    const newUser = new User({
      firstName: "ff"
    });

    // Save the new user to the database
    await newUser.save();

    // Close the MongoDB connection when finished
    client.close();

    res.redirect('/log_in');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    res.redirect('/sing_up?error');
  }
});


app.listen(3000, () => {
  console.log('App listening on port 3000');
});
