'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var cateControlador = require("../Controladores/Categoria.controlador");

var api = express.Router();


api.get('/todasCategorias', md_autorizacion.ensureAuth,cateControlador.obtenerCategorias);
api.get('/obtenerCategoriasId/:id', md_autorizacion.ensureAuth,cateControlador.obtenerCategoriasId);



module.exports = api;