const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./db/config');
require('dotenv').config();


//Crear el servidor/aplicación express
const app = express();

//conexión de base de datos
dbConnection();

//Directorio publico
app.use ( express.static ('public'));

//cors
app.use ( cors() );

//lectura y parseo del body
app.use ( express.json() );

//rutas
app.use( '/api/auth', require('./routes/auth') );

app.listen(process.env.PORT, () => {
    console.log (`Servidor corriendo en puerto ${ process.env.PORT }`);   
});
