'use strict'

var Jornada = require("../Modelos/jornadas.model");
var Equipo = require('../Modelos/Equipos.model')



function ingresarJornada(req, res) {
    var jornadaM = new Jornada();
    var params = req.body
    var idLiga = req.params.idLiga
    var marcador
    var jornada
    console.log(params)

    //---->Solo el rol usuario puede hacer esta funcion, ademas de agregar los datos(postman) al modelo antes de subirlo a la base
    if (params.nombre && params.equipo1 && params.equipo2 ) {

        if(  !params.marcador2){

            params.marcador2 = 0
        }

        if( !params.marcador1){
            params.marcador1 = 0

                
        }

        jornadaM.nombre = params.nombre;
        jornadaM.Torneo = idLiga;
        jornadaM.partido = [{
            equipo1: params.equipo1,
            equipo2: params.equipo2,
            marcador1: params.marcador1,
            marcador2: params.marcador2
        }]
        //---->Se busca en la base para ver si existen los nombres de los equipos
        Equipo.findOne({ _id: params.equipo1 }).exec((err, equipoEncontradoNombre) => {
            if (err) return res.status(500).send({ mensaje: "Error" })
            if (!equipoEncontradoNombre) return res.status(500).send({ mensaje: "No se encontro el mismo nombre de equipo" })
            if (equipoEncontradoNombre) {
                Equipo.findOne({ _id: params.equipo2 }).exec((err, equipoEncontradoNombre2) => {
                    if (err) return res.status(500).send({ mensaje: "Error" })
                    if (!equipoEncontradoNombre2) return res.status(500).send({ mensaje: "No se encontro el mismo nombre de equipo 2" })
                    if (equipoEncontradoNombre2) {



                        //---->Validacion para que el mismo equipo no juegue en la misma jornada 2 veces

 
                        Jornada.findOne({ nombre: params.nombre, Torneo: idLiga}).exec((err, JornadaEncontrada) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                                //console.log(JornadaEncontrada.partido.find(partido => partido.equipo1 === params.equipo1))
                                if(params.equipo1 == params.equipo2) return res.status(500).send({ mensaje: "Un equipo no puede jugar contra si mismo " })
                                
                                if (JornadaEncontrada){



                                    for (var i = 0; i < JornadaEncontrada.partido.length; i++){


                                        if((String(JornadaEncontrada.partido[i].equipo1) == params.equipo1 || String(JornadaEncontrada.partido[i].equipo2) == params.equipo1)
                                        ||
                                        (String(JornadaEncontrada.partido[i].equipo1) == params.equipo2 || String(JornadaEncontrada.partido[i].equipo2) == params.equipo2)

                                        
                                        ){

                                            var EquipoExisteEnJornada = 1
                                        }

                                    }

                                    if(EquipoExisteEnJornada)    return res.status(500).send({ mensaje: "Uno de los dos partidos ya jugo " })



                                }




                                Jornada.find({Torneo : idLiga }).exec((err, JornadasEncontrada) => {


                                    //paso 1 recorremos las jornadas
                                    for (var e = 0; e < JornadasEncontrada.length; e++){


                                        //paso 2, recorremos los partidos de cada jornada
                                        for (var i = 0; i < JornadasEncontrada[e].partido.length; i++){

                                                                                        //ahora revisamos si hay partidos con los mismos equipos

                                                                                            //primero buscamos el equipo 1, si existe, esto supongamos que dira sí
                                        if((String( JornadasEncontrada[e].partido[i].equipo1) == params.equipo1 || String( JornadasEncontrada[e].partido[i].equipo2) == params.equipo1)
                                        &&
                                        // luego buscamos el partido 2, si existe supongamos que dira que sí
                                        (String( JornadasEncontrada[e].partido[i].equipo1) == params.equipo2 || String( JornadasEncontrada[e].partido[i].equipo2) == params.equipo2)
                                        ){

                                            var EquipoExisteEnJornadas = 1
                                        }




                                    }
                                }



                                    if(EquipoExisteEnJornadas)    return res.status(500).send({ mensaje: "Los equipos ya se enfretaron " })








                                    ///---->Se guardan los datos del partido en el equipo 1 como golesfavor, DG , GE,etc
                                    
                                    Equipo.find({ _id: params.equipo1 }).exec((err, JequipoEncontrado) => {
                                        if (err) return res.status(500).send({ mensaje: "Error" })
                                        console.log(JequipoEncontrado[0].golesAfavor)
                                        if (!JequipoEncontrado) return res.status(500).send({ mensaje: "No se encontro el equipo" })
                                        Equipo.update({ _id: JequipoEncontrado[0]._id }, {
                                            $set: {
   
                                                pj: JequipoEncontrado[0].pj + 1,
                                            }
                                        },
                                            (err, equipoCambiado) => {
                                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar Equipo 1" })
                                                if (!equipoCambiado) return res.status(500).send({ mensaje: "No se pudo cambiar los Equipo 1" })
                                            })
                                        ///---->Se guardan los pts equipo1 si gano +3 o si == +1
                                        ///---->Se guardan los pts equipo1 si gano +3 o si == +1
                                        if (params.marcador1 > params.marcador2) {
                                            Equipo.update({ _id: JequipoEncontrado[0]._id }, {
                                                $set: {
                                                    puntos: JequipoEncontrado[0].puntos + 3
                                                }
                                            },
                                                (err, equipoCambiado) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar pts equipo1" })
                                                    if (!equipoCambiado) return res.status(500).send({ mensaje: "No se pudo cambiar los pts equipo1" })
                                                })
                                        } else if (params.marcador1 == params.marcador2) {
                                            Equipo.update({ _id: JequipoEncontrado[0]._id }, {
                                                $set: {
                                                    puntos: JequipoEncontrado[0].puntos + 1
                                                }
                                            },
                                                (err, equipoCambiado) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar pts equipo1" })
                                                    if (!equipoCambiado) return res.status(500).send({ mensaje: "No se pudo cambiar los pts equipo1" })
                                                })
                                        }
                                        ///---->Se guardan los datos del partido en el equipo 2 como golesfavor, DG , GE,etc
                                        Equipo.find({ _id: params.equipo2 }).exec((err, JequipoEncontrado2) => {
                                            if (err) return res.status(500).send({ mensaje: "Error" })
                                            if (!JequipoEncontrado2) return res.status(500).send({ mensaje: "No se encontro el equipo" })
                                            Equipo.update({ _id: JequipoEncontrado2[0]._id }, {
                                                $set: {
                                        
                                                        pj: JequipoEncontrado2[0].pj + 1,
                                                }
                                            },
                                                (err, equipoCambiado2) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar Equipo 2" })
                                                    if (!equipoCambiado2) return res.status(500).send({ mensaje: "No se pudo cambiar Equipo 2" })
                                                })





                                                if (params.marcador2 > params.marcador1) {
                                                    Equipo.update({ _id: JequipoEncontrado2[0]._id }, {
                                                        $set: {
                                                            puntos: JequipoEncontrado2[0].puntos + 3
                                                        }
                                                    },
                                                        (err, equipoCambiado2) => {
                                                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar pts equipo2" })
                                                            if (!equipoCambiado2) return res.status(500).send({ mensaje: "No se pudo cambiar los pts equipo2" })
                                                        })
                                                } else if (params.marcador2 == params.marcador1) {
                                                    Equipo.update({ _id: JequipoEncontrado2[0]._id }, {
                                                        $set: {
                                                            puntos: JequipoEncontrado2[0].puntos + 1
                                                        }
                                                    },
                                                        (err, equipoCambiado2) => {
                                                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de cambiar pts equipo2" })
                                                            if (!equipoCambiado2) return res.status(500).send({ mensaje: "No se pudo cambiar los pts equipo2" })
                                                        })
                                                }
                                        
                                            //---->Se guarda en la base los datos agregados

                                            if(JornadaEncontrada){
                                                Jornada.findByIdAndUpdate(JornadaEncontrada._id, {$push:{partido:{

                                                    
                                                        equipo1: params.equipo1,
                                                        equipo2: params.equipo2,
                                                        marcador1: params.marcador1,
                                                        marcador2: params.marcador2

                                                }}},{new: true}).exec((err, partidoGuardado)=>{

                                                    if (partidoGuardado) return res.status(200).send({ partidoGuardado })
                                                    if (err) return res.status(500).send({ mensaje: "Error" })
                                                    if (!jornadaGuadada) return res.status(500).send({ mensaje: "No se pudo Guardar la jornada" })
                                                })



                                            }else{
                                                jornadaM.save((err, jornadaGuadada) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error" })
                                                    if (!jornadaGuadada) return res.status(500).send({ mensaje: "No se pudo Guardar la jornada" })
                                                    if (jornadaGuadada) return res.status(200).send({ jornadaGuadada })
                                                })

                                            }


                                        })
                                    })


                                })

                                

                                
                            })
                    }
                })
            }

        })
    } else {
        return res.status(500).send({ mensaje: "Rellene todos los campos" })
    }




}


module.exports = {
    ingresarJornada,
}