const mongoose = require('mongoose');

const SchemaUsuario = new mongoose.Schema({
    id: {
        type: Number,
        default: 0
    },
	idinterno: {
        type: Number,
        default: 0
    },
	mail: {
        type: String,
        required: true,
        trim: true
    },
	contra: {
        type: String,
        required: true,
        trim: true
    },
	dni: {
        type: Number,
        required: true,
        trim: true
    },
	nombre: {
        type: String,
        required: true,
        trim: true
    },
	apellido: {
        type: String,
        required: true,
        trim: true
    }
	//informe: [ {  id: 1, nominforme: 'Informe dosimétrico', lnkinforme: 'informe.psd'  } ]
}, { collection: 'usuario' });

const usuario = mongoose.model("usuario", SchemaUsuario);
module.exports = usuario;
