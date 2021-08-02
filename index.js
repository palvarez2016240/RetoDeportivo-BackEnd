const mongoose = require("mongoose")
const app = require("./app")
var admin = require("./src/Controladores/Usuarios.controlador")
var categoria = require("./src/Controladores/Categoria.controlador")

mongoose.Promise = global.Promise
mongoose.connect('mongodb+srv://ADMIN:123@dbretodeportivo.khnyy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    admin.admin(),
    categoria.CrearCategoria1(),
    categoria.CrearCategoria2(),
    categoria.CrearCategoria3(),

    app.listen(process.env.PORT || 3000, function (){
        console.log("Reto Deportivo esta corriendo satisfactoriamente");
    })
}).catch(err => console.log(err))