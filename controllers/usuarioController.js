import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import bcrypt from "bcrypt";
import {emailRegistro, emailOlvidePassword}  from '../helpers/email.js';

const registrar = async (req, res) => {
  const { email } = req.body;

  //Coprobar que el usuario existe
  const existeUsuario = await Usuario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    let usuario = new Usuario(req.body);
    usuario.token = generarId();

    let passHash = await bcrypt.hash(usuario.password, 8);

    usuario.password = passHash;

   await usuario.save();

   const {email, token, nombre} = usuario

   emailRegistro({
     email,
     nombre,
     token
   })

    res.json({ msg: 'Usuario Creado Correctamente. Revisa tu Email para revisar tu cuenta' });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  //Coprobar si el usuario existe

  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  //Comprobar si el usuario está confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({ msg: error.message });
  }

  //Comprobar su password

  if (await usuario.comprobarPassword(password)) {
    res.status(200).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("La contraseña es incorecta");
    return res.status(403).json({ msg: error.message });
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no valido");
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario Confirmado Correctamente" });
  } catch (error) {
    console.log(error);
  }

  console.log(usuarioConfirmar);
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  //Coprobar que el usuario existe
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    await usuario.save();


  //Enviar Email para recuperar password
  const {email, token, nombre} = usuario

  emailOlvidePassword({
    email,
    nombre,
    token
  })

    res.json({ msg: "Hemos enviado un eail con las instruncciones" });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {

    const {token} = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if(tokenValido){
       res.json({msg:"token válido y el usuario existe"});
    }else{
        const error = new Error("Token no valido");
        return res.status(404).json({ msg: error.message });
    }

};

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({ token });

    if(usuario){

        let passHash = await bcrypt.hash(password, 8);
        usuario.password = passHash;    
        usuario.token ='';

        try{
            await usuario.save();
            res.json({msg:"Password modificado correctamente"});
        }catch(error){
            console.log(error);
        }       
     }else{
         const error = new Error("Token no valido");
         return res.status(404).json({ msg: error.message });
     }

    };

    const perfil = async (req, res) => {
           
        const {usuario} = req;

        res.json(usuario);
    }

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil };
