const express = require("express");
const router = express.Router();
const User = require("../models/user");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { body, validationResult } = require("express-validator");

/*Route for createing new user : api/auth/v1/createUser */

router.post(
  "/createUser",
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "Enter valid Email").isEmail(),
    body("password", "Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    try {
      /*if there is any error in body validation throw bad request error */
      if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, errors: errors.array() });
      }

      /*get all data from request body */
      const { name, email, password, date } = req.body;

      /* first check if user with given mail id already exits */
      let user = await User.findOne({ email: email });
      if (user) {
        success = false;
        res.status(400).json({
          success,
          message: "Sorry User with this Email ID already exits ..!",
        });
      }

      /*Create a secur paasowrd using hash and salt for user
        genSalt and hash both are async functions so need to use await before them to get result otherwise we will get error
    */
      const salt = await bcrypt.genSalt(10);
      let securePassword = await bcrypt.hash(password, salt);

      /*create new user in database using create query */
      user = await User.create({
        name: name,
        email: email,
        password: securePassword,
        date: date,
      });

      /* we will create jwt token using id of newly created user */
      const data = {
        user: {
          id: user.id,
        },
      };

      /*Sign jwt token using secret key */
      const auth_token = jwt.sign(data, process.env.SECRETKEY);

      success = true;
      res.status(201).json({
        success,
        message: "user added successfully ...",
        auth_token,
      });
    } catch (error) {
      console.log("Internal Server Error", error);
    }
  }
);

module.exports = router;
