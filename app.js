const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){

  res.render("home");
});

app.get("/about",function(req,res){
  res.render("about");
});

app.get("/contact",function(req,res){

  res.render("contact");
});

app.get("/gallery",function(req,res){
  res.render("gallery");
});

app.get("/dogs",function(req,res){
  res.render("dogs");
});

app.get("/cats",function(req,res){
  res.render("cats");
});
app.get("/birds",function(req,res){
  res.render("birds");
});
app.get("/signup",function(req,res){
  res.render("signup");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
