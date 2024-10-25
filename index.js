const express = require("express");
const cors = require("cors");
const connectToMongo = require("./models/connection");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

/* function call for mongoDb connection */
connectToMongo();

/*Middlewares  */
app.use(cors());
app.use(express.json());

/* Available Routes */
app.use("/api/auth/v1", require("./routes/auth"));

app.get("/", (req, res) => {
  res.send("Hello from Server");
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
