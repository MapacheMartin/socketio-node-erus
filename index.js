const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origins: [
      "https://canjeatesting.erus.mx",
      "http://localhost:4200",
      "http://localhost:8080",
      "https://erp.erus.mx",
      "https://erpupdate.erus.mx",
    ],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === "dedb2b7e-c7c0-4ed9-b7dd-197908574aae") next();
  else {
    console.log("bad user");
    return "badRequest";
  }
});

// app.get("/", (req, res) => {
//   res.send("<h1>Hey Socket.io</h1>");
// });

io.on("connection", (socket) => {
  // console.log("a user connected");
  socket.on("disconnect", () => {
    // console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    // console.log("message: " + msg);
    var toJson = JSON.parse(msg);

    io.emit(toJson.channel, toJson.message);
    // console.log(msg);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
