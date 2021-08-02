'use strict'

var Usuario = require("../Modelos/Usuarios.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../Servicios/jwt');
var fs = require('fs');
var path = require('path');

function admin(req, res) {
    //se crea el administrador predeterminado de la aplicación
    Usuario.findOne({ usuario: "ADMIN" }, (err, buscandoAdmin) => {
        if (err) {
            console.log("Error al verificar ADMIN");
        } else if (buscandoAdmin) {
            console.log("El usuario ADMIN ya existe");
        } else {
            let UsuaM = new Usuario();
            bcrypt.hash("123", null, null, (err, passwordEncripado) => {
                if (err) {
                    console.log("Error al encriptar la contraseña");
                } else if (passwordEncripado) {
                    UsuaM.usuario = "ADMIN";
                    UsuaM.email = "admin@gmail.com"
                    UsuaM.password = passwordEncripado;
                    UsuaM.rol = "ROL_ADMINAPP";
                    UsuaM.imagen = null;
                    UsuaM.save((err, usuarioGuardado) => {
                        if (err) {
                            console.log("Error al crear el ADMIN");
                        } else if (usuarioGuardado) {
                            console.log("Usuario ADMIN creado exitosamente");
                        } else {
                            console.log("No se a podido crear el usuario ADMIN");
                        }
                    })
                } else {
                    console.log("No se encriptó correctamente la contraseña");
                }
            })
        }
    })
}

function registrar(req, res) {
    var UsuaM = new Usuario();
    var params = req.body;

    if (params.nombres && params.email && params.password && params.apellidos && params.usuario && params.edad) {
        UsuaM.nombres = params.nombres;
        UsuaM.apellidos = params.apellidos;
        UsuaM.usuario = params.usuario;
        UsuaM.edad = params.edad;
        UsuaM.email = params.email;
        UsuaM.rol = "ROL_USER"
        UsuaM.imagen = null;
        UsuaM.equipos = null;
        if(params.edad < 6 || params.edad > 64  ){
            return res.status(500).send({ mensaje: "No puede registrarse por ser menor o mayor de 5 o 64 años"})
        }
        Usuario.find({
            $or: [{ usuario: UsuaM.usuario }, { email: UsuaM.email },]
        }).exec((err, userEncontrados) => {
            if (err) return res.status(500).send({ mensaje: "Error al intentar llamar a los Usuarios" });
            if (userEncontrados && userEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: "Utilize otro Usuario, el que ha ingresado ya existe" });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    UsuaM.password = passwordEncriptada;
                    UsuaM.save((err, userGuardado) => {
                        if (err) return res.status(500).send({ mensaje: "Error al ingresar un nuevo Usuari" });
                        if (userGuardado) {
                            res.status(200).send({ userGuardado })
                        } else {
                            res.status(500).send({ mensaje: "No se ha creado con exito el usuario" })
                        }
                    })
                })
            }
        })
    }else{
        return res.status(500).send({ mensaje: "Ingrese todos los datos"})
    }
}

function login(req, res) {
    //aqui los usuario prodran verificar sus credenciales para loguearse 
    let params = req.body;
    if (params.usuario && params.password) {
        Usuario.findOne({ usuario: params.usuario }, (err, userEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error al intentar llamar las credenciales" });
            if (userEncontrado) {
                bcrypt.compare(params.password, userEncontrado.password, (err, passwordVerificado) => {
                    if (passwordVerificado) {
                        if (params.getToken === 'true') {
                            return res.status(200).send({
                                token: jwt.createToken(userEncontrado)
                            })
                        } else {
                            userEncontrado.password = undefined;
                            return res.status(200).send({ userEncontrado });
                        }
                    } else {
                        return res.status(500).send({ mensaje: "Usuario o Email incorrectas" });
                    }
                })
            } else {
                return res.status(500).send({ mensaje: "El usuario no esta registrado" });
            }
        })
    }else{
        return res.status(500).send({ mensaje: "Ingrese todos los datos"})
    }
}

function editarUsuario(req, res){
    var UsuarioId = req.params.id;
    var params = req.body;
    delete params.password;
    if (req.user.sub != UsuarioId) {
        if (req.user.rol != 'ROL_ADMINAPP') { 
            return res.status(500).send({ mensaje: "No posee los permisos para editar el usuario" })
       }
    }
    Usuario.find({
        nombres: params.nombres,
        apellidos: params.apellidos,
        usuario: params.usuario,
        edad: params.edad,
        email: params.email,
    }).exec((err, UserEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la solicitud de Usuario" });
        if (UserEncontrado.length >= 1 && !params.rol) {
            return res.status(500).send({ mensaje: "Lo que desea modificar ya lo ha estado" })
        } else {
            Usuario.findOne({ _id: UsuarioId }).exec((err, userEncontrado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la solicitud ID de Usuario" });
                if (!userEncontrado) return res.status(500).send({ mensaje: "No se ha encotrado estos datos en la base de datos" });
                Usuario.findByIdAndUpdate(UsuarioId, params, { new: true }, (err, userActualizado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
                    if (!userActualizado) return res.status(500).send({ mensaje: "No se ha podido editar exitosamente el usuario" });
                    if (userActualizado) return res.status(200).send({ userActualizado })
                })
            })
        }
    })
}

function eliminarUsuario(req, res){
    var UsuarioId = req.params.id

    
    Usuario.findOne({ _id: UsuarioId }).exec((err, userEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
        if (!userEncontrado) return res.status(500).send({ mensaje: "No se han encontrado los datos" })
        if(userEncontrado.equipos != null){
            return res.status(500).send({ mensaje: "No puede eliminar el usuario ya que pertenece a un equipo"})
        }
       /* if(req.user.rol === "ROL_ADMINAPP"){
            return res.status(500).send({ mensaje: "No puede eliminar al administrador de la aplicacion"})
        }*/
        
        Usuario.findByIdAndDelete(UsuarioId, (err, userEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
            if (!userEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el usuario" });
            if (userEliminado) return res.status(200).send({userEliminado})
        })
    })
}

function obtenerUsuarios(req, res) {

    Usuario.find({}).exec((err, Usuarios) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar Usuarios' });
        if (!Usuarios) return res.status(500).send({ mensaje: 'Error al obtener todos los Usuarios.' });
        console.log(Usuarios)
        return res.status(200).send({ Usuarios })
    })
}

function obtenerUsuarioId(req, res) {
    var usuarioId = req.params.id;

    Usuario.findById(usuarioId, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuario' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el Usuario.' });
        return res.status(200).send({ usuarioEncontrado });
    })
}

function eliminarArchivo(res, rutaArchivo, mensaje) {
    fs.unlink(rutaArchivo, (err)=>{
        return res.status(500).send({ mensaje: mensaje})
    })
}

function subirImagen(req, res) {
    let UsuarioId = req.user.sub;
    if (req.files) {
        var direccionArchivo = req.files.imagen.path;

        // documentos/imagenes/foto.png  →  ['documentos', 'imagenes', 'foto.png'] recorta la ruta o texto
        var direccion_split = direccionArchivo.split('\\')

        // src\imagenes\usuarios\nombre_imagen.png ← Nombre del archivo
        var nombre_archivo = direccion_split[3];

        //obtener la extención de archivo = .png || .jpg || .gif
        var extension_archivo = nombre_archivo.split('.');

        //obtener el nombre de esa extensión 
        var nombre_extension = extension_archivo[1].toLowerCase();
        //aqui solo guardara los archivos con estas extenciones 
        if(nombre_extension === 'png' || nombre_extension === 'jpg' || nombre_extension === 'gif'){
            Usuario.findByIdAndUpdate(UsuarioId, { imagen:  nombre_archivo}, {new: true} ,(err, usuarioEncontrado)=>{
                return res.status(200).send({usuarioEncontrado});
            })
        }else{return eliminarArchivo(res, direccionArchivo, 'Extension, no permitida');
        }
    }
}

function obtenerImagen(req, res) {
    var nombreImagen = req.params.imagen;
    // se buscara el archivo con su nombre desde la ruta
    var rutaArchivo = `./src/imagenes/usuarios/${nombreImagen}`;
    fs.access(rutaArchivo, (err)=>{
        if (err) {
            return res.status(500).send({ mensaje: 'No existe esta la imagen' });
        }else{
            return res.sendFile(path.resolve(rutaArchivo));
        }
    })
}

module.exports={
    admin,
    registrar,
    login,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarios,
    obtenerUsuarioId,
    subirImagen,
    eliminarArchivo,
    obtenerImagen,

}