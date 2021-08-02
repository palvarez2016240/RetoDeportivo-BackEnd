'use strict'

var Equipo = require('../Modelos/Equipos.model')
var Usuario = require('../Modelos/Usuarios.model')

var fs = require('fs');
var path = require('path');

function CrearEquipo(req, res) {

    var idCategoria = req.params.id
    var params = req.body
    var EquipoModel = new Equipo()

    if (req.user.rol === "ROL_ADMINAPP") {
        return res.status(500).send({ mensaje: "No posee el permiso de crear un equipo" })
    } else {

        if(req.user.rol === "ROL_COACH"){
            return res.status(500).send({ message: "Solamente puede tener registrado un equipo"})
        } else{
            if (params.nombre) {

                EquipoModel.nombre = params.nombre
                EquipoModel.dueño = req.user.sub
                EquipoModel.categoria = idCategoria
                EquipoModel.puntos = 0
                EquipoModel.pj = 0
                EquipoModel.torneo = null
                EquipoModel.imagen = null
    
    
                Equipo.find({
                    $or: [
                        { nombre: EquipoModel.nombre },
                        { dueño: EquipoModel.dueño }
                    ]
                }).exec((err, EquipoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: "error en la peticion" })
                    if (EquipoEncontrado && EquipoEncontrado.length >= 1) {
                        return res.status(500).send({ mensaje: "Nombre repetido o ya tiene un equipo registrado" })
                    } else {
                        
                        
                        EquipoModel.save((err, EquipoCreado) => {
                            if (err) return res.status(500).send({ message: "Error en la peticion de agregar usuario" })
                            var idEquipoCreado = EquipoCreado._id
                            if (!EquipoCreado) return res.status(500).send({ message: "Error al crear el equipo" })
                            if (EquipoCreado) {
    
                                Usuario.update({ _id: req.user.sub }, { $set: { rol: "ROL_COACH",equipos:idEquipoCreado } }, { new: true }, (err, UserActualizado) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                                    if (!UserActualizado){
                                        return res.status(500).send({ mensaje: "Error al actualizar al usuario" })
                                    } else {

                                        Equipo.findByIdAndUpdate(idEquipoCreado, {
                                            $push: {
                
                                                integrantes: { usuario: req.user.sub }
                                            }
                                        }, { new: true }, (err, UsuarioAgregado) => {
                                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de guardar miembro de equipo" })
                                            if (!UsuarioAgregado) return res.status(500).send({ mensaje: "no se agrego el usuario" })
                                            return res.status(200).send({ EquipoCreado })
                                        })
                                    }
                                    
                                })
    
                            }
                        })
    
                    }
                })
    
    
            } else {
                return res.status(500).send({ mensaje: "Ingrese los campos necesarios" })
            }
        }

        
    }


}

function AgregarMiembro(req, res) {
    var params = req.body
    var equipoID = req.params.id
    var idCoach;
    if (params.usuario) {

        Equipo.findOne({ dueño: req.user.sub }).exec((err, EquipoEncontrado) => {
            
            if (err) return res.status(500).send({ mensaje: "error en la peticion" })
            if (!EquipoEncontrado) return res.status(500).send({ mensaje: "No es dueño de un equipo" })
            idCoach = EquipoEncontrado.dueño
            if (idCoach != req.user.sub) {

                return res.status(500).send({ mensaje: "No posee el permiso para agregar un miembro" })
            } else {

                Usuario.findById(params.usuario, (err, UsuarioEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: "error en la peticion" })
                    if (!UsuarioEncontrado) return res.status(500).send({ mensaje: "El usuario no existe" })
                    var userEn = UsuarioEncontrado.rol
                    var equipos = UsuarioEncontrado.equipos
                    var userID = UsuarioEncontrado._id

                    if (userEn === "ROL_USER" && equipos === null) {

                        Equipo.findByIdAndUpdate(equipoID, {
                            $push: {

                                integrantes: { usuario: params.usuario }
                            }
                        }, { new: true }, (err, UsuarioAgregado) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de guardar miembro de equipo" })
                            if (!UsuarioAgregado) return res.status(500).send({ mensaje: "no se agrego el usuario" })
                            if (UsuarioAgregado) {

                                Usuario.update({ _id: userID }, {
                                    $set: {
                                        equipos: equipoID
                                    }
                                }, { new: true }, (err, UserActualizado) => {

                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar user" })
                                    if (!UserActualizado) return res.status(500).send({ mensaje: "No se puedo actualizar el usuario" })
                                    return res.status(200).send({ UsuarioAgregado })
                                })

                            }
                        })


                    } else {
                        return res.status(500).send({ mensaje: "Es dueño de un equipo o ya pertenece a otro equipo" })

                    }
                })

            }
        })

    } else {
        return res.status(500).send({ mensaje: "Ingrese el dato" })
    }
}

function EliminarMiembro(req, res) {

    var UsuarioID = req.params.id
   
    Equipo.findOneAndUpdate({ "integrantes.usuario": UsuarioID }, { $pull: { integrantes: { usuario: UsuarioID } } }, { new: true },
    (err, EquipoActualizado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion de eliminar al miembro del equipo" })
        if (!EquipoActualizado){
            return res.status(500).send({ mensaje: "No existe el miembro que desea eliminar" })
        }else{
            Usuario.update({ _id: UsuarioID }, {
                $set: {
                    equipos: null
                }
            }, { new: true }, (err, UserActualizado) => {

                if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar user" })
                if (!UserActualizado) return res.status(500).send({ mensaje: "No se puedo actualizar el usuario" })
                return res.status(200).send({ EquipoActualizado })
            })
            
            
        }   
        
    })
    
}

function EliminarEquipo(req, res) {
    var idEquipo = req.params.id
    var coach

    Equipo.findById(idEquipo, (err, EquipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
        if (!EquipoEncontrado) return res.status(500).send({ mensaje: "El equipo no existe" })
        coach = EquipoEncontrado.dueño
        
        var user = req.user.sub

        user.toString()
        coach.toString()
        
        if (coach == user) {
           Equipo.findByIdAndDelete(idEquipo,(err,EquipoEliminado)=>{
               if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
               if(!EquipoEliminado){

                return res.status(500).send({ mensaje:"Error al eliminar el equipo"})
               } else {

                Usuario.updateMany({equipos: idEquipo},{$set:{equipos: null}},{multi:true},(err,UsuarioActualizado)=>{

                    if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                    if(!UsuarioActualizado) return res.status(500).send({ mensaje:"Error al actualizr Usuario"})

                    return res.status(200).send({EquipoEliminado})
                })
                
               }
             
              


           })
        } else {
            return res.status(200).send({ mensaje: "No puede elimiar un equipo donde no sea dueño " })
        }
    })
}

function EditarEquipo(req,res){

    var idEquipo = req.params.id
    var params = req.body

    Equipo.findByIdAndUpdate(idEquipo,params,{new:true},(err,EquipoActualizado)=>{

        if(err) return res.status(500).send({mensaje:"Error en la peticion"})
        if(!EquipoActualizado) return res.status(500).send({mensaje:"Error al actualizar el equipo"})
        
            return res.status(200).send({EquipoActualizado})
        
        
    })

}

function MostrarEquipo(req,res){

    Equipo.find().exec((err,EquipoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"})
        if(!EquipoEncontrado) return res.status(500).send({mensaje: "No se han agregado Equipos"})
        return res.status(200).send({EquipoEncontrado})
    })
}

function MostarEquipoID(req,res){
    var idEquipo = req.params.id

    Equipo.findById(idEquipo,(err,EquipoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
        if(!EquipoEncontrado) return res.status(500).send({ mensaje: "El equipo no existe" })
        return res.status(200).send({EquipoEncontrado})
    }).populate('categoria','nombre').populate('torneo','nombre').populate('integrantes.usuario', 'nombres , rol')
}

function BuscarEquipoCategoria(req,res){

    var idCategoria = req.params.id

    Equipo.find({categoria: idCategoria}).populate('integrantes.usuario','nombres' ).exec((err, EquipoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
        if(!EquipoEncontrado) return res.status(500).send({ mensaje: "No existen equipos en esta categoria"})
        console.log(EquipoEncontrado._id)
        return res.status(200).send({ EquipoEncontrado})
    })
}

function BuscarTeam (req,res){
    var idEquipo = req.params.id
    Usuario.find({equipos: idEquipo}).exec((err,TeamEcontrado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"})
        if(!TeamEcontrado) return res.status(500).send({ mensaje: "No hay miembros en el equipo"})
        return res.status(200).send({TeamEcontrado})
    })
}

function subirImg(req, res) {
    var equipo = req.params.id

    torneos.findOne({ _id: equipo }).exec((err, ImagenSubida) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!ImagenSubida) return res.status(500).send({ mensaje: "El torneo no existe" })

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

                    torneos.findByIdAndUpdate(equipo, { imagen: nombre_archivo }, { new: true }, (err, ImagenSubida) => {
                        return res.status(200).send({ ImagenSubida });
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

function obtenerImg(req, res) {
    var nombreImagen = req.params.imagen;
    var rutaArchivo = `./src/imagenes/equipos/${nombreImagen}`;

    //Funcion para obtener la imagen en archivo
    fs.access(rutaArchivo, ((err) => {
        if (err) {
            return res.status(500).send({ mensaje: "No existe la imagen" });
        } else {
            return res.sendFile(path.resolve(rutaArchivo));
        }
    }))
}

function obtenerUsuario(req,res){

    Usuario.find({equipos:null,rol:"ROL_USER"}).exec((err,UsuarioEncontrado) =>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"})
        if(!UsuarioEncontrado) return res.status(500).send({mensaje: "No existen usuarios"})
        if(UsuarioEncontrado) return res.status(200).send({ UsuarioEncontrado})
    })
}


function unirAEquipo(req, res) {
    var idEquipo = req.params.id;
    var idUsuario = req.params.idUsuario;

    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error' });
        if (!equipoEncontrado){
            return res.status(500).send({ mensaje: 'El usuario no es dueño de ningun equipo' });
        }else {

            Usuario.findById(idUsuario, (err, UsuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: "error en la peticion" })
                if (!UsuarioEncontrado) return res.status(500).send({ mensaje: "El usuario no existe" })
                var userEn = UsuarioEncontrado.rol
                var equ = UsuarioEncontrado.equipos
                var userID = UsuarioEncontrado._id

                if (userEn === "ROL_USER" && equ === null) {

                    Equipo.findByIdAndUpdate(idEquipo, {
                        $push: {

                            integrantes: { usuario: idUsuario }
                        }
                    }, { new: true }, (err, UsuarioAgregado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de guardar miembro de equipo" })
                        if (!UsuarioAgregado) return res.status(500).send({ mensaje: "no se agrego el usuario" })
                        if (UsuarioAgregado) {

                            Usuario.update({ _id: userID }, {
                                $set: {
                                    equipos: idEquipo
                                }
                            }, { new: true }, (err, UserActualizado) => {

                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar user" })
                                if (!UserActualizado) return res.status(500).send({ mensaje: "No se puedo actualizar el usuario" })
                                return res.status(200).send({ UsuarioAgregado })
                            })

                        }
                    })


                } else {
                    return res.status(500).send({ mensaje: "Ya se ha unido a un equipo" })

                }
            })
        } 

                

        
    })
}





module.exports = {
    CrearEquipo,
    AgregarMiembro,
    EliminarMiembro,
    EliminarEquipo,
    EditarEquipo,
    MostrarEquipo,
    MostarEquipoID,
    BuscarEquipoCategoria,
    BuscarTeam,
    subirImg,
    obtenerImg,
    obtenerUsuario,
    unirAEquipo,

}