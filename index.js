import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

//Usar las funciones de express
const app = express();
app.use(express.json());

//VAriables de entorno desde el archivo .env
dotenv.config();

//Conectar con la base de MongoDb
conectarDB();

//Configurar CORS
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      //Puede consultar la API
      callback(null, true);
    } else {
      //NO esta ermitido hacer el request
      callback(new Error("Error de Cors"));
    }
  },
};

app.use(cors(corsOptions));

//Routing ****(Importante usar las comillas dobles para las rutas...!!!!!)********
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

//Coneccion al puerto del serviodor
const PUERTO = process.env.PORT || 4001;

const servidor = app.listen(PUERTO, () => {
  console.log("Servidor corriendo en el puerto " + PUERTO);
});

//Soket.io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectando a soket.io desde backend");

  // //Definir los eventos de socket.io
  //         //*.emit para emitir un "mensaje" enviar un dato etc-- y .on para responder a ese emit..Más o menos es así..Lo de abajo es solo un ejemplo,ya lo siguiente será un uso real.
  //     // socket.on('prueba', () => {
  //     //     console.log('Prueba desde Socket io');
  //     // })

  //     // socket.emit('respuesta');

  //Definir los eventos de socket.io
  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tarea);
  });

  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
