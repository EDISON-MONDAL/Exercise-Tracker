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
      //console.log(date);
  
      if (date) {
  
        const formatDate = new Date(date);
        const options = {
          weekday: 'short',  // Full name of the weekday (e.g., Monday)
          month: 'short',   // Abbreviated name of the month (e.g., Jan)
          day: '2-digit',   // Numeric day of the month (e.g., 1)
          year: 'numeric'   // Full year (e.g., 1990)
        };
        const formattedDate = formatDate.toLocaleDateString('en-US', options);
        this.date = formattedDate.replace(/,/g, '');
      } else {
        this.date = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '');
      }
      this.duration = parseInt(duration);
      this.description = description;
    }
}
// template object instances


//respond with all the users
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
      const exercisesToPush = new exercises(description, duration, date);
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
      let log = user.logs;
      /*
      if (from) {
        const fromDate = new Date(from)
        temp = temp.filter(exe => new Date(exe.date) > fromDate);
      }
  
      if (to) {
        const toDate = new Date(to)
        temp = temp.filter(exe => new Date(exe.date) < toDate);
      }*/

      if (from || to) {
        log = log.filter(exe => {
            const fromDate = new Date(from)
            const toDate = new Date(to)
            const exeDate = new Date(exe.date)
            
            return (!from || exeDate >= fromDate) && (!to || exeDate <= toDate);
        });
      }
  
      
  
      if (limit) {
        log = log.slice(0, limit);
      }

      
      res.json({
        _id: user._id,
        username: user.username,
        count: log.length,
        log: log
      });
    } catch (err) {
      console.log(err)
    }
  
  })



module.exports = router;
