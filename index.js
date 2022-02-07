//Use Express middleware to manage incoming requests and 
//dispatch them to corresponding behaviours
const express = require('express');

//Use chalk to add colours on the console
const chalk = require('chalk');

//to access form data
let bodyParser = require('body-parser');

//used to reduce response body
let compression = require('compression');

//Access the path 
const path = require('path');

//Accessing MongoDB
const mongoose = require('mongoose');

let session = require('express-session');

//sessions are stored into MongoDB
const MongoStore = require('connect-mongo');

let cors = require('cors');

//Used for logging
const morgan = require("morgan");

//Add more logging
const {loggers, transports, format} = require("winston");


//Create an application 
const app = express();

//Used for Jsonwebtoken (in login)
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//used to fetch the data from forms on HTTP POST, and PUT
app.use(bodyParser.urlencoded({

    extended : true
  
  }));
  
app.use(bodyParser.json());
  
//Use the morgan logging 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

//Define the loggers for Winston
loggers.add('infoLogger', {
    level: 'info',
    transports: [new transports.File({ filename: path.join(__dirname, 'logs/info.log')})],
    format: format.printf((info) => {
      let message = `${new Date(Date.now()).toUTCString()} | ${info.level.toUpperCase()}  | ${info.message}`
      return message
    })
});

loggers.add('errorLogger', {
    level: 'error',
    transports: [new transports.File({ filename: path.join(__dirname, 'logs/error.log')})],
    format: format.printf((info) => {
      let message = `${new Date(Date.now()).toUTCString()} | ${info.level.toUpperCase()}  | ${info.message}`
      return message
    })
});

const infoLogger = loggers.get('infoLogger');

//Connecting to MongoDB (async/await approach)
const connectDb = async () => {
    await mongoose.connect('mongodb://localhost:27017/tp1', {useNewUrlParser: true, useUnifiedTopology : true}).then(
        () => {
            console.log(chalk.green(`Connected to database`))
            infoLogger.info("Connected to database");
        },
        error => {
            console.error(chalk.red(`Connection error: ${error.stack}`))
            process.exit(1)
        }
    )
  }
  
  connectDb().catch(error => console.error(error))

  
// Passport Setup
const User = require('./models/user');

//setting session
app.use(session({

  resave: true,
  saveUninitialized: true,
  secret: 'mySecretKey',
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/auth'})

}));

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "My so secret sentence";

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById(jwt_payload.id)
    .then((user) => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }, (err) => {
      return done(err, false);
    });
}));

app.use(passport.initialize());

//compress response body for better performance
app.use(compression());

//disable headers indicating pages are coming from an Express server
app.disable('x-powered-by');

//used to fetch the data from forms on HTTP POST
app.use(bodyParser.urlencoded({

  extended : true

}));

app.use(bodyParser.json());

app.use(cors());


//Accessing the routes for the data and the users
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/user');

//Acces the routes 
app.use('/', dataRoutes);
app.use('/', userRoutes);

//Listen on the port 3000
app.listen(3000, () => {
    //Add info to the loggers
    infoLogger.info('Server is running on port: 3000');

});

//Print out where the server is
console.log(chalk.green("Server is running on port: 3000"));