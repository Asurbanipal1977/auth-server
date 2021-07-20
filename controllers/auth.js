const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require ('../helpers/jwt');

const crearUsuario =
    
    async (req, res = response) => {
        const {email, name, password} = req.body;

        try {
            //verificar el email
            let usuario = await Usuario.findOne({email});
            if ( usuario )
            {
                return res.status(400).json (
                    {ok: false,
                     msg: 'El usuario ya existe' 
                    });
            }

            //Crear usuario con el modelo
            const dbUser  = new Usuario ( req.body );

            //encriptar la contraseña
            const salt = bcrypt.genSaltSync();
            dbUser.password = bcrypt.hashSync( password, salt );

            //generar el JWT (json web token)
            const token = await generarJWT(dbUser.id, name);

            //crear el usuario de base datos
            await dbUser.save();

            //generar la respuesta exitosa
            return res.status(201).json (
                {ok: true,
                 uid:dbUser.id,
                 name,
                 email,
                 token
                });

        } catch (error) {
            console.log(error);
            return res.status(500).json (
                {ok: false,
                 msg: 'Por favor hable con el administrador' 
                });
        }
    };

const loginUsuario = 
    async (req, res = response) => {
        const {email, password} = req.body;

        try{
            const dbUser = await Usuario.findOne({email});
            if ( !dbUser ) {
                return res.status(400).json (
                    {ok: false,
                    msg: 'El correo no existe' 
                    });
            }

            //COnfirmar si el password hace match
            const validPassword = bcrypt.compareSync( password, dbUser.password);
            if ( !validPassword ) {
                return res.status(400).json (
                    {ok: false,
                    msg: 'El password no coincide' 
                    });
            }

            //Generar el json web token
             const token = await generarJWT(dbUser.id, dbUser.name);

             return res.json (
                {ok: true,
                uid: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                token
                });

        }
        catch (error)
        {
            console.log(error);
            return res.status(500).json (
                {ok: false,
                msg: 'Hable con el administrador' 
                });
        }
    };

const revalidarToken = async (req, res = response) => {


    try {
        const { uid } = req;

        //leer la base datos
        const dbUser = await Usuario.findById(uid);

        //Generar el json web token
        const token = await generarJWT(uid, dbUser.name);
    
        return res.json (
            {ok: true,
             uid,
             name: dbUser.name,
             email: dbUser.email,
             token
            });

    } catch (error) {
        return res.status(500).json (
            {ok: false,
            msg: 'Hable con el administrador' 
            });
    }
   
}


module.exports = {
    crearUsuario, loginUsuario,revalidarToken
}