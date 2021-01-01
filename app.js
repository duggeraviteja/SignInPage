require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook");
const birdsdata=require("./views/bidrsdata.js");
const data = require('./views/data.js');
const catsdata = require('./views/catsdata.js');


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



 mongoose.connect("mongodb://admin-ravi:raviteja7899@cluster0-shard-00-00.nvc77.mongodb.net:27017,cluster0-shard-00-01.nvc77.mongodb.net:27017,cluster0-shard-00-02.nvc77.mongodb.net:27017/DOGSLOVE?ssl=true&replicaSet=atlas-jky30g-shard-0&authSource=admin&retryWrites=true&w=majority", {useNewUrlParser: true,useUnifiedTopology: true});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  username :String,
  mobile :String,
  displayName:String,
  email: String,
  id:String,
  address:String,
  password: String,
  created :{type:Date, default:Date.now()}
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
module.exports = User;
var ObjectId = require('mongodb').ObjectID;

passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://glacial-lake-70023.herokuapp.com/auth/google/pets",
    userProfileUrl: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ id: profile.id,displayName:profile.displayName,username:profile.emails,mobile:profile.phone,image:profile.picture},
       function (err, user) {
      return cb(err, user);
    });
  }
));




passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.envFACEBOOK_APP_SECRET,
    callbackURL: "https://glacial-lake-70023.herokuapp.com/auth/facebook/pets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ id: profile.id,username:profile.emails,displayName:profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
  if (req.isAuthenticated()){
    res.render("home");

  } else {
    res.redirect("/signinoption");
  }
});


app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/pets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets


    res.redirect("/home");
  });



  app.get('/auth/facebook',
    passport.authenticate('facebook'));

  app.get('/auth/facebook/pets',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    });


  app.get("/signinoption",function(req,res){
    res.render("signinoption");
  });


  app.get("/login", function(req, res){

    res.render("login");
  });

  app.get("/register",function(req,res){
    res.render("register");
  });



  app.get("/about", function(req, res){
    if (req.isAuthenticated()){
      res.render("about");
    } else {
      res.redirect("signinoption");
    }
  });




app.get("/gallery", function(req, res){
  if (req.isAuthenticated()){
    res.render("gallery");
  } else {
    res.redirect("signinoption");
  }
});


app.get("/dogs", function(req, res){
  if (req.isAuthenticated()){
    res.render("dogs",{data:data});
  } else {
    res.redirect("signinoption");
  }
});

app.get("/cats", function(req, res){
  if (req.isAuthenticated()){
    res.render("cats",{catsdata:catsdata});
  } else {
    res.redirect("signinoption");
  }
});

app.get("/birds", function(req, res){
  if (req.isAuthenticated()){
    res.render("birds",{birdsdata:birdsdata});
  } else {
    res.redirect("signinoption");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("login");
});


app.get("/home", function(req, res){
  if (req.isAuthenticated()){
    res.render("home",{ isAdded : true });
  } else {
    res.redirect("signinoption");
  }
});

app.get('/profile', function(req, res) {

if(req.isAuthenticated()){
  const _id = ObjectId(req.session.passport.user._id);
    User.find({_id:_id}, function(err, data) {
        res.render("profile", {
            user : req.user,
            userdata: data
        });
    });
  } else{
    res.redirect("signinoption");
  }
});

app.get("/update", function(req, res){
  if (req.isAuthenticated()){
    res.render("update",{username:req.session.passport.user.username});
    Swal.fire('Hello world!');
  } else {
    res.redirect("login");
  }
});

app.post("/update",function(req,res){
  const _id = ObjectId(req.session.passport.user._id);
  User.findOneAndUpdate({_id:_id }, {$set:{
    displayName:req.body.displayName,
    address:req.body.address,
    mobile:req.body.mobile,
    currentCity:req.body.currentCity
  }},
  {new: true,useFindAndModify: false},function (err, data){
res.render("home");
    // res.render("profile", {
    //     user : req.user,
    //     userdata: data
    // });
});
});






app.post("/register", function(req, res){
  User.register({username: req.body.username,mobile:req.body.mobile,displayName:req.body.displayName,address:req.body.address},  req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("register");
    } else {
      passport.authenticate("local")(req, res, function(){
              res.redirect("home");
      });
    }
  });

});


app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        // const _id = ObjectId(req.session.passport.user._id);
        // console.log(_id);
        res.redirect("home");
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
