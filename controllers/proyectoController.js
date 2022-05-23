import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) =>{
    const proyectos = await Proyecto.find({
        $or: [
            {colaboradores : {$in: req.usuario}},
            {creador : {$in: req.usuario}}
        ]
    }).select("-tareas");
    res.json(proyectos)
};

const nuevoProyecto = async (req, res) => {
    
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try{
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado);
    }catch(error){
        console.log(error);
    }

};

const obtenerProyecto = async (req, res) => {
    const {id} = req.params;

    //Validar el id para que no me de el error de "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid){
        const error = new Error('Proyecto no Existe')
        return res.status(404).json({msg:error.message})
    }

    //*Como para el front extraigo solo el id de 'tarea' y de 'colaboradores' para traer todo el objeto necesito hacer este populate.
    const proyecto = await Proyecto.findById(id).populate({path: 'tareas', populate:{ path: 'completado', select: 'nombre email' }}).populate('colaboradores', 'nombre email'); 

  if(!proyecto){
      const error = new Error('Proyecto no Existe')
      return res.status(404).json({msg: error.message});
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString() )){
    const error = new Error('Accion no Válida')
    return res.status(401).json({msg: error.message});
  }    

    res.json(proyecto);

};

const editarProyecto = async (req, res) => {
    const {id} = req.params;

    //Validar el id para que no me de el error de "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid){
        const error = new Error('Proyecto no Existe')
        return res.status(404).json({msg:error.message})
    }

    const proyecto = await Proyecto.findById(id); 

  if(!proyecto){
      const error = new Error('Proyecto no Existe')
      return res.status(404).json({msg: error.message});
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('Accion no Válida')
    return res.status(401).json({msg: error.message});
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try{  
      const proyectoAlmacenado = await proyecto.save();
      res.json(proyectoAlmacenado);
      
  }catch(error){
    console.log(error);
  }


};

const eliminarProyecto = async (req, res) => {
    const {id} = req.params;

    //Validar el id para que no me de el error de "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    const valid = mongoose.Types.ObjectId.isValid(id);

    if(!valid){
        const error = new Error('Proyecto no Existe')
        return res.status(404).json({msg:error.message})
    }

    const proyecto = await Proyecto.findById(id); 

  if(!proyecto){
      const error = new Error('Proyecto no Existe')
      return res.status(404).json({msg: error.message});
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('Accion no Válida')
    return res.status(401).json({msg: error.message});
  }

  try{
        await proyecto.deleteOne();
        res.json({msg:"Proyecto Eliminado"})
  }catch(error){
      console.log(error);
  }
};

const buscarColaborador = async (req, res) => {
  
    const { email } = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v");

    if(!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ msg: error.message });
    }
    res.json(usuario);
    
};


const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto) {
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg:error.message});
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(404).json({msg:error.message});
    }

    const { email } = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v");

    if(!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ msg: error.message });
    }

    // console.log(proyecto.creador.toString())
    // console.log(usuario._id.toString())

    //El colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error("El creador del proyecto no puede ser colaborador");
        return res.status(404).json({ msg: error.message });
    }
    //Comprobar si el usuario ya existe en el proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El Usuario ya Pertenece al Proyecto");
        return res.status(404).json({ msg: error.message });
    }

    //Si todo está bien, agregamos al usuario
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({msg:"Colaborador Agregado Correctamente"})

};

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto) {
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg:error.message});
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return res.status(404).json({msg:error.message});
    }

    //Si todo está bien, eliminamos al colaborador
    proyecto.colaboradores.pull(req.body.id);

    await proyecto.save();
    res.json({msg:"Colaborador Eliminado Correctamente"})

};

export {
    nuevoProyecto,
    editarProyecto,
    obtenerProyecto,
    eliminarProyecto,
    obtenerProyectos,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
    
}

 