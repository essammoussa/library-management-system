const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE || 'mongodb+srv://essammoussamahmoud1_db_user:itudg1TFUvN4atCo@cluster0.xgosckm.mongodb.net/library?retryWrites=true&w=majority&appName=Cluster0';

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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
