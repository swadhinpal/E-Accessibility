//import logo from './logo.svg';
import './App.css';
import Nav from './component/nav';
import Home from './component/home';
import Tweet from './component/tweet';
import Input from './component/Input';
import Output from './component/output';
import Register from './component/Register';
import Login from './component/Login';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
        
        
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tweet" element={<Tweet />} />
        <Route path="/Input" element={<Input />} />
        <Route path="/output" element={<Output />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
       </Routes>
        
      </header>
    </div>
    </Router>
  );
}

export default App;
