const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'https://chat-application-ocy9.vercel.app',  // Update with your React app's domain
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  }
});
const port = process.env.PORT;

// Use cors middleware to handle CORS headers
app.use(cors());

// Your custom middleware to handle additional headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
let users=[{}];
app.get('/',()=>{
  console.log("Connected to the main server");
})
io.on('connection', (socket) => {
  // console.log('A user connected');
  // console.log(`User ${socket.id} connected`);
  
  
  socket.on('joined_room', (roomName,name,joined_users) => {
    // console.log(`User ${socket.id} joined room: ${roomName}`);
    socket.join(roomName);
    users[socket.id]={name,roomName};
    console.log(name,'has entered the room');
    socket.to(roomName).emit('join_room',users[socket.id]);
    io.to(roomName).emit('total_users',users[socket.id]);
  }); 
   

  socket.on('send_message', (message,room_name,name) => {
  
    console.log("Message received: ", room_name);
    console.log("message is",message);
    console.log("message is",name);
    if(room_name===''){  
     socket.broadcast.emit('receive_message',message,name);
    }else{
    socket.to(room_name).emit('receive_message', {message,name});
    }
  });
  socket.on("typing", (data) => {
    console.log(data);
    socket.to(data.room_name).emit('typing', data);
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.room_name).emit("stopTyping", data);
  });
  socket.on('image', (imageData,roomName) => {
    // Process and save the image
    console.log(imageData,'',roomName);
    socket.to(roomName).emit('images', imageData);
    });

    socket.on('audio', (audioData,roomName) => {
      // Process and save the image
      console.log(audioData,'Audioname',roomName);
      socket.to(roomName).emit('receiveAudio', audioData);
      });
      socket.on('FilePdf', (PdfData,roomName) => {
        // Process and save the image
        console.log(PdfData,'pdfname',roomName);
        socket.to(roomName).emit('receivePDF', PdfData);
        });

        socket.on('screenShareFrame', (data) => {
          // Broadcast the frame to all connected clients (excluding the sender)
          // console.log(data);
          socket.to(data.room_name).emit('screenShareFrame', data.imageData,data.audioStream);
        });  

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  
    // Check if the user is in the users object
    if (users[socket.id]) {

      console.log("sefsef",users[socket.id]);
      // Broadcast to the room that the user has left
      socket.to(users[socket.id].roomName).emit('left_room', {user:users[socket.id].name});
  
      // Remove the user from the users object
      delete users[socket.id];
    }
  });
  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
