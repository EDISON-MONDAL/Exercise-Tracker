require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');


// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URL'], { useNewUrlParser: true, useUnifiedTopology: true });



app.use(cors())
app.use(express.static('public'))



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// router
app.use('/api', apiRouter);




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
