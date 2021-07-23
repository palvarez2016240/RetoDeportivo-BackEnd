'use strict'

// VARIABLES
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors")

// IMPORTACION DE RUTAS
var UsuarioRutas = require("./src/Rutas/Usuario.rutas");
var CateRutas = require("./src/Rutas/Categoria.rutas")

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// APLICACION DE RUTAS
app.use('/api', UsuarioRutas,CateRutas);

//EXPORTAR
module.exports = app;