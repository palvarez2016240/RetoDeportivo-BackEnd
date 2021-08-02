'use strict'

var categorias = require("../Modelos/Categoria.model")
var torneos = require("../Modelos/Torneos.model");
var equipos = require("../Modelos/Equipos.model")
var Usuario = require("../Modelos/Usuarios.model")
var fs = require('fs');
var path = require('path');

function registrarTorneo(req, res) {
    var torneoModel = new torneos();
    var params = req.body;
    var CategoriaId = req.params.categoriaId;

    if (params.nombre) {

        if (req.user.rol != "ROL_ADMINAPP") {
            return res.status(500).send({ mensaje: "Solo el ADMIN de la aplicacion puede crear un torneo" })
        }

        torneos.find({ nombre: params.nombre, idCategoria: CategoriaId }).exec((err, torneoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (torneoEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: 'Ya existe el torneo en esta categoria' });
            } else {

                categorias.findOne({ _id: CategoriaId }).exec((err, categoriaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!categoriaEncontrada) return res.status(500).send({ mensaje: "La categoria no existe" });

                    torneoModel.nombre = params.nombre;
                    torneoModel.iniciado = false,
                        torneoModel.terminado = false,
                        torneoModel.imagen = null,
                        torneoModel.idCategoria = CategoriaId,
                        torneoModel.campeon = null,

                        torneoModel.save((err, torneoGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if (torneoGuardado) {
                                res.status(200).send({ mensaje: "Torneo agregado" })
                            } else {
                                res.status(500).send({ mensaje: "No se a podido guardar el torneo" })
                            }
                        })
                })
            }
        })

    } else {
        return res.status(500).send({ mensaje: "Parametros incorrectos o incompletos" })
    }
}

function torneosCategoria(req, res) {
    var CategoriaId = req.params.categoriaId;

    torneos.find({ idCategoria: CategoriaId }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener los torneos' });
        if (torneoEncontrado.length === 0) return res.status(404).send({ mensaje: "No hay torneos en esta categoria" });
        if (!torneoEncontrado) return res.status(404).send({ mensaje: 'No hay torneos en esta categoria' });
        return res.status(200).send({ torneoEncontrado });
    })
}

function torneoId(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (!torneoEncontrado) {
            return res.status(404).send({ mensaje: 'No existe el torneo' })
        }
        return res.status(200).send({ torneoEncontrado });
    })
}

function editarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;
    var params = req.body;
    var estaIniciado;
    var categoria;

    if (!params.nombre) {
        return res.status(500).send({ mensaje: 'No hay ningun parametro correcto para editar' });
    }

    if (req.user.rol != "ROL_ADMINAPP") {
        return res.status(500).send({ mensaje: "Solo el ADMIN puede editar torneos" })
    }

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (torneoEncontrado) {
            estaIniciado = torneoEncontrado.iniciado;
            categoria = torneoEncontrado.idCategoria;
        }
        if (!torneoEncontrado) {
            return res.status(404).send({ mensaje: 'No existe el torneo' })
        } else {

            torneos.find({ nombre: params.nombre, idCategoria: categoria }).exec((err, torneoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (torneoEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: "Ya existe el nombre del torneo en esta categoria" })
                } else {

                    if (estaIniciado === false) {

                        torneos.findByIdAndUpdate(idTorneo, params, { new: true }, (err, torneoEditado) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion 2" })
                            if (!torneoEditado) return res.status(500).send({ mensaje: "No se ha podido editar el torneo" })
                            if (torneoEditado) {
                                return res.status(200).send({ mensaje: "Torneo editado exitosamente" })
                            }
                        })

                    } else {
                        return res.status(500).send({ mensaje: 'No se puede editar un torneo ya iniciado' })
                    }
                }
            })
        }

    })
}

function eliminarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;
    var estaIniciado;

    if (req.user.rol != "ROL_ADMINAPP") {
        return res.status(500).send({ mensaje: "Solo el ADMIN puede eliminar un torneo" })
    }

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (torneoEncontrado) {
            estaIniciado = torneoEncontrado.iniciado;
        } if (!torneoEncontrado) {
            return res.status(404).send({ mensaje: 'No existe el torneo' })
        } else {

            if (estaIniciado === false) {

                equipos.update({ torneo: idTorneo }, {
                    $set: {
                        torneo: null
                    }
                }, { new: true }, (err, equipoEditado) => {
                    console.log("Aqui pasa")
                    if (err) { return res.status(500).send({ mensaje: 'Error al actualizar el equipo' }) };
                    if (!equipoEditado) { return res.status(500).send({ mensaje: "Error al eliminar" }) }

                    torneos.findByIdAndDelete(idTorneo, (err, torneoEliminado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if (!torneoEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el torneo" });
                        if (torneoEliminado) {
                            return res.status(200).send({ mensaje: "El torneo se ha eliminado" });
                        }
                    })
                })
            } else {
                return res.status(500).send({ mensaje: 'No se puede eliminar un torneo ya iniciado' })
            }
        }
    })
}

function unirEquipos(req, res) {
    var idTorneo = req.params.idTorneo;
    var params = req.body;

    if (req.user.rol != "ROL_ADMINAPP") {
        return res.status(500).send({ mensaje: "Solo el ADMIN puede agregar equipos a un torneo" })
    }

    if (!params.equipoId) {
        return res.status(500).send({ mensaje: 'Datos incorrectos o incompletos' });
    }

    equipos.findOne({ _id: params.equipoId }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el equipo' });
        if (equipoEncontrado) {
            var cantidadIntegrantes = equipoEncontrado.integrantes;
        }
        if (!equipoEncontrado) {
            return res.status(500).send({ mensaje: 'El equipo no existe' });
        } else {

            torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
                if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El torneo no existe' });
                var empezado = torneoEncontrado.iniciado;
                var cantidadEquipos = torneoEncontrado.equipos;

                if (cantidadIntegrantes.length >= 5 && cantidadIntegrantes.length <= 10) {

                    if (empezado === false) {

                        if (cantidadEquipos.length < 10) {

                            torneos.findByIdAndUpdate(idTorneo, {
                                $push: {
                                    equipos: {
                                        idEquipo: params.equipoId
                                    }
                                }
                            }, { new: true }, (err, torneoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                if (!torneoActualizado) return res.status(500).send({ mensaje: 'No se ha podido agregar el equipo' })

                                equipos.update({ _id: params.equipoId }, {
                                    $set: {
                                        torneo: idTorneo
                                    }
                                }, { new: true }, (err, equipoActualizado) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                    if (!equipoActualizado) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                    return res.status(200).send({ mensaje: 'Equipo unido' })
                                })
                            })
                        } else {
                            return res.status(500).send({ mensaje: 'Maximo de equipos completado (10)' });
                        }
                    } else {
                        return res.status(500).send({ mensaje: 'Ya no se puede unir equipos, el torneo ya inicio' });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'El equipo no tiene los integrantes necesarios min:5 o max:10 para unirlo al torneo' });
                }
            })
        }
    })
}

function equiposTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El torneo no existe' })

        equipos.find({ torneo: idTorneo }).sort({ puntos: -1 }).exec((err, equiposEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener los equipos' });
            if (equiposEncontrado.length === 0) {
                return res.status(500).send({ mensaje: 'No hay equipos en este torneo' });
            }
            return res.status(200).send({ equiposEncontrado });
        })
    })
}

function unirMiEquipo(req, res) {
    var idTorneo = req.params.idTorneo;
    var idUsuario = req.params.idUsuario;

    equipos.findOne({ dueño: idUsuario }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error' });
        if (!equipoEncontrado) return res.status(500).send({ mensaje: 'El usuario no es dueño de ningun equipo' });
        var idEquipos = equipoEncontrado._id;
        var categoriaEquipo = equipoEncontrado.categoria;
        var torneoEquipo = equipoEncontrado.torneo;
        var integrantesEquipo = equipoEncontrado.integrantes;

        torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error' });
            if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El torneo no existe' });
            var categoriaTorneo = torneoEncontrado.idCategoria;
            var cantidadEquipos = torneoEncontrado.equipos;
            var empezado = torneoEncontrado.iniciado;

            categorias.findOne({ _id: categoriaEquipo }).exec((err, categoriaEncontradaE) => {
                var categoriaE = categoriaEncontradaE.nombre;

                categorias.findOne({ _id: categoriaTorneo }).exec((err, categoriaEncontradaT) => {
                    var categoriaT = categoriaEncontradaT.nombre;

                    if (categoriaT === categoriaE) {

                        if (torneoEquipo === null) {
                            
                            if (integrantesEquipo.length >= 5 && integrantesEquipo.length <= 10) {

                                if (cantidadEquipos.length < 10) {

                                    if (empezado === false) {

                                        torneos.findByIdAndUpdate(idTorneo, {
                                            $push: {
                                                equipos: {
                                                    idEquipo: idEquipos
                                                }
                                            }
                                        }, { new: true }, (err, torneoActualizado) => {
                                            if (err) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                            if (!torneoActualizado) return res.status(500).send({ mensaje: 'No te has podido unir al torneo' })

                                            equipos.update({ _id: idEquipos }, {
                                                $set: {
                                                    torneo: idTorneo
                                                }
                                            }, { new: true }, (err, equipoActualizado) => {
                                                if (err) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                                if (!equipoActualizado) return res.status(500).send({ mensaje: 'Error en al peticion' });
                                                return res.status(200).send({ mensaje: 'Bienvenido al torneo' })
                                            })
                                        })
                                    } else {
                                        return res.status(500).send({ mensaje: 'Ya no se puede unir equipos, el torneo ya inicio' });
                                    }
                                } else {
                                    return res.status(500).send({ mensaje: 'Maximo de equipos completado (10)' });
                                }
                            } else {
                                return res.status(500).send({ mensaje: 'El equipo no tiene los integrantes necesarios min:5 o max:10 para unirlo al torneo' });
                            }
                        } else {
                            return res.status(500).send({ mensaje: 'El equipo ya pertenece a un torneo' });
                        }
                    } else {
                        return res.status(500).send({ mensaje: 'El equipo no pertenece a las misma categoria que el torneo' });
                    }
                })
            })
        })
    })
}

function iniciarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: "El torneo no existe" })
        var empezado = torneoEncontrado.iniciado;
        var cantidadEquipos = torneoEncontrado.equipos;
        var cantidad = cantidadEquipos.length;

        if (empezado === false) {

            if (cantidad === 0) {
                return res.status(500).send({ mensaje: "No hay ningun equipo en el torneo" })
            }

            if (cantidad % 2 === 0) {

                torneos.update({ _id: idTorneo }, {
                    $set: {
                        iniciado: true
                    }
                }, { new: true }, (err, torneoActualizado) => {
                    if (err) return res.status(500).send({ mensaje: "Error" });
                    if (!torneoActualizado) return res.status(500).send({ mensaje: 'El torneo no se ha podido iniciar' })
                    return res.status(200).send({ mensaje: 'Torneo Iniciado' })
                })

            } else {
                return res.status(500).send({ mensaje: "La cantidad de equipos debe ser par, para iniciar el torneo" });
            }
        } else {
            return res.status(500).send({ mensaje: "El torneo no se puede iniciar, porque ya se inicio" });
        }
    })
}

function terminarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: "El torneo no existe" })
        var empezado = torneoEncontrado.iniciado;
        var fin = torneoEncontrado.terminado;
        var cantidadEquiposT = torneoEncontrado.equipos;
        var nombreT = torneoEncontrado.nombre;
        var imagenT = torneoEncontrado.imagen;
        var cantidad = cantidadEquiposT.length;

        if (empezado === true) {

            if (fin === false) {

                var fechasJugar = cantidad - 1;

                equipos.find({ pj: fechasJugar, torneo: idTorneo }).exec((err, equiposEncontrados) => {
                    if (err) return res.status(500).send({ mensaje: "Error" });
                    var cantidadEquiposE = equiposEncontrados.length;

                    if (cantidad === cantidadEquiposE) {

                        equipos.findOne({ torneo: idTorneo, puntos: { $gt: 1 } }).sort({ puntos: -1 }).limit(1).exec((err, equipoEncontrado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error' });
                            if (!equipoEncontrado) return res.status(500).send({ mensaje: 'No hay puntos' });
                            if (equipoEncontrado && equipoEncontrado.length === 0) return res.status(500).send({ mensaje: 'No hay puntos sufucientes' })
                            var idCampeon = equipoEncontrado._id;

                            equipos.update({ torneo: idTorneo }, {
                                $set: {
                                    puntos: 0,
                                    pj: 0,
                                    torneo: null
                                }
                            }, { multi: true }, (err, equipoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error al actualizar el equipo' });
                                if (!equipoActualizado) return res.status(500).send({ mensaje: 'Error con los equipos' });

                                equipos.findByIdAndUpdate(idCampeon, {
                                    $push: {
                                        torneosG: {
                                            torneoId: idTorneo,
                                            nombreTorneo: nombreT,
                                            imagenTorneo: imagenT
                                        }
                                    }
                                }, { new: true }, (err, equipoPush) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error al actualizar el equipo Campeon' });
                                    if (!equipoPush) return res.status(500).send({ mensaje: 'Error con el equipo Campeon' });

                                    torneos.update({ _id: idTorneo }, {
                                        $set: {
                                            terminado: true,
                                            campeon: idCampeon
                                        }
                                    }, { new: true }, (err, torneoActualizado) => {
                                        if (err) return res.status(500).send({ mensaje: "Error" });
                                        if (!torneoActualizado) return res.status(500).send({ mensaje: 'El torneo no se ha podido terminar' })
                                        return res.status(200).send({ mensaje: 'Torneo Terminado' })
                                    })
                                })
                            })
                        })

                    } else {
                        return res.status(500).send({ mensaje: "Algunos equipos no han jugado todas las jornadas" });
                    }
                })
            } else {
                return res.status(500).send({ mensaje: "No ser puede terminar, porque ya termino el torneo" });
            }
        } else {
            return res.status(500).send({ mensaje: "No se puede terminar un torneo no iniciado" });
        }
    })
}

function equiposSinTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El torneo no existe' })
        var categoriaTorneo = torneoEncontrado.idCategoria;

        equipos.find({ torneo: null, categoria: categoriaTorneo }).exec((err, equiposEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener los equipos' });
            if (equiposEncontrados.length === 0) return res.status(500).send({ mensaje: 'No hay ningun equipo disponible' });
            return res.status(200).send({ equiposEncontrados });
        })
    })
}

function eliminarImgTorneo(res, rutaArchivo, mensaje) {

    fs.unlink(rutaArchivo, (err) => {
        return res.status(500).send({ mensaje: mensaje })
    })
}

function subirImgTorneo(req, res) {
    var idTorneo = req.params.idTorneo

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: "El torneo no existe" })

        if (req.user.rol != 'ROL_ADMINAPP') {
            return res.status(500).send({ mensaje: "Solo el ADMIN puede poner foto" })
        } else {

            if (req.files) {

                var direccionArchivo = req.files.imagen.path;

                var direccion_split = direccionArchivo.split('\\');

                var nombre_archivo = direccion_split[3];

                var extension_archivo = nombre_archivo.split('.');

                var nombre_extension = extension_archivo[1].toLowerCase();

                if (nombre_extension === 'png' || nombre_extension === 'jpg' || nombre_extension === 'gif') {

                    torneos.findByIdAndUpdate(idTorneo, { imagen: nombre_archivo }, { new: true }, (err, torneoEncontrado) => {
                        return res.status(200).send({ torneoEncontrado });
                    })
                } else {

                    return eliminarImgTorneo(res, direccionArchivo, 'Tipo de imagen no permitida');
                }
            } else {
                return res.status(500).send({ mensaje: "No se ha subido ningun archivo" })
            }
        }
    })
}

function obtenerImgTorneo(req, res) {
    var nombreImagen = req.params.imagen;
    var rutaArchivo = `./src/imagenes/torneos/${nombreImagen}`;

    //Funcion para obtener la imagen en archivo
    fs.access(rutaArchivo, ((err) => {
        if (err) {
            return res.status(500).send({ mensaje: "No existe la imagen" });
        } else {
            return res.sendFile(path.resolve(rutaArchivo));
        }
    }))
}

function campeon(req, res) {
    var idTorneo = req.params.idTorneo;

    torneos.findOne({ _id: idTorneo }).exec((err, torneoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener el torneo' });
        if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El torneo no existe' })
        var idCampeon = torneoEncontrado.campeon;

        equipos.findOne({ _id: idCampeon }).exec((err, campeonEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener al campeon' });
            if (!torneoEncontrado) return res.status(500).send({ mensaje: 'El equipo no existe' })
            return res.status(200).send({campeonEncontrado})
        })
    })
}

function obtenerUsuarioId(req, res) {
    var usuarioId = req.params.id;

    Usuario.findById(usuarioId, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuario' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el Usuario.' });
        return res.status(200).send({ usuarioEncontrado });
    }).populate('equipos')
}


function BuscarCampeonatos(req,res){
    var idEquipo = req.params.id

    torneos.find({campeon:idEquipo}).exec((err,EquipoEncontrado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"})
        if(!EquipoEncontrado) return res.status(500).send({ mensaje:"No tiene torneos ganados"})
        return res.status(200).send({EquipoEncontrado})
    })
}



module.exports = {
    registrarTorneo,
    torneosCategoria,
    torneoId,
    editarTorneo,
    eliminarTorneo,
    unirEquipos,
    equiposTorneo,
    iniciarTorneo,
    terminarTorneo,
    unirMiEquipo,
    equiposSinTorneo,
    campeon,
    obtenerUsuarioId,
    subirImgTorneo,
    obtenerImgTorneo,
    BuscarCampeonatos
}