// Import necessary modules
const express = require('express');
const router = express.Router();
const uuid = require('uuid');


// Sample data storage (replace with a database in production)
const users = [];
let exerciseLogs = {};

// POST /api/users to create a new user
router.post('/users', (req, res) => {
  const { username } = req.body;
  const newUserId = uuid.v4(); // Generates a random UUID in hexadecimal format
  const newUser = { username, _id: newUserId };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users to get a list of all users
router.get('/users', (req, res) => {

  res.json(users);
  
});

// POST /api/users/:_id/exercises to add a new exercise for a user
router.post('/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // Create an exercise log entry
  const logEntry = { description, duration: parseInt(duration), date: date || new Date().toDateString() };


  let found = false;
  let username = ''
  let index = 0

  for (let i = 0; i < users.length; i++) {
    if (users[i]['_id'] === _id ) {
        found = true;
        index = i
        username = users[i]['username']
        break;
    }
  }
  
  
  
  if(found){
    // count
    if(!users[index]['count']){
        users[index]['count'] = 0
    }
    // log array
    if(!users[index]['log']){
        users[index]['log'] = []
    }

    users[index]['log'].push(logEntry);
    users[index]['count']++
  }
  
  //console.warn( users[index] )
  
  const lastLog = users[index]['log'][ users[index]['log'].length - 1]
  res.json({ username: users[index]['username'], description: lastLog['description'] });
  
});


// GET /api/users/:_id/logs to retrieve a user's exercise log
router.get('/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  if (!exerciseLogs[_id]) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  let log = exerciseLogs[_id].log;

  // Filter logs based on 'from' and 'to' dates
  if (from || to) {
    log = log.filter(entry => {
      const entryDate = new Date(entry.date);
      return (!from || entryDate >= new Date(from)) && (!to || entryDate <= new Date(to));
    });
  }

  // Limit the number of logs returned
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({ user: exerciseLogs[_id].user, count: log.length, log });
});

module.exports = router;
