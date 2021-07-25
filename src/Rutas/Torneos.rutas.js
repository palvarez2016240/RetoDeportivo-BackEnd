'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var multiparty = require('connect-multiparty');
var torneoControlador = require("../Controladores/Torneos.controlador");
var md_subirImagen = multiparty({ uploadDir: './src/imagenes/torneos'});

var api = express.Router();

api.post('/registrarTorneo/:categoriaId', md_autorizacion.ensureAuth, torneoControlador.registrarTorneo);
api.get('/torneosCategoria/:categoriaId', torneoControlador.torneosCategoria);
api.get('/torneoId/:idTorneo', torneoControlador.torneoId);
api.put('/editarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.editarTorneo);
api.delete('/eliminarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.eliminarTorneo);
api.post('/unirEquipos/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.unirEquipos);
api.get('/equiposTorneo/:idTorneo', torneoControlador.equiposTorneo);
api.put('/iniciarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.iniciarTorneo);
api.put('/terminarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.terminarTorneo);
api.post('/unirMiEquipo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.unirMiEquipo);
api.post('/subirImagenTorneo/:idTorneo', [md_autorizacion.ensureAuth, md_subirImagen], torneoControlador.subirImgTorneo);
api.get('/obtenerImagenTorneo/:imagen', torneoControlador.obtenerImgTorneo);

module.exports = api;