import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'


export const Room= ()=>{
  const [room_name,setRoomName]=useState('');
  const [name,setName]=useState('');
  const navigate=useNavigate();
 
   const Enter=()=>{

       navigate(`/chat/${room_name}/${name}`);
   }

  

   return (
       <center style={{fontFamily:"cursive"}} >
        <img src="../images/icon.jpg" alt="" style={{width:"20%",height:"10%",borderRadius:"50px"}}/>
       <h1 style={{marginTop:"5%",color:"white"}}>Welcome!!! Join Room</h1>
       <input className="form-control form-control-lg" type="text" onChange={(e)=>setRoomName(e.target.value)} placeholder="Enter your room name..." aria-label=".form-control-lg example" style={{width:"45%",margin:"20px"}} required/>
       <input className="form-control form-control-lg" type="text" onChange={(e)=>setName(e.target.value)} placeholder="Enter your name..." aria-label=".form-control-lg example" style={{width:"45%",margin:"20px"}} required/>
       <button className="btn btn-primary" onClick={Enter}>Enter the room</button>
       </center>
   )
};

