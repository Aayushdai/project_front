import React from 'react'
import { Home } from './Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
function MyRoutes() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />}/>
        </Routes>
        </BrowserRouter>
  );
}
export default MyRoutes