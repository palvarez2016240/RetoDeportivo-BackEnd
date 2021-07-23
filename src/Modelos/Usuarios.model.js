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
    equipo: Boolean,
})
module.exports = mongoose.model('Usuario',UsuarioShema);
