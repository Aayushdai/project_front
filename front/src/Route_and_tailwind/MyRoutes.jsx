import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Import the root CSS file
import './index.css';
import Home from '../UI/Home';
import MyProfile from '../UI/MyProfile';

function MyRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<MyProfile />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default MyRoutes;
