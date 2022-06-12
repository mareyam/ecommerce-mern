const express = require("express");
let router = express.Router();
let { User } = require("../../models/user");
var bcrypt = require("bcryptjs");  //password encryptuon
// const _ = require("lodash");
const jwt = require("jsonwebtoken"); //share security information between back and front end
const config = require("config");  //config files for deploymenet

router.post("/register", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if(!req.body.email && !req.body.name && !req.body.password) return res.status(400).send("enter valid details");
  if(!req.body.email) return res.status(400).send("enter valid email");
  if(!req.body.name) return res.status(400).send("enter valid name");
  if(!req.body.password) return res.status(400).send("enter valid password");
  

  if (user) return res.status(400).send("User with given Email already exist");
  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  // let salt = await bcrypt.genSalt(10);
  // user.password = await bcrypt.hash(user.password, salt);
  await user.generateHashedPassword();
  await user.save();
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );

  let datatoReturn = {
    name: user.name,
    email: user.email,
    token: user.token,
  };
  return res.send(datatoReturn);


  // return res.send(_.pick(user,["name","email"]));
 
});
router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if(!req.body.email && !req.body.password) return res.status(400).send("enter valid details");
  if(!req.body.email) return res.status(400).send("enter valid email");
  if(!req.body.password) return res.status(400).send("enter valid password");

  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );
  res.send(token);
});

router.get("/", async (req, res) => {
  let user = await User.find();
  return res.send(user);
});

router.delete("/:id", async (req, res) => {
  let user = await User.findByIdAndDelete(req.params.id);
  return res.send(user);
});

module.exports = router;