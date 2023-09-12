// Import necessary modules
const express = require('express');
const router = express.Router();
const uuid = require('uuid');


// Sample data storage (replace with a database in production)
const users = [];
const exercise = {};

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

  


  let found = false;
  let index = 0
  let username = ''

  for (let i = 0; i < users.length; i++) {
    if (users[i]['_id'] === _id ) {
        found = true;
        index = i
        username = users[i]['username']
        
        break;
    }
  }
  
  if(!found){
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Create an exercise log entry
  const logEntry = { username, description, duration: parseInt(duration), date: date || new Date().toDateString(), _id };
  
  /*
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

    const lastLog = users[index]['log'][ users[index]['log'].length - 1]

    const exercise = { username: users[index]['username'], description: lastLog['description'], duration: lastLog['duration'], date: lastLog['date'], _id: users[index]['_id'] }

    return res.json( exercise )
  } else {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  */

 


exercise[_id] = logEntry
  
  

  res.json( exercise[_id] )
  
  
});
/*

// GET /api/users/:_id/logs to retrieve a user's exercise log
router.get('/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  // //////////////////
  if (!exerciseLogs[_id]) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  // /////////////////////
  let found = false;
  let index = 0

  for (let i = 0; i < users.length; i++) {
    if (users[i]['_id'] === _id ) {
        found = true;
        index = i
        
        break;
    }
  }

  if(!found){
    res.status(404).json({ message: 'User not found' });
    return;
  } 
  else {

    let log = users[index]['log']
    
    
    
    
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
    
    
    
    //console.warn(log)
    //console.warn(queryArr)
    
    const resObj = {}
    resObj['_id'] = users[index]['_id']
    resObj['username'] = users[index]['username']
    if(from != undefined && !isNaN(new Date(from))){
        resObj['from'] = from
    }
    if(to != undefined && !isNaN(new Date(to))){
        resObj['to'] = to
    }
    resObj['count'] = log.length
    resObj['log'] = log
    //resObj['count'] = queryArr.length
    //resObj['log'] = queryArr

    return res.json( resObj );
 }
  
});
*/

module.exports = router;
