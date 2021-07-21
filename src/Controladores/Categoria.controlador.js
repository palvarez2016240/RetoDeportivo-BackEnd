'use strict'
var Categoria = require("../Modelos/Categoria.model")

function CrearCategoria1(req, res) {
    
     //se crea categoria futbol predeterminado de la aplicación
     Categoria.findOne({ nombre: "FUTBALL" }, (err, buscandoFutball) => {
         if (err) {
             console.log("Error al verificar categoria Futball");
         } else if (buscandoFutball) {
             console.log("La categoria Futball ya existe");
         } else {

                     let cate = new Categoria();
                     cate.nombre = "FUTBALL";

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
    Categoria.findOne({ nombre: "BALONCESTO" }, (err, buscandoBaloncesto) => {
        if (err) {
            console.log("Error al verificar categoria Baloncesto");
        } else if (buscandoBaloncesto) {
            console.log("La categoria Baloncesto ya existe");
        } else {
            let cate = new Categoria();
               cate.nombre = "BALONCESTO";
                  
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
    Categoria.findOne({ nombre: "VOLLEYBALL" }, (err, buscandoVolleyball) => {
        if (err) {
            console.log("Error al verificar categoria Volleyball");
        } else if (buscandoVolleyball) {
            console.log("La categoria Volleyball ya existe");
        } else {
            let cate = new Categoria();
               cate.nombre = "VOLLEYBALL";
                  
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


module.exports={
    CrearCategoria1,
    CrearCategoria2,
    CrearCategoria3
}

