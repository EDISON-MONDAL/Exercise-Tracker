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

// template object instances
class exercises {
    constructor(description, duration, date) {  
      if (date) {
        this.date = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).replace(/,/g, '');
      } else {
        this.date = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '');
      }
      this.duration = parseInt(duration);
      this.description = description;
    }
}
// template object instances


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
      //const exercisesToPush = new exercises(description, duration, date);
      const exercisesToPush = { 
        description, 
        duration: parseInt(duration), 
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).replace(/,/g, '') 
        || new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '') }
        
      console.log(date);
      console.log(exercisesToPush);
      try {
        const foundUser = await users.findOneAndUpdate({ _id: userId }, { $push: { logs: exercisesToPush } }, { new: true });
        res.json({
          _id: foundUser._id,
          username: foundUser.username,
          date: exercisesToPush.date,
          duration: parseInt(exercisesToPush.duration),
          description: exercisesToPush.description,
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
      let temp = user.logs;
      
      if (from || to) {
        temp = temp.filter(entry => {
        const entryDate = new Date(entry.date);
        return (!from || entryDate >= new Date(from)) && (!to || entryDate <= new Date(to));
        });
      }
  
      if (limit) {
        temp = temp.slice(0, limit);
      }
      res.json({
        _id: user._id,
        username: user.username,
        count: temp.length,
        log: temp
      });
    } catch (err) {
      console.log(err)
    }
  
  })



module.exports = router;
