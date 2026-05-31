import express from "express";

import {createServer} from "node:http";
 
import { Server } from "socket.io";

import mongoose from "mongoose";



import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";

import userRoutes from "./routes/users.routes.js"

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));
app.use("/api/v1/users", userRoutes);

app.set("port", (process.env.port || 8000));

app.get("/home",(req,res)=>{
    return res.json({"hello":"world"});
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(
            "mongodb+srv://videoconference:omKar512@cluster0.58mfsic.mongodb.net/videoconferenceDB?retryWrites=true&w=majority"
        );
        console.log(`MONGO connected DB host ${connectionDb.connection.host}`);

        server.listen(8000, () => {
            console.log("Listening on port 8000");
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
};


start();