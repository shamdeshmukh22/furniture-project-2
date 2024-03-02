var express=require('express');
var bodyparser=require('body-parser');
var User_route= require('./router/user_route');
var Admin_route=require("./router/admin_route");
var upload=require('express-fileupload');
var session=require('express-session');
var exe=require('./conn');
const numeral = require('numeral');

var app=express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public/'));
app.use(upload());  

app.use(session({
    secret:'a2z it hub',
    saveUninitialized:true,
    resave:true
}));

app.use("/",User_route);
app.use("/admin",Admin_route);

app.listen(1000);