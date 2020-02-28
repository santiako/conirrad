var pg = require('pg');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
//var morgan = require('morgan');
var path = require('path');

const PORT = 3000;


var pool = new pg.Pool({
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: 'santiako22',
    database: 'conirraddb',
    max: 10
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

//app.use(morgan('dev'));

//app.use(function(request, response, next) {
//  response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//  next();
//});


app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/login', function(request, response) {
	var usermail = request.body.usermail;
	var password = request.body.password;

	if (usermail && password) {
		pool.query('SELECT * FROM usuario WHERE LOWER(mail)=LOWER($1)', [usermail], (err, table) => {
			if (err) {
                //response.send('Usuario o Contraseña incorrecta!');
                console.log(err);
                return response.status(400).send('Usuario inexistente! ' + err);
			} else {
                // Si existe el mail continua...
                if (table.rows.length > 0) {
                    // Existe el usuario, chequear si coincide la contraseña... (agregar bycrypt)
                    if (table.rows[0].contra == password) {
                        console.log('Usuario logueado!');
                        request.session.loggedin = true;
                        request.session.userid = table.rows[0].id;
                        request.session.username = table.rows[0].nombre;
                        response.redirect('/home');
                        //return response.status(200).send(table.rows[0]);
                    } else {
                        request.session.loggedin = false;
                        request.session.userid = null;
                        request.session.username = '';
                        return response.status(400).send('Contraseña incorrecta!');
                    }
                } else {
                    // Mostrar mensaje en pantalla diciendo que no existe el usuario
                    request.session.loggedin = false;
                    request.session.userid = null;
                    request.session.username = '';
                    console.log('Usuario inexistente!');
                    return response.status(400).send('Usuario inexistente!');
                }
			}
			//response.end();
		});
	} else {
		response.send('Por favor ingresar Usuario y Contraseña');
		//response.end();
	}
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
        console.log('Ingresar contraseñas iguales!');
        return response.status(400).send('Contraseñas distintas!');
    }
    let values = [usermail, password, userdni, username, usersurname];

	if (usermail && password && confpass 
        && userdni && username && usersurname) {
        // (Verificar primero que no exista un usuario con el mismo mail)
//        pool.query('INSERT INTO usuario (mail, contra, dni, nombre, apellido, cantinformes) VALUES($1, $2, $3, $4, $5, $6) WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE mail=$1)', 
//            [...values], (err, table) => {
		pool.query('INSERT INTO usuario (mail, contra, dni, nombre, apellido) VALUES($1, $2, $3, $4, $5)', 
            [...values], (err, table) => {
			if (err) {
                console.log(err);
                return response.status(400).send('Error! ' + err);
			} else {
                console.log('Datos agregados!');
                return response.status(200).send('Datos agregados!');
			}
		});
	} else {
		response.send('Por favor completar todos los campos!');
	}
});

app.get('/home', function(request, response) {
    let htmltxt = '<!DOCTYPE HTML><html><head><meta charset="UTF-8"><title>Home usuarios</title><link href="css/style.css" id="cssFile" rel="stylesheet" type="text/css"></head><body><div class="home-users">';
    var x;

	if (request.session.loggedin) {
        var userid = request.session.userid;
        var username = request.session.username;
        var pathinforme = 'clientes/' + userid + '/';
        
        htmltxt += '<h1>BIENVENIDO ' + username.toUpperCase() + '</h1>';
        
        //Chequear si el usuario tiene informes, si tiene los muestra, caso contrario dice no hay informes
        pool.query('SELECT * FROM informe WHERE idusuario = $1', [userid], (err, table) => {
            if (err) {
                console.log(err);
                return response.status(400).send('Error! ' + err);
            } else {
                if (table.rows.length > 0) {
                    htmltxt += '<h2>INFORMES</h2>';
                    htmltxt += '<hr>';
                    htmltxt += '<ul>';
                    for (x = 0; x < table.rows.length; x++) {
                        htmltxt += '<li><a href="' + pathinforme + table.rows[x].lnkinforme + '">' + table.rows[x].nominforme + '</a></li>';
                    }
                    htmltxt += '</ul>';
                } else {
                    //No hay informes
                    console.log('No hay informes');
                    htmltxt += '<h2>NO HAY INFORMES.</h2>';
                    //response.status(200).send('No hay informes!')
                }
            }
            htmltxt += '<div class="cnavolver"><a href="/" class="avolver">VOLVER</a></div>';
            htmltxt += '</div></body></html>';
            return response.send(htmltxt);
        })

	} else {
        htmltxt += '<h2>POR FAVOR INICIE SESIÓN</h2>';
        htmltxt += '<div class="cnavolver"><a href="/" class="avolver">VOLVER</a></div>';
        htmltxt += '</div></body></html>';
        return response.send(htmltxt);
	}
    
    //response.sendFile(path.join(__dirname + '/home.html'));
});

app.listen(PORT, () => console.log('Listening on port: ' + PORT ));
