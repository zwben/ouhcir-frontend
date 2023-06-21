import {useState} from 'react';
import Chatbox from './components/chatbox';
import Navbar from './components/navbar';
import React from 'react';

function App() {
  
  
  return (
    <div className="flex flex-row font-inter">
        <Navbar/>
        <Chatbox/>

    </div>
  );
}

export default App;
