
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dbConnect } from "./Config/dbConnect.js";
import { errorHandler } from "./Helpers/helpers.js";
import routes from "./app.js";

// 🧩 Load environment values
import { createServer } from "http";
import { Server } from "socket.io";

// 🧩 Load environment values
const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
//
// ✅ Connect DB
dbConnect();

// ✅ Middlewares
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Attach IO to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ✅ Serve static files
app.use(express.static("public"));

// ✅ API routes
app.use("/", routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// ✅ Error handler
app.use(errorHandler);

// ✅ Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running Port ${PORT} ❤️`);
  console.log(`🔌 Socket.io initialized`);
});
