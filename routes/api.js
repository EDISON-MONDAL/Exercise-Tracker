// Import necessary modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// db structure
  const userSchema = new mongoose.Schema({
    username: String,
    logs: { type: Array, default: [] }
  })
  const users = mongoose.model("users", userSchema);
// db structure


//get all the users
router.get("/users", async (req, res) => {
    const allUsers = await users.find();
    res.json(allUsers.map(({ username, _id }) => ({ username, _id })));
});

//create user
router.post("/users", async (req, res) => {
    const name = req.body.username;
    const foundUser = await users.findOne({ username: name });
    if (!foundUser) {
      const user = await users.create({ username: name });
      res.json({
        username: user.username,
        _id: user._id
      })
    } else {
      res.json({
        username: foundUser.username,
        _id: foundUser._id
      })
    }
})

//add exercise
router.post("/users/:_id/exercises", async (req, res) => {
    const userId = req.params._id;
    const { duration, date, description } = req.body;
    if (!duration || !description) {
      res.json({
        error: "invalid input"
      })
    } else {
      
      let getDate = ''

      if (date) {
        getDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).replace(/,/g, '');
      } else {
        getDate = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '');
      }

      const exercisesUpload = { 
        description, 
        duration: parseInt(duration), 
        date: getDate
      }
      
     
      try {
        const foundUser = await users.findOneAndUpdate({ _id: userId }, { $push: { logs: exercisesUpload } }, { new: true });
        res.json({
          _id: foundUser._id,
          username: foundUser.username,
          date: exercisesUpload.date,
          duration: parseInt(exercisesUpload.duration),
          description: exercisesUpload.description,
        });
      } catch (err) {
        console.log(err);
      }
    }
  
})
  //get logs of a user
  router.get("/users/:_id/logs", async (req, res) => {
    try {
      const user = await users.findOne({ _id: req.params._id });
      const { from, to, limit } = req.query;
      
      let logArr = user.logs;
      
      if (from || to) {
        logArr = logArr.filter(entry => {
        const entryDate = new Date(entry.date);
        return (!from || entryDate >= new Date(from)) && (!to || entryDate <= new Date(to));
        });
      }
  
      if (limit) {
        logArr = logArr.slice(0, limit);
      }
      res.json({
        _id: user._id,
        username: user.username,
        count: logArr.length,
        log: logArr
      });
    } catch (err) {
      console.log(err)
    }
  
  })



module.exports = router;
