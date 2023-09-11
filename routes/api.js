// Import necessary modules
const express = require('express');
const router = express.Router();
const uuid = require('uuid');


// Sample data storage (replace with a database in production)
const users = [];
//let exerciseLogs = {};

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
  let index = 0

  for (let i = 0; i < users.length; i++) {
    if (users[i]['_id'] === _id ) {
        found = true;
        index = i
        
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
  //res.json({ username: users[index]['username'], description: lastLog['description'], duration: lastLog['duration'], date: lastLog['date'], _id: users[index]['_id'] });
  
  const exercise = { username: users[index]['username'], description: lastLog['description'], duration: lastLog['duration'], date: lastLog['date'], _id: users[index]['_id'] }
  /*
  exercise['_id'] = users[index]['_id'],
  exercise['username'] = users[index]['username'], 
  exercise['date'] = lastLog['date'], 
  exercise['duration'] = lastLog['duration'],   
  exercise['description'] = lastLog['description'], 
  */
  

  res.json( exercise )
  /*
  if(!found) {
    res.status(404).json({ message: 'User not found' });
    return;
  } else {
    // count
    if(!users[index]['count']){
        users[index]['count'] = 0
    }
    // log array
    if(!users[index]['log']){
        users[index]['log'] = []
    }

    // Add the exercise log entry to the user's log
    users[index]['log'].push(logEntry);
    users[index]['count']++;

    // Send the updated user object as the response
    res.json(users[index]);
  }
  */
  
});


// GET /api/users/:_id/logs to retrieve a user's exercise log
router.get('/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  /*
  if (!exerciseLogs[_id]) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  */
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
    /*
    let queryArr = []

        
    for (let i = 0; i < log.length; i++){
        const olddate = log[i]['date']
        const oldYear = olddate.getFullYear()
        const oldMonth = olddate.getMonth()
        const oldDate = olddate.getDate()

        const querydatefrom = new Date(from)
        const queryYearfrom = querydatefrom.getFullYear()
        const queryMonthfrom = querydatefrom.getMonth()
        const queryDatafrom = querydatefrom.getDate()

        const querydateto = new Date(from)
        const queryYearto = querydateto.getFullYear()
        const queryMonthto = querydateto.getMonth()
        const queryDatato = querydateto.getDate()

        if(from != undefined && to != undefined && (oldYear >= queryYearfrom && oldMonth >= queryMonthfrom && oldDate>= queryDatafrom ) && (oldYear <= queryYearto && oldMonth <= queryMonthto && oldDate < queryDatato) ){
            queryArr.push(log[i])
        }else if(from != undefined && (oldYear >= queryYearfrom && oldMonth >= queryMonthfrom && oldDate>= queryDatafrom ) ){ 
            queryArr.push(log[i])
        } else if(to != undefined && (oldYear <= queryYearto && oldMonth <= queryMonthto && oldDate < queryDatato) ) {
            queryArr.push(log[i])
        }

        if(queryArr.length == parseInt(limit)){
            break
        }
    }
    */
    
    
    
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

module.exports = router;
