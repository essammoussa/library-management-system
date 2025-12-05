const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

// Build the DB connection string, URL-encoding the password to avoid auth issues
const DB = `mongodb+srv://karimsoliman540_db_user:0KkvA5HbnSEiVxYr@cluster0.2b4zp3y.mongodb.net/?appName=Cluster0`;

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB is connected SUCCESSFULLY');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB.');
    console.error(err);
    process.exit(1);
  });

const port = 8080; // port number
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
