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
const InstagramStrategy = require("passport-instagram");


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
  email: String,
  id:String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


const CLIENT_ID="890326273612-ukovagqlebasj2tks2tispp3ip7ddd6l.apps.googleusercontent.com";
const CLIENT_SECRET="cZjbzaaYb8TX48e6Vq5xo-0s";


passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileUrl: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ id: profile.id,username:profile.displayName,email:profile.emails,mobile:profile.phone},
       function (err, user) {
      return cb(err, user);
    });
  }
));

const FACEBOOK_APP_ID="3972056096192619";
const FACEBOOK_APP_SECRET="c6aba59c8d6682ce040049c3233452c5";


passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/pets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ id: profile.id,username:profile.displayName }, function (err, user) {
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

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/home");
  });



  app.get('/auth/facebook',
    passport.authenticate('facebook'));

  app.get('/auth/facebook/pets',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
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

  app.get("/profile",function(req,res){
    res.render("profile");
  });



  app.get("/about", function(req, res){
    if (req.isAuthenticated()){
      res.render("about");
    } else {
      res.redirect("signinoption");
    }
  });

app.get("/contact", function(req, res){
  if (req.isAuthenticated()){
    res.render("contact");
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
    res.render("dogs");
  } else {
    res.redirect("signinoption");
  }
});

app.get("/cats", function(req, res){
  if (req.isAuthenticated()){
    res.render("cats");
  } else {
    res.redirect("signinoption");
  }
});

app.get("/birds", function(req, res){
  if (req.isAuthenticated()){
    res.render("birds");
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
    res.render("home");
  } else {
    res.redirect("signinoption");
  }
});


app.post("/register", function(req, res){

  User.register({username: req.body.username},  req.body.password, function(err, user){
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
        res.redirect("home");
      });
    }
  });
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
