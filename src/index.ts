"use strict";
const { Server } = require("socket.io");

module.exports = {
  register(/*{ strapi }*/) {},

  bootstrap(/*{ strapi }*/) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    const serverUserId = 3;

    io.on("connection", (socket) => {
      console.log("A new user has connected", socket.id);

      socket.on("message", async (data) => {
        console.log("Message received:", data);

        try {
          const userMessage = await strapi.entityService.create("api::message.message", {
            data: {
              text: data.text,
              sender: data.senderId,
              reciever: data.receiverId,
              timestamp: new Date(),
            },
          });

          console.log("Saved message:", userMessage);

          // Send only to the receiver (excluding sender)
          io.to(`user:${data.receiverId}`).emit("message", userMessage);

          // **Server Auto-Reply Handling**
          if (Number(data.receiverId) === serverUserId) {
            setTimeout(async () => {
              const serverReply = await strapi.entityService.create("api::message.message", {
                data: {
                  text: data.text, // Echo same text
                  sender: serverUserId,
                  reciever: data.senderId,
                  timestamp: new Date(),
                },
              });

              io.to(`user:${data.senderId}`).emit("message", serverReply);
            }, 1000);
          }
        } catch (error) {
          console.error("Error saving message:", error);
        }
      });

      socket.on("join", (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room user:${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("A user has disconnected", socket.id);
      });
    });
  },
};
