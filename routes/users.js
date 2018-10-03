const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in Models
let User = require('../models/user');

//Register Form
router.get('/register', function(req, res){
  res.render('register', {
    title: 'Register'
  });
})

//register process
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password does not match').equals(password);

  let errors = req.validationErrors();

  if(errors) {
    res.render('register', {
      title: 'Register',
      errors: errors
    });
  } else {

      let user = new User({
        name: name,
        email: email,
        username: username,
        password: password
      });

      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt, function(err, hash){
          if(err){console.log(err)
          } else {
          user.password = hash;
          console.log(hash);
          user.save(function(err){
            if (err) {
            console.log(err)
            return
            } else {
            req.flash('success', `Welcome, ${name}!`);
            res.redirect('/users/login');
          }
        });
         }
        });
      });
  }
});


// login routes

//Login Form
router.get('/login', function(req, res){
  res.render('login', {
    title: 'Login'
  });
})

//Login
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
})

//logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('danger', 'You are logged out')
  res.redirect('/users/login');
})

module.exports = router;
