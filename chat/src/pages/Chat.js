import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import ReactScrollToBottom from 'react-scroll-to-bottom';
import { useRef } from "react";
import '../App.css';
import { FaImages } from "react-icons/fa";
import { SiAudioboom } from "react-icons/si";
import { LiaFilePdfSolid } from "react-icons/lia";

import { GiBreakingChain } from "react-icons/gi";
const socket = io('https://chat-application-psi-one.vercel.app', {
  transports: ['websocket'],  // Explicitly specify WebSocket transport
});
export const Chat = () => {
  const [text, setText] = useState('');
  const [typingTimeoutRef, setTypingTimeoutRef] = useState(null);
  const [joined_users,setJoined_users]=useState([]);
  const [hide,setHide]=useState(false);
  const [hide1,setHide1]=useState(false);
  const room_name = useParams().room_name;
  const name=useParams().name;
  const currentRef = useRef(); 
  const currentRef1 = useRef(); 
  const currentRef2 = useRef(); 
  const imageRef=useRef(null);
  const videoRef=useRef(null);
  
  useEffect(()=>{
    setJoined_users([...joined_users,name]);
    socket.emit('joined_room', room_name,name);
    
  },[name])
  
  useEffect(() => { 
    
    const UpdateMsg = (data) => {
          console.log(data);
          let parent = document.getElementById('inbox');
          let div = document.createElement('div');
          div.innerHTML = `<h6>${data.name}</h6><h3>${data.message}</h3>`;
          div.classList.add("left");
          parent.append(div);
      
    }
    socket.on('receive_message', UpdateMsg);

    return () => {
      socket.off('receive_message', UpdateMsg);
    }
  }, [])
 
  const enter=(e)=>{
    if((e.key==='Enter'||e.key==='Go') && text.trim()!==""){
      handleSendMessage(e);
    }
  }
  const handleMessageChange = (e) => {
    setText(e.target.value);
       if(text===''){
        socket.emit('stopTyping',{
          type:'stopTyping',
          name:name,
          room_name:room_name
        })
    }
      if(text!==""){
      socket.emit('typing',{
        type:'typing',
        name:name,
        room_name:room_name
      })}

      clearTimeout(typingTimeoutRef);
      setTypingTimeoutRef(setTimeout(() => {
        socket.emit('stopTyping', {
          type: 'stopTyping',
          name:name,
          room_name:room_name
        });
      }, 1000)); 
  };
  
  useEffect(()=>{

    const Notificatio=(data)=>{
      switch(data.type){
       case 'typing':
         let parent = document.getElementById('typing');
         parent.innerText = `${data.name} is typing...`;
         break;
       default:
         break;
        
      }
    }
     socket.on('typing',Notificatio);
     return()=>{
       socket.off('typing',Notificatio);
     }
   },[]);

   useEffect(()=>{

    const stopTyping=(data)=>{
      switch(data.type){
       case 'stopTyping':
         let parent = document.getElementById('typing');
         parent.innerText ="Typing Status...";
         break;
       default:
         break;
        
      }
    }
     socket.on('stopTyping',stopTyping);
     return()=>{
       socket.off('stopTyping',stopTyping);
     }
   },[]);
   const joinedUsers = new Set();
   
   useEffect(() => {

    const joinedRoomHandler = (data) => {
 
      if (!joinedUsers.has(data.name)) {
      let parent = document.getElementById('inbox');
      let div = document.createElement('div');
      div.classList.add("center");
      div.innerHTML = `<h6>${data.name} has joined the chat</h6>`;
      parent.append(div);
      
      joinedUsers.add(data.name);
    
    }
  }
    socket.on('join_room', joinedRoomHandler);
  
    return () => {
      socket.off('join_room', joinedRoomHandler);
    }
  }, []);
 
    
    useEffect(() => {
    // Handle 'left_room' event when a user disconnects
    const leftRoomHandler = (data) => {
    
      if (joinedUsers.has(String(data.user))) {
    
      let parent = document.getElementById('inbox');
      let div = document.createElement('div');
      div.classList.add("center");
      div.innerHTML = `<h6>${data.user} has left the chat</h6>`;
      parent.append(div);
      joinedUsers.delete(data.user);
    }
  }
   
    socket.on('left_room', leftRoomHandler);

    return () => {
      socket.off('left_room', leftRoomHandler);
    }
  }, []);

  const handleSendMessage = () => {
    currentRef.current.value = "";
    setText("");
    currentRef.current.focus();
    let parent = document.getElementById('inbox');
    let div = document.createElement('div');
    div.classList.add("right");
    div.innerHTML = `<h6>${name}</h6><h3>${text}</h3>`;
    parent.append(div);
    socket.emit('send_message', text,room_name,name);
  }  
  const changeFile=(e)=>{
    const file = e.target.files[0];
     
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target.result;
            let parent = document.getElementById('inbox');
            let div = document.createElement('div');
          
            const img = document.createElement('img');
            img.src = imageData;
            img.alt = 'Received Image';
            img.style.maxWidth = '400px'; // Adjust the maximum width as needed
            img.style.maxHeight = '350px'; // Adjust the maximum height as needed
            img.style.float='right';
            img.style.clear='both';
            img.style.marginTop='20px';
            img.style.marginBottom="20px"
            div.appendChild(img);
            parent.append(div);
            socket.emit('image', imageData,room_name);
            currentRef2.current.value="";
          };
          reader.readAsDataURL(file);
      
  };

  }
  
  const changeFile1 = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const audioData = e.target.result;
  
        let parent = document.getElementById('inbox');
        let div = document.createElement('div');
  
        const audio = document.createElement('audio');
        audio.controls = true;
  
        const source = document.createElement('source');
        source.src = audioData;
        source.type = 'audio/mp3'; // Adjust the type based on your audio file format
        
        audio.style.maxWidth='150px';
        audio.style.maxHeight = '110px'; // Adjust the maximum height as needed
        audio.style.float='right';
        audio.style.clear='both';
        audio.style.marginTop="20px";
        audio.style.marginBottom="20px";
        audio.appendChild(source);
        div.appendChild(audio);
  
        parent.append(div);
        socket.emit('audio', audioData, room_name);
        currentRef1.current.value="";
      };
  
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    try {
      const receiveAudio = (data) => {
        console.log(data);
        let parent = document.getElementById('inbox');
        let div = document.createElement('div');
  
        const audio = document.createElement('audio');
        audio.controls = true;
  
        const source = document.createElement('source');
        source.src = data;
        source.type = 'audio/mp3'; // Adjust the type based on your audio file format
        
        audio.style.maxWidth='150px';
        audio.style.maxHeight = '150px'; // Adjust the maximum height as needed
        audio.style.float='left';
        audio.style.clear='both';
        audio.style.marginTop='20px'
        audio.style.marginBottom="20px"

        audio.appendChild(source);
        div.appendChild(audio);
  
        parent.append(div);
      };
  
      socket.on('receiveAudio', receiveAudio);
  
      return () => {
        socket.off('receiveAudio', receiveAudio);
      };
    } catch (error) {
      console.error('Error receiving audio:', error);
    }
  }, []);
  

  useEffect(()=>{
    try{
   const SendFile=(data)=>{
     console.log(data);
    let parent = document.getElementById('inbox');
    let div = document.createElement('div');
    const img = document.createElement('img');
    img.src = data;
    img.alt = 'Received Image';
    img.style.maxWidth = '400px'; // Adjust the maximum width as needed
    img.style.maxHeight = '350px'; // Adjust the maximum height as needed
    img.style.float='left';
    img.style.clear='both';
    img.style.marginTop="20px"
    img.style.marginBottom="20px"

    div.appendChild(img);
    parent.append(div);
   }    
   socket.on('images',SendFile);

    return()=>{
      socket.off('images',SendFile);
    }
  }catch (error) {
    console.error('Error sending image:', error);
  }
  },[]);


  useEffect(()=>{
    try{
   const SendFile=(data)=>{
     console.log(data);
    let parent = document.getElementById('inbox');
    let div = document.createElement('div');
    const img = document.createElement('embed');
    img.src = data;
    img.alt = 'Received Image';
    img.style.maxWidth = '400px'; // Adjust the maximum width as needed
    img.style.maxHeight = '350px'; // Adjust the maximum height as needed
    img.style.float='left';
    img.style.clear='both';
    img.style.marginTop="20px"
    img.style.marginBottom="20px"

    div.appendChild(img);
    parent.append(div);
   }    
   socket.on('receivePDF',SendFile);

    return()=>{
      socket.off('receivePDF',SendFile);
    }
  }catch (error) {
    console.error('Error sending image:', error);
  }
  },[]);

  const changeFile2= (e) => {
    console.log('File input changed');
    const file = e.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const fileData = e.target.result;
  
        let parent = document.getElementById('inbox');
        let div = document.createElement('div');
        let fileElement;
        
          fileElement = document.createElement('embed');
          fileElement.src = fileData;
          fileElement.style.width = '300px';
          fileElement.style.height = '300px';
          fileElement.style.float = 'right';
          fileElement.style.clear = 'both';
          fileElement.style.marginTop="20px"
          fileElement.style.marginBottom="20px"

          div.appendChild(fileElement);
          parent.append(div);
          socket.emit('FilePdf',fileData, room_name);
          currentRef1.current.value="";
        }
         reader.readAsDataURL(file);
      };
  
    }
    useEffect(() => {
      const startScreenPlay = (data) => {
     
          imageRef.current.src = data;        
          if (data.audioStream) {
            const audio = new Audio();
            audio.srcObject = data.audioData;
            audio.play().catch((error) => console.error("Error playing audio:", error));
          }
      };
  
      socket.on('screenShareFrame', startScreenPlay);
  
      return () => {
        socket.off('screenShareFrame', startScreenPlay);
      };
    }, []);

    const startCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true  });
        setHide1(!hide1);
    
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
    
        const sendFrames = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400; // Set canvas width to 400px
          canvas.height = 300; // Set canvas height to 300px
          const context = canvas.getContext('2d');
          context.drawImage(videoRef.current, 0, 0,400,300);
    
          const imageData = canvas.toDataURL('image/jpeg');
          socket.emit('screenShareFrame',{imageData ,audioStream: stream, room_name });
    
          setTimeout(sendFrames, 10);
        };
    
        sendFrames();
      } catch (error) {
        console.error('Error starting screen capture:', error);
      }
    };
    
  return (
    <div className="App" style={{fontFamily:"cursive"}}>
      
      <div id="upperDiv" style={{display:"flex",flexWrap:"wrap",justifyContent:"center"}} >
        <div id="typing" style={{color:"white",fontFamily:"cursive"}} >
          <span placeholder="Typing Status...">Typing Status...</span>
        </div>
      </div>
      {hide &&
          <div id="buttons-container">
          <div id="buttons">
          <input type="file"  style={{display:"none"}} id="audioFile" onChange={changeFile1} ref={currentRef} accept="audio"/>
          <button className="button" onClick={() => currentRef.current.click()}>
            <SiAudioboom />
          </button>
          {/* <button id="video-button"className="button" ><CiVideoOn /></button> */}
          <input type="file"  style={{display:"none"}} id="imageFile" onChange={changeFile} ref={currentRef1} />
          <button className="button" onClick={() => currentRef1.current.click()}>
            <FaImages />
          </button>
          
          <input type="file"  style={{display:"none"}} id="pdfFile"  ref={currentRef2} onChange={changeFile2} accept=".pdf" />
          <button className="button"  onClick={() => currentRef2.current.click()}>
            <LiaFilePdfSolid />
          </button>
          <button className="btn btn-primary" onClick={startCapture} >Screen Share</button>
          </div>
          </div>

        }
      <center> 
      <ReactScrollToBottom className="message-container">
      <div id="inbox"  style={{ backgroundColor:"#6f53534a",color: "white",boxShadow:"0.1px 0.1px 0.6px 0.6px",width:"90%",minHeight:"24rem",marginTop:"2%",overflow:"auto"}}></div>
      </ReactScrollToBottom>
      </center>
      <div id="form" >
      <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={handleMessageChange}
              ref={currentRef} className="form-control form-control-lg" aria-label=".form-control-lg example"  onKeyDown={enter}
             
            />
       <button id="icon-trigger"style={{ fontSize: "2.6rem",
            borderRadius: "50%",
            background: "none",
            border: "none"}} onClick={()=>setHide(!hide)}><GiBreakingChain />
        </button>     
      </div>
       {hide1 && <div>
       <img ref={imageRef} alt="" width={400} height={300}/>
          <video ref={videoRef} autoPlay controls  width={400} height={300} style={{backgroundColor:""}}/>;
          
       </div>}
    
        
    </div>
  );
}
