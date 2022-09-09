const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('./models/user');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const compression = require('compression');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const app = express();
require('dotenv').config();

const mongoose = require('mongoose');
const mongoDB = process.env.MONGO_KEY;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get("/catalog/login-in", (req, res) => res.render("login_in"));
app.use(session({
  cookie:{
      secure: true,
      maxAge:60000
         },
  secret: 'secret',
  saveUninitialized: true,
  resave: false
  }));
  
  app.use(function(req,res,next){
  if(!req.session){
      return next(new Error('Oh no')) //handle error
  }
  next() //otherwise continue
  });
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res)=>{
        if(res){
          return done(null, user);
        }
        else {
          return done(null, false, { message: "Incorrect password" });
        }
      })
    });
  })
);
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.post(
  "/catalog/login-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
