const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://testuser:testuser@companymanagementsystem.setgwnn.mongodb.net/?retryWrites=true&w=majority';

app.use(express.urlencoded({ extended: false }));

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
    console.log(req.body.firstname);

    // Connect to MongoDB Atlas
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the 'hhh' collection within your database (replace 'your_db_name' with your actual database name)
    const db = client.db('CompanyManagementSystem');
    const collection = db.collection('hhh');

    // Ensure the 'hhh' collection exists; create it if it doesn't
    await collection.createIndex({ someField: 1 }); // You can use any field you like for indexing, or leave it empty
    console.log("Connected successfully to server and accessed 'hhh' collection.");

    // You can perform additional operations with the 'collection' object here if needed

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
