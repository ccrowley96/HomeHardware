const express = require('express');
const router = express.Router();
const room = require('./room');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const {generateSecret} = require('./utils');
const { Employee } = require('../db/db_index');
const {validateAdmin} = require('./middleware');

// Connect to Mongo DB
if(process.env.NODE_ENV === 'dev') mongoose.connect(process.env.MONGO_CONNECT_DEV, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
else mongoose.connect(process.env.MONGO_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;
//Check connection
db.once('open', () =>{
  console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error', (err) => {
  console.log("Database Error!");
  console.log(err);
});

//API welcome Message
router.get('/', (req, res, next) => {
    res.send('Welcome to the List App API');
});

//Verify Admin Password
router.post('/verifyAdmin', (req,res, next) => {
  let password = req.body.password;
    
  if(!req.body.password){
      res.status(400);
      res.send('Incorrect request body (see password)');
      return;
  }

  if(req.body.password !== process.env.ADMIN_PASSWORD){
      res.status(401);
      res.send('Password incorrect.');
      return;
  }
  res.status(200);
  res.json({
    title: 'Admin',
    secret: process.env.CLIENT_SECRET
  })
});

//Verify Employee Password
router.post('/verifyEmployee', async (req,res, next) => {    
  if(!req.body.password){
      res.status(400);
      res.send('Incorrect request body (see password)');
      return;
  }

  let employee = await Employee.findOne({});
  let employeePassword = employee.password;
  let employeeSecret = employee.secret;

  if(req.body.password === process.env.ADMIN_PASSWORD || req.body.password === employeePassword){
    res.status(200);
    res.json({
      title: 'Employee',
      secret: employeeSecret
    })
    return;
  } 
  res.status(401);
  res.send('Password incorrect.');
});

// Change Employee password
router.post('/changeEmployeePassword', validateAdmin, async (req,res,next) => {
  let password = req.body.password;

  if(!password){
    res.status(400);
    res.send('Incorrect request body (see password)');
    return;
  }

  // Update employee password in DB
  await Employee.updateOne({}, {
    "$set": {"password" : password, "secret": generateSecret()}
  });
  res.sendStatus(200);
});

// View Employee password
router.get('/viewEmployeePassword', validateAdmin, async (req, res, next) => {
  let employee = await Employee.findOne({});
  let employeePassword = employee.password;
  let required = employee.passwordRequired;
  res.status(200);

  res.json({
    title: 'EmployeePassword',
    password: employeePassword,
    required: required
  })
});

// See if employee password required
router.get('/isEmployeePasswordRequired', async (req, res, next) => {
  let employee = await Employee.findOne({});
  let required = employee.passwordRequired;
  res.status(200);
  res.json({
    title: 'IsEmployeePasswordRequired',
    required
  })
})

router.post('/setEmployeePasswordRequired', validateAdmin, async (req, res, next) => {
  let required = req.body.required;
  if(required === null || typeof required !== 'boolean'){
    res.status(400);
    res.send('Incorrect request body (see required (bool))');
    return;
  }

  // Update employee password in DB
  await Employee.updateOne({}, {
    "$set": {"passwordRequired" : required}
  })
  res.sendStatus(200);
});

//API room routing
router.use('/room', room);

module.exports = router;

