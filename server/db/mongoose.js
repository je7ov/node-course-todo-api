const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useMongoClient: true });

module.exports = {
  mongoose
};