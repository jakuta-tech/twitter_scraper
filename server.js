var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require("body-parser");
var Twitter = require('twitter');
var fs = require('fs');
var morgan       = require('morgan');
var session = require('express-session');

//set to 8080 by default
var port = 8080
if (process.argv.length == 3) {
	port = process.argv[2]
}
console.log(port);


app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(express.cookieParser());

var engines = require('consolidate');

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { secure: false }}))
app.use(express.static(__dirname + '/views')); //serve our views here (html and all related client side files)
// app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console

//Routes (where we handle all post and get requests)
require('./app/routes')(app, express);


server.listen(port, function () {
    console.log("Started sever on " + port);
});