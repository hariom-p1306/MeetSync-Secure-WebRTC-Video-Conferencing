import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";
import recordingRoutes from "./routes/recording.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recordings", recordingRoutes);

app.set("port", process.env.PORT || 8000);

app.get("/home", (req, res) => {
  return res.json({ hello: "world" });
});

const start = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MONGO connected DB host: ${connectionDb.connection.host}`);

    server.listen(process.env.PORT || 8000, () => {
      console.log(`Listening on port ${process.env.PORT || 8000}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

start();