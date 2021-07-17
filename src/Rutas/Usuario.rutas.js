'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var usuarioControlador = require("../Controladores/Usuarios.controlador");
var multiparty = require('connect-multiparty');
var md_subirImagen = multiparty({ uploadDir: './src/imagenes/usuarios'});

var api = express.Router();

api.post("/login", usuarioControlador.login);
api.post('/registrar', usuarioControlador.registrar);
api.put('/editarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
api.delete('/eliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);
api.get('/todosUsuarios', md_autorizacion.ensureAuth,usuarioControlador.obtenerUsuarios);
api.get('/obtenerUsuarioId/:id', md_autorizacion.ensureAuth,usuarioControlador.obtenerUsuarioId);
api.post('/subirImagen', [ md_autorizacion.ensureAuth, md_subirImagen ], usuarioControlador.subirImagen);
api.get('/obtenerImagen/:imagen', usuarioControlador.obtenerImagen);


module.exports = api;