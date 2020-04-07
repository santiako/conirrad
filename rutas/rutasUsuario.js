const express = require('express');
const modeloUsuario = require('../modelos/usuario');
const app = express();


//app.get('/foods', async (req, res) => {
//    const foods = await foodModel.find({});
//
//    try {
//        console.log('Comidas solicitadas...')
//        res.send(foods);
//    } catch (err) {
//        res.status(500).send(err);
//    }
//});



// Solicita loguearse y devuelve los datos de usuario
app.post('/login', async (request, response) => {
	var usermail = request.body.email_login.toLowerCase();
	var password = request.body.pass_login;



	if (usermail && password) {
        const usuarios = await modeloUsuario.find({ mail: usermail });


        // Si existe el mail continua...
        //collection.find({ mail: usermail }).toArray((error, result) => {
        try {
            if (error) {
                // no existe el usuario
                // Mostrar mensaje en pantalla diciendo que no existe el usuario...
                request.session.loggedin = false;
                request.session.userid = null;
                request.session.username = '';
                console.log('Usuario inexistente.');

                let datoserr = {
                    error: 0,
                    desc: 'Usuario inexistente.'
                };

                console.log(datoserr);
                return response.status(200).send(datoserr);

            } else {
                // Existe el usuario, chequear si coincide la contraseña... (agregar bycrypt)
                if (usuarios[0].contra == password) {
                    console.log('Usuario logueado.');
                    request.session.loggedin = true;
                    request.session.userid = usuarios[0].id;
                    request.session.username = usuarios[0].nombre;

                    //response.status(200).send(result);
                    response.send(usuarios[0]);
                } else {
                    request.session.loggedin = false;
                    request.session.userid = null;
                    request.session.username = '';

                    let datoserr = {
                        error: 1,
                        desc: 'Contraseña incorrecta.'
                    };
                    //return response.status(200).send(datoserr);
                    return response.send(datoserr);
                }
            }
        } catch (err) {
            response.status(500).send(err);
        }



//		pool.query('SELECT * FROM usuario WHERE LOWER(mail)=LOWER($1)', [usermail], (err, table) => {
//			if (err) {
//                console.log(err);
//                return response.status(400).send('Error: ' + err);
//			} else {
//                 Si existe el mail continua...
//                if (table.rows.length > 0) {
//                     Existe el usuario, chequear si coincide la contraseña... (agregar bycrypt)
//                    if (table.rows[0].contra == password) {
//                        console.log('Usuario logueado.');
//                        request.session.loggedin = true;
//                        request.session.userid = table.rows[0].id;
//                        request.session.username = table.rows[0].nombre;
//
//
//                        response.status(200).send(table.rows[0]);
//                    } else {
//                        request.session.loggedin = false;
//                        request.session.userid = null;
//                        request.session.username = '';
//
//                        let datoserr = {
//                            error: 1,
//                            desc: 'Contraseña incorrecta.'
//                        };
//                        return response.status(200).send(datoserr);
//                    }
//                } else {
//                     Mostrar mensaje en pantalla diciendo que no existe el usuario...
//                    request.session.loggedin = false;
//                    request.session.userid = null;
//                    request.session.username = '';
//                    console.log('Usuario inexistente.');
//
//                    let datoserr = {
//                        error: 0,
//                        desc: 'Usuario inexistente.'
//                    };
//                    return response.status(200).send(datoserr);
//                }
//			}
//		});
	} else {
		response.send('Por favor ingresar Usuario y Contraseña.');
		//response.end();
	}
});







// -----------------------------------------------------

app.get('/foods', async (req, res) => {
    const foods = await foodModel.find({});

    try {
        console.log('Comidas solicitadas...')
        res.send(foods);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/food', async (req, res) => {
    const food = new foodModel(req.body);

    try {
        await food.save();
        console.log('Comida agregada: ' + food.name);
        res.send(food);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/food/:id', async (req, res) => {
  try {
    const food = await foodModel.findByIdAndDelete(req.params.id)

    if (!food) res.status(404).send("No item found")
    res.status(200).send()
  } catch (err) {
    res.status(500).send(err)
  }
})

app.patch('/food/:id', async (req, res) => {
  try {
    await foodModel.findByIdAndUpdate(req.params.id, req.body)
    await foodModel.save()
    res.send(food)
  } catch (err) {
    res.status(500).send(err)
  }
})


module.exports = app
