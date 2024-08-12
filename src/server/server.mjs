import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5500"],
    },
});

io.on("connection", socket => {
    socket.on('offer', (data) => {
        // Broadcast the offer to all other clients
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', (data) => {
        // Broadcast the answer to all other clients
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', (data) => {
        // Broadcast the ICE candidate to all other clients
        socket.broadcast.emit('candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('accepted', () => {
        socket.broadcast.emit('accepted');
    });
})


server.listen(3000, () => {
    console.log("Running at localhost:3000");
});
