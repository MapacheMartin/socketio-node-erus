var fs = require('fs');
var https = require('https');
const http = require("http");
var express = require('express'); 
const path = require('path');
var app = express();

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

var server;
var serverPort;
var options;
if(Boolean(process.env.PROD)===true){
  const key = getMostRecentFile('/home/erusboxadmin/ssl/keys/');
  const cert = getMostRecentFile('/home/erusboxadmin/ssl/certs/');
  
  options = {
    key: fs.readFileSync(`/home/erusboxadmin/ssl/keys/${key.file}`),
    cert: fs.readFileSync(`/home/erusboxadmin/ssl/certs/${cert.file}`)
  };
   
  
   server = https.createServer(options, app);
} else {
  server = http.createServer(options, app);
}
serverPort = 8005;
var io = require('socket.io')(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"], 
    credentials: true
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

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});