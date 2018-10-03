const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database')

mongoose.connect(config.database,{useNewUrlParser: true});
let db = mongoose.connection;

//Check connection
db.once('open', function(){
  console.log('Connected to MongoDB')
})

//Check for db errors
db.on('error', function(err){
  console.log(err);
})

//Init app
const app = express();

//Bring in Models
let Article = require('./models/article');
let User = require('./models/user');

//Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware / parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global user
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

//Home route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if (err){
      console.log(err)
    } else{
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
});

//route files
let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

//start server
app.listen(3000, function(){
  console.log('Server started on port 3000')
});
