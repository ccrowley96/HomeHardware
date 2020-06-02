const express = require('express');
const router = express.Router();
const room = require('./room');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

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

//API room routing
router.use('/room', room);

module.exports = router;

