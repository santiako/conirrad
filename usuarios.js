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

const CONNECTION_URL = "mongodb+srv://santiakodb:605900@cluster0-pvica.mongodb.net/test?retryWrites=true&w=majority";
//const DATABASE_NAME = "conirradDB";


//var pool = new pg.Pool({
//    port: 5432,
//    host: 'localhost',
//    user: 'postgres',
//    password: 'santiako22',
//    database: 'conirraddb',
//    max: 10
//});

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true });

app.use(express.static(__dirname + '/public'));


app.use(morgan('dev'));

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(rutasUsuario);


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




app.post('/register', function(request, response) {
	var usermail = request.body.usermail;
	var password = request.body.password;
    var confpass = request.body.confpass;
    var userdni = request.body.userdni;
    var username = request.body.username;
    var usersurname = request.body.usersurname;

    //Validar datos antes de agregar... (mayus, minús, letras)
    if (password != confpass) {
        console.log('Ingresar contraseñas iguales.');
        return response.status(400).send('Contraseñas distintas.');
    }
    //let values = [usermail, password, userdni, username, usersurname];

	if (usermail && password && confpass
        && userdni && username && usersurname) {

        MongoClient.connect(CONNECTION_URL, function(err, db) {

            var collection = db.collection('usuario');
            // Setear ids incrementales
            var insertobj = { id: 1, idinterno: 2, mail: usermail,
                            contra: password, dni: userdni, nombre: username,
                            apellido: usersurname };

            // (Verificar primero que no exista un usuario con el mismo mail)
            collection.insert(insertobj, (error, result) => {
                if(error) {
                    return response.status(500).send(error);
                }

                //response.send(result.result);
                return response.status(200).send('Datos agregados.');
            });
        });

//            pool.query('INSERT INTO usuario (mail, contra, dni, nombre, apellido) VALUES($1, $2, $3, $4, $5)',
//                [...values], (err, table) => {
//                if (err) {
//                    console.log(err);
//                    return response.status(400).send('Error: ' + err);
//                } else {
//                    console.log('Datos agregados!');
//                    return response.status(200).send('Datos agregados.');
//                }
//            });
	} else {
		response.send('Por favor completar todos los campos.');
	}
});

app.get('/api/home', function(request, response) {

    let datos = {
        nomUsuario: '',
        informes: false,
        listaDeInformes: []
    };

    // Si el usuario esta logueado...
	if (request.session.loggedin) {
        var userid = request.session.userid;
        var usermail = request.body.usermail;
        var username = request.session.username;
        var pathinforme = 'clientes/' + userid + '/';

        datos.nomUsuario = username.toUpperCase();

        MongoClient.connect(CONNECTION_URL, function(err, db) {
            //Chequear si el usuario tiene informes, si tiene los muestra, caso contrario dice no hay informes
            collection.find({ mail: usermail }).toArray((error, result) => {
                if (error) {
                    //No hay informes.
                    datos.informes = false;
                    console.log('No hay informes');
                    console.log(datos);
                    return response.status(200).send(datos);

                    //return response.status(400).send('Error: ' + error);
                }
                    // Hay informes, enviarlos en formato Json
                    datos.informes = true;

                    for (var x = 0; x < table.rows.length ; x++) {
                        var lastList = { link: pathinforme + table.rows[x].lnkinforme, texInforme: table.rows[x].nominforme };
                        datos.listaDeInformes.push(lastList);
                    }

                    console.log(datos);
                    return response.status(200).send(datos);
                //response.send(result);
            });
        });

//        Chequear si el usuario tiene informes, si tiene los muestra, caso contrario dice no hay informes
//        pool.query('SELECT * FROM informe WHERE idusuario = $1', [userid], (err, table) => {
//            if (err) {
//                console.log(err);
//                return response.status(400).send('Error: ' + err);
//            } else {
//                if (table.rows.length > 0) {
//                     Hay informes, enviarlos en formato Json
//                    datos.informes = true;
//
//                    for (var x = 0; x < table.rows.length ; x++) {
//                        var lastList = { link: pathinforme + table.rows[x].lnkinforme, texInforme: table.rows[x].nominforme };
//                        datos.listaDeInformes.push(lastList);
//                    }
//                } else {
//                    No hay informes.
//                    datos.informes = false;
//                    console.log('No hay informes');
//                    console.log(datos);
//                    return response.status(200).send(datos);
//                }
//            }
//            console.log(datos);
//            return response.status(200).send(datos);
//        })

	} else {
        datos.nomUsuario = '';
        return response.status(200).send(datos);
	}
});

app.listen(PORT, () => { console.log('Listening on port: ' + PORT) });
