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
        torneoId: { type: Schema.Types.ObjectId, ref: 'Torneo' },
        nombreTorneo: String,
        imagenTorneo: String
    }],
    integrantes: [{
        usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
    }],

    torneo: {type: Schema.Types.ObjectId, ref: 'Torneo'},
    imagen:String,
    
})

module.exports = mongoose.model('Equipos', EquipoSchema)

