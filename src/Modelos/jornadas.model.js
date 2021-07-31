'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var JornadaShema = Schema({
    nombre: String,
    Torneo : {type:Schema.Types.ObjectId, ref: "Torneo"},
    partido:[{
        equipo1:{ type:Schema.Types.ObjectId, ref: "Equipo"},
        equipo2: {type:Schema.Types.ObjectId, ref: "Equipo"},
        marcador1: Number,
        marcador2: Number
    }]

})
module.exports = mongoose.model("jornada", JornadaShema)