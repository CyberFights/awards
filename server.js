// server.js
const express = require('express');
const mongoose = require('mongoose');
const awardsRouter = require('./routes/awards');

const app = express();

app.use(express.json());
app.use('/api', awardsRouter);

// Use env variable
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Missing MONGO_URI in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Mongo connected');
  app.listen(process.env.PORT || 3000, () => {
    console.log('API running');
  });
});
