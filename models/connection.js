const mongoose = require("mongoose");
require("dotenv").config();
const connectionUrl = process.env.DBCONNECTION;

const connectToMongo = () => {
  mongoose
    .connect(connectionUrl)
    .then(() => {
      console.log("MongoDb connected Successfully ..!");
    })
    .catch((err) => {
      console.log("Error occured in database connection ...!", err);
    });
};

module.exports = connectToMongo;
