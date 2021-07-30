'use strict'
var Categoria = require("../Modelos/Categoria.model")

function CrearCategoria1(req, res) {
    
     //se crea categoria futbol predeterminado de la aplicación
     Categoria.findOne({ nombre: "Futbol" }, (err, buscandoFutball) => {
         if (err) {
             console.log("Error al verificar categoria Futball");
         } else if (buscandoFutball) {
             console.log("La categoria Futball ya existe");
         } else {

                     let cate = new Categoria();
                     cate.nombre = "Futbol";

                        //Guaradar los datos ingresados
                        cate.save((err, cate1Guardado) => {
                            if (err) { 
                                 console.log("Error al crear el FUTBALL");
                                } else if (cate1Guardado) {
                                 console.log("Categoria FUTBALL creada exitosamente");
                         } else {
                                console.log("No se a podido crear la categoria FUTBALL");
                        }
                     })
                }
    })
}

function CrearCategoria2(req, res) {
    //se crea categoria baloncesto predeterminado de la aplicación
    Categoria.findOne({ nombre: "Baloncesto" }, (err, buscandoBaloncesto) => {
        if (err) {
            console.log("Error al verificar categoria Baloncesto");
        } else if (buscandoBaloncesto) {
            console.log("La categoria Baloncesto ya existe");
        } else {
            let cate = new Categoria();
               cate.nombre = "Baloncesto";
                  
                //Guaradar los datos ingresados
                cate.save((err, cate2Guardado) => {
                   if (err) {
                       console.log("Error al crear el BALONCESTO");
                   } else if (cate2Guardado) {
                       console.log("Categoria BALONCESTO creada exitosamente");
                   } else {
                       console.log("No se a podido crear la categoria BALONCESTO");
                    }
            })    
       }
   })
}
function CrearCategoria3(req, res) {
    //se crea categoria volleyball predeterminado de la aplicación
    Categoria.findOne({ nombre: "Voleibol" }, (err, buscandoVolleyball) => {
        if (err) {
            console.log("Error al verificar categoria Volleyball");
        } else if (buscandoVolleyball) {
            console.log("La categoria Volleyball ya existe");
        } else {
            let cate = new Categoria();
               cate.nombre = "Voleibol";
                  
                //Guaradar los datos ingresados
                cate.save((err, cate3Guardado) => {
                   if (err) {
                       console.log("Error al crear el VOLLEYBALL");
                   } else if (cate3Guardado) {
                       console.log("Categoria VOLLEYBALL creada exitosamente");
                   } else {
                       console.log("No se a podido crear la categoria VOLLEYBALL");
                    }
            })    
       }
   })
}

function obtenerCategorias(req, res) {
    Categoria.find({}).exec((err, categorias) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar categorias' });
        if (!categorias) return res.status(500).send({ mensaje: 'Error al buscar las categorias' });
        return res.status(200).send({ categorias })
    })
}

function obtenerCategoriasId(req, res) {
    var cateId = req.params.id;

    Categoria.findById(cateId, (err, cateEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de categoria' });
        if (!cateEncontrado) return res.status(500).send({ mensaje: 'Error al obtener categorias' });
        return res.status(200).send({ cateEncontrado });
    })
}



module.exports={
    CrearCategoria1,
    CrearCategoria2,
    CrearCategoria3,
    obtenerCategorias,
    obtenerCategoriasId
}

