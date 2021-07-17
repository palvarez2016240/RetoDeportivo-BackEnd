const mongoose = require("mongoose")
const app = require("./app")

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/DBRetoDeportivo', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    app.listen(3000, function (){
        console.log("Reto Deportivo esta corriendo satisfactoriamente");
    })
}).catch(err => console.log(err))