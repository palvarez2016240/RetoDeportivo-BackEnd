'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var multiparty = require('connect-multiparty');
var torneoControlador = require("../Controladores/Torneos.controlador");
var md_subirImagen = multiparty({ uploadDir: './src/imagenes/torneos'});
var jornadaontrolador = require("../Controladores/jornadas.controlador");


var api = express.Router();

api.post('/registrarTorneo/:categoriaId', md_autorizacion.ensureAuth, torneoControlador.registrarTorneo);
api.get('/torneosCategoria/:categoriaId', torneoControlador.torneosCategoria);
api.get('/torneoId/:idTorneo', torneoControlador.torneoId);
api.put('/editarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.editarTorneo);
api.delete('/eliminarTorneo/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.eliminarTorneo);
api.put('/unirEquipos/:idTorneo', md_autorizacion.ensureAuth, torneoControlador.unirEquipos);
api.get('/equiposTorneo/:idTorneo', torneoControlador.equiposTorneo);
api.put('/iniciarTorneo/:idTorneo', torneoControlador.iniciarTorneo);
api.put('/terminarTorneo/:idTorneo', torneoControlador.terminarTorneo);
api.put('/unirMiEquipo/:idTorneo/:idUsuario', torneoControlador.unirMiEquipo);
api.get('/equiposSinTorneo/:idTorneo', torneoControlador.equiposSinTorneo);
api.post('/subirImagenTorneo/:idTorneo', [md_autorizacion.ensureAuth, md_subirImagen], torneoControlador.subirImgTorneo);
api.get('/obtenerImagenTorneo/:imagen', torneoControlador.obtenerImgTorneo);
api.get('/campeon/:idTorneo', torneoControlador.campeon);
api.get('/obtenerUsuario/:id', torneoControlador.obtenerUsuarioId)
api.post("/ingresarJornada/:idLiga", md_autorizacion.ensureAuth, jornadaontrolador.ingresarJornada);
api.get("/BuscarCampeones/:id",torneoControlador.BuscarCampeonatos)


module.exports = api;