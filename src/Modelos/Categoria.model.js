'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaShema=Schema({
    nombre: String,

})
module.exports = mongoose.model('categoria',CategoriaShema);