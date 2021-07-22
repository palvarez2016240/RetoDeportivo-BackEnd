'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquipoSchema = Schema({

    nombre: String,
    dueño: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    categoria: { type: Schema.Types.ObjectId, ref: 'categoria' },
    puntos: Number,
    pj: Number,
    torneosG: [{
        torneo: { type: Schema.Types.ObjectId, ref: 'Torneo' }
    }],
    integrantes: [{
        usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
    }]
})

module.exports = mongoose.model('Equipos', EquipoSchema)

