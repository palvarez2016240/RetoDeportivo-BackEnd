'use strict'

var Equipo = require('../Modelos/Equipos.model')
var Usuario = require('../Modelos/Usuarios.model')

function CrearEquipo(req, res) {

    var params = req.body
    var EquipoModel = new Equipo()

    if (req.user.rol === "ROL_ADMINAPP") {
        return res.status(500).send({ message: "No posee el permiso de crear un equipo" })
    } else {

        if (params.nombre && params.categoria) {

            EquipoModel.nombre = params.nombre
            EquipoModel.dueño = req.user.sub
            EquipoModel.categoria = params.categoria
            EquipoModel.puntos = 0
            EquipoModel.pj = 0
            EquipoModel.torneoJ = false


            Equipo.find({
                $or: [
                    { nombre: EquipoModel.nombre },
                    { dueño: EquipoModel.dueño }
                ]
            }).exec((err, EquipoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: "error en la peticion" })
                if (EquipoEncontrado && EquipoEncontrado.length >= 1) {
                    return res.status(200).send({ mensaje: "Nombre repetido o ya tiene un equipo registrado" })
                } else {
                    EquipoModel.save((err, EquipoCreado) => {
                        if (err) return res.status(500).send({ message: "Error en la peticion de agregar usuario" })

                        if (!EquipoCreado) return res.status(500).send({ message: "Error al crear el equipo" })
                        if (EquipoCreado) {

                            Usuario.update({ _id: req.user.sub }, { $set: { rol: "ROL_COACH" } }, { new: true }, (err, UserActualizado) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                                if (!UserActualizado) return res.status(500).send({ mensaje: "Error al actualizar al usuario" })
                                return res.status(200).send({ EquipoCreado })
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

function AgregarMiembro(req, res) {
    var params = req.body
    var equipoID = req.params.id
    var idCoach;
    if (params.usuario) {

        Equipo.findOne({ dueño: req.user.sub }).exec((err, EquipoEncontrado) => {
            idCoach = EquipoEncontrado.dueño
            if (err) return res.status(500).send({ mensaje: "error en la peticion" })
            if (!EquipoEncontrado) return res.status(500).send({ mensaje: "No es dueño de un equipo" })

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
    var idCoach = req.user.sub
    var iddueño;



    Equipo.findOne({ dueño: req.user.sub }).exec((err, EquipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
        if (!EquipoEncontrado) return res.status(500).send({ mensaje: "No es dueño de un equipo" })
        var idEquipo = EquipoEncontrado._id
        iddueño = EquipoEncontrado.dueño


        
        Usuario.findOne({ equipos: idEquipo }).exec((err, UsuarioEncontrado) => {
            idCoach.toString()
            iddueño.toString()
            if (err) return res.status(500).send({ mensaje: "Error en la peticion " })
            if (!UsuarioEncontrado) return res.status(500).send({ mensaje: "El usuario no existe" })

            if (iddueño == idCoach) {
                Equipo.findOneAndUpdate({ "integrantes._id": UsuarioID }, { $pull: { integrantes: { _id: UsuarioID } } }, { new: true },
                    (err, EquipoActualizado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de eliminar al miembro del equipo" })
                        if (!EquipoActualizado) return res.status(500).send({ mensaje: "No existe el miembro que desea eliminar" })
                        return res.status(200).send({ EquipoActualizado })
                    })
            } else {
                return res.status(500).send({ mensaje: "Solo el dueño del equipo puede eliminar a miembros" })
            }

        })
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

    Equipo.findByIdAndUpdate(idEquipo,params,{new:true},(err,EquipoActualizado)=>{

        var coach = EquipoActualizado.dueño
        var idDueño = req.user
        coach.toString()
        idDueño.toString()
        if(err) return res.status(500).send({mensaje:"Error en la peticion"})
        if(!EquipoActualizado) return res.status(500).send({mensaje:"Error al actualizar el equipo"})
        if(coach == idDueño){
            return res.status(200).send({EquipoActualizado})
        }else{
            return res.status(500).send({ mensaje: "No puede editar un equipo donde no sea dueño"})
        }
        
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
    })
}

module.exports = {
    CrearEquipo,
    AgregarMiembro,
    EliminarMiembro,
    EliminarEquipo,
    EditarEquipo,
    MostrarEquipo,
    MostarEquipoID
}