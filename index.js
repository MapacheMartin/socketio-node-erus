const app = require("express")();
 
const http = require("http");
var https = require('https');
const fs = require("fs");
const cors = require('cors');
const path = require('path');
const io = require("socket.io")(https, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"], 
    credentials: true
  }
});
var port = process.env.PORT || 8005;

 
const getMostRecentFile = (dir) => {
  const files = orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

const orderReccentFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
    .filter(file => path.extname(file).toLocaleLowerCase() !== '.cache')
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};
app.use(cors());
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === "dedb2b7e-c7c0-4ed9-b7dd-197908574aae") next();
  else {
    console.log("bad user");
    return "badRequest";
  }
});

app.get("/", (req, res) => {
  res.send("<h1>ERUS</h1>");
});

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

if(Boolean(process.env.PROD)===true){
  const key = getMostRecentFile('/home/erusboxadmin/ssl/keys/');
  const cert = getMostRecentFile('/home/erusboxadmin/ssl/certs/')
  return https.createServer({
    key: fs.readFileSync(`/home/erusboxadmin/ssl/keys/${key.file}`),
    cert: fs.readFileSync(`/home/erusboxadmin/ssl/certs/${cert.file}`)
  },app).listen(process.env.PORT||8005, () => {
    console.log(`Servicio de créditos corriendo en el puerto ${process.env.PORT||8005}!`)
  });
}else{
  return app.listen(process.env.PORT||8005, () => {
    console.log(`Servicio de créditos corriendo en el puerto ${process.env.PORT||8005}!`)
  });
}
 