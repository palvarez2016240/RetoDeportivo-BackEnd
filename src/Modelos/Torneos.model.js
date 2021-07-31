'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TorneoShema = Schema({
    nombre: String,
    equipos: [{
        idEquipo: {type: Schema.Types.ObjectId, ref: 'Equipo'}
    }],
    iniciado: Boolean,
    terminado: Boolean,
    imagen: String,
    campeon: {type: Schema.Types.ObjectId, ref: 'Equipo'},
    idCategoria: {type: Schema.Types.ObjectId, ref: 'Categoria'}
})

module.exports = mongoose.model('Torneo',TorneoShema);