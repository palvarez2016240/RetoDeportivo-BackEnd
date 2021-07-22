'use strict'

var express = require('express');
var md_autorizacion = require('../Middlewares/authenticated');
var EquipoController = require('../Controladores/Equipos.controlador')
var multiparty = require('connect-multiparty')
var md_subirImagen = multiparty({ uploadDir: './src/imagenes/equipos'})

var api = express.Router();

api.post("/CrearEquipo", md_autorizacion.ensureAuth, EquipoController.CrearEquipo)
api.put("/AgregarMiembro/:id", md_autorizacion.ensureAuth, EquipoController.AgregarMiembro)
api.put("/EliminarMiembro/:id", md_autorizacion.ensureAuth, EquipoController.EliminarMiembro)
api.delete("/EliminarEquipo/:id", md_autorizacion.ensureAuth,EquipoController.EliminarEquipo)

module.exports =api;