const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Server");
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
