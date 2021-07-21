'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaShema=Schema({
    nombre: String,
    integrantes: { type:Schema.Types.ObjectId, ref: "usuario"},
})
module.exports = mongoose.model('categoria',CategoriaShema);