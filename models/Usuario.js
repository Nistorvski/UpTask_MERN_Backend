import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const usuarioSchema = mongoose.Schema({
    nombre:{
        type:String,
        reqired:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    token:{
        type:String
    },
    confirmado:{
        type:Boolean,
        default:false,
    },
},
{
    timestamps:true,
});

//HASHEAR LA CONTRASEÑAAA
// usuarioSchema.pre("save", async function(next) {

//     if(!this.isModified("password"));{
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

//COMPROBAR SI LA CONTRASEÑA ES CORRECTA
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
     console.log('Contraseñaa comparada')
    return await bcrypt.compare(passwordFormulario, this.password);
   
}



const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;