'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioShema=Schema({
    nombres: String,
    apellidos: String,
    edad: Number,
    usuario: String,
    email: String,
    password: String,
    rol: String,
    imagen: String,
    equipos: {type: Schema.Types.ObjectId, ref: 'Equipos'},
})
module.exports = mongoose.model('Usuario',UsuarioShema);
