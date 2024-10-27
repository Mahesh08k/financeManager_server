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

      /*Create a secure paasword using hash and salt for user
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
      console.log("error occured while creating user", err);
      res.status(500).send("Internal server error");
    }
  }
);

/*Route for validating login for user : api/auth/v1/login */
router.post(
  "/login",
  [
    body("email", "Enter valid Email").isEmail(),
    body("password", "Enter valid password").exists(),
  ],
  async (req, res) => {
    try {
      let success = false;
      /*get  data from request body */
      const { email, password } = req.body;
      /* If there are errors , return bad request and errors */
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      /*Check if given email user exits in database */
      user = await User.findOne({ email: email });
      if (!user) {
        success = false;
        return res
          .status(404)
          .json({ success, Error: "Please Enter valid credentials" });
      }
      /* If user exits with given mail id then check if password is correct 
           compare function takes string and hash as parameter
           it compares user provided password and password saved in database in hash format
        */
      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        success = false;
        return res
          .status(404)
          .json({ success, Error: "Please Enter Valid Credentials" });
      }
      /*If password is correct fetch user id to create jwt token*/
      const payload = {
        user: {
          id: user.id,
        },
      };
      /*return user jwt token as reward for valid credentials */
      const jwt_token = jwt.sign(payload, process.env.SECRETKEY);
      success = true;
      res
        .status(200)
        .json({ success, jwt_token, Message: `Welcome ${user.name}` });
    } catch (err) {
      console.log("error occured while logging in", err);
      res.status(500).send("Internal server error");
    }
  }
);

module.exports = router;
