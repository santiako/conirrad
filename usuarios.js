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


app.post('/login', function(request, response) {
	var usermail = request.body.email_login;
	var password = request.body.pass_login;

	if (usermail && password) {
		pool.query('SELECT * FROM usuario WHERE LOWER(mail)=LOWER($1)', [usermail], (err, table) => {
			if (err) {
                console.log(err);
                return response.status(400).send('Error: ' + err);
			} else {
                // Si existe el mail continua...
                if (table.rows.length > 0) {
                    // Existe el usuario, chequear si coincide la contraseña... (agregar bycrypt)
                    if (table.rows[0].contra == password) {
                        console.log('Usuario logueado.');
                        request.session.loggedin = true;
                        request.session.userid = table.rows[0].id;
                        request.session.username = table.rows[0].nombre;

                        //response.redirect('/home');
                        response.status(200).send(table.rows[0]);
                    } else {
                        request.session.loggedin = false;
                        request.session.userid = null;
                        request.session.username = '';

                        let datoserr = {
                            error: 1,
                            desc: 'Contraseña incorrecta.'
                        };
                        return response.status(200).send(datoserr);
                    }
                } else {
                    // Mostrar mensaje en pantalla diciendo que no existe el usuario...
                    request.session.loggedin = false;
                    request.session.userid = null;
                    request.session.username = '';
                    console.log('Usuario inexistente.');

                    let datoserr = {
                        error: 0,
                        desc: 'Usuario inexistente.'
                    };
                    return response.status(200).send(datoserr);
                }
			}
			//response.end();
		});
	} else {
		response.send('Por favor ingresar Usuario y Contraseña.');
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
        console.log('Ingresar contraseñas iguales.');
        return response.status(400).send('Contraseñas distintas.');
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
                return response.status(400).send('Error: ' + err);
			} else {
                console.log('Datos agregados!');
                return response.status(200).send('Datos agregados.');
			}
		});
	} else {
		response.send('Por favor completar todos los campos.');
	}
});

app.get('/api/home', function(request, response) {

    let datos = {
        nomUsuario: '',
        informes: false,
        listaDeInformes: [
            { link: 'clientes/1/prueba.pdf', texInforme: 'Informe dosimétrico' }
        ]
    };
    var defaultObj = { link: '', texInforme: '' };

	if (request.session.loggedin) {
        var userid = request.session.userid;
        var username = request.session.username;
        var pathinforme = 'clientes/' + userid + '/';

        datos.nomUsuario = username.toUpperCase();

        //Chequear si el usuario tiene informes, si tiene los muestra, caso contrario dice no hay informes
        pool.query('SELECT * FROM informe WHERE idusuario = $1', [userid], (err, table) => {
            if (err) {
                console.log(err);
                return response.status(400).send('Error: ' + err);
            } else {
                if (table.rows.length > 0) {
                    // Hay informes, enviarlos en formato Json
                    datos.informes = true;

                    datos.listaDeInformes.length = table.rows.length;
                    for (var x = 0; x < table.rows.length; x++) {
                        // Llenar lista con valores default
                        datos.listaDeInformes[x] = defaultObj;
                        datos.listaDeInformes[x].link = pathinforme + table.rows[x].lnkinforme;
                        datos.listaDeInformes[x].texInforme = table.rows[x].nominforme;
                    }
                } else {
                    //No hay informes.
                    datos.informes = false;
                    console.log('No hay informes');
                    console.log(datos);
                    return response.status(200).send(datos);
                }
            }
            console.log(datos);
            return response.status(200).send(datos);
        })

	} else {
        // Si el usuario es '' decir que inicie sesión
        datos.nomUsuario = '';
        return response.status(200).send(datos);
	}
});

app.listen(PORT, () => console.log('Listening on port: ' + PORT ));
