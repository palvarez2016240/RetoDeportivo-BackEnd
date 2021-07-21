'use strict'
var Categoria = require("../Modelos/Categoria.model")
var Usuario = require("../Modelos/Usuarios.model");


function CrearCategoria1(req, res) {
    //var idUser = req.user.sub;
    
     //se crea categoria futbol predeterminado de la aplicación
     Categoria.findOne({ nombre: "FUTBALL" }, (err, buscandoFutball) => {
         if (err) {
             console.log("Error al verificar categoria Futball");
         } else if (buscandoFutball) {
             console.log("La categoria Futball ya existe");
         } else {

             /*//Se busca al usuario si existe
             Usuario.findOne({ _id: idUser }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (userFound) {

                //Validar que ni hayan mas de 10 usarios en la categoria
                Categoria.find({ integrantes: userFound.idUser }).exec((err, equipoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: "Error 3" });
                    if (equipoEncontrado && equipoEncontrado.length >= 10 ) {
                        return res.status(500).send({ mensaje: "Solo puede haber 10 Usuarios por liga" })

                } else {*/
                     let cate = new Categoria();
                     cate.nombre = "FUTBALL";
                     cate.integrantes = idUser;

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
                 //    }
               //  })
          //  }
        //})
        
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

function CrearEquipo(req, res) {
    let idUser = req.user.sub;
    let equipo = new Equipo();
    let params = req.body;

    if (params.nombres && idUser) {
        User.findOne({ _id: idUser }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (userFound) {
                Equipo.findOne({ usuario: userFound._id }, (err, teamFound) => {
                    if (err) {
                        return res
                            .status(500)
                            .send({ ok: false, message: "Error general" });
                    } else if (teamFound) {
                        return res.json({
                            ok: false,
                            message: "Ese equipo ya tiene usuario",
                        });
                    } else {
                        equipo.nombres = params.nombres;
                        equipo.usuario = idUser;
                        equipo.save((err, teamSaved) => {
                            if (err) {
                                return res
                                    .status(500)
                                    .send({ ok: false, message: "Error general" });
                            } else if (equipoSaved) {
                                return res.json({
                                    ok: true,
                                    message: "Equipo guardado correctamente",
                                    teamSaved,
                                });
                            } else {
                                return res.json({
                                    ok: false,
                                    message: "Error al guardar el equipo",
                                });
                            }
                        });
                    }
                });
            } else {
                return res.json({ ok: false, message: "NO existe el usuario" });
            }
        });
    } else {
        return req.json({ ok: false, message: "Eror" });
    }
}