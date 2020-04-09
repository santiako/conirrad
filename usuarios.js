//var pg = require('pg');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var assert = require('assert');
var mongoose = require('mongoose');
//var MongoClient = require("mongodb").MongoClient;
//var ObjectId = require("mongodb").ObjectID;

const rutasUsuario = require('./rutas/rutasUsuario.js');

const PORT = 3000;

const CONNECTION_URL = "mongodb+srv://santiakodb:605900@cluster0-pvica.mongodb.net/conirradDB?retryWrites=true&w=majority";


//var pool = new pg.Pool({
//    port: 5432,
//    host: 'localhost',
//    user: 'postgres',
//    password: 'santiako22',
//    database: 'conirraddb',
//    max: 10
//});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended : true }));
//app.use(bodyParser.json());
app.use(express.json());


mongoose.connect(CONNECTION_URL, { useUnifiedTopology: true, useNewUrlParser: true });

app.use(express.static(__dirname + '/public'));


app.use(morgan('dev'));

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});




// Redirección a archivos HTML
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});
app.get('/home', function(request, response) {
	response.sendFile(path.join(__dirname + '/home.html'));
});


app.use(rutasUsuario);



app.listen(PORT, () => { console.log('Listening on port: ' + PORT) });
