import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import {Chat} from './pages/Chat';
import {Room} from './pages/Room';
function App () {

  return (
   <div> 
  <Router>
        <Routes>
          <Route path='/Chat/:room_name/:name' element={<Chat/>}/>
          <Route path='/' element={<Room/>}/>
        </Routes>
  </Router>
  </div>
  )
};


export default App;
