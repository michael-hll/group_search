const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    try {
      client.connect();
      dbConnection = client.db('groups');
      callback();
    } catch (error) {
      callback(error)
    }
  },

  getDb: function () {
    return dbConnection;
  },
};