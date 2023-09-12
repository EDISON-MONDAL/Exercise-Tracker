const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URL'], { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  logs: { type: Array, default: [] }
})
const users = mongoose.model("Users", userSchema);

class exercises {
  constructor(description, duration, date) {
    console.log(date);

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


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//respond with all the users
app.get("/api/users", async (req, res) => {
  const allUsers = await users.find();
  res.json(allUsers.map(({ username, _id }) => ({ username, _id })));
});
//create user
app.post("/api/users", async (req, res) => {
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
app.post("/api/users/:_id/exercises", async (req, res) => {
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
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.params._id });
    const { from, to, limit } = req.query;
    let temp = user.logs;
    if (from) {
      const fromDate = new Date(from)
      temp = temp.filter(exe => new Date(exe.date) > fromDate);
    }

    if (to) {
      const toDate = new Date(to)
      temp = temp.filter(exe => new Date(exe.date) < toDate);
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
