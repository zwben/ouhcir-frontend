import {useState} from 'react';
import Chatbox from './components/chatbox';
import Navbar from './components/navbar';
import React from 'react';
import Questionnaire from './components/Questionnaire';

function App() {
  const [showQuestionaire, setShowQuestionaire] = useState(false)
  return (
    <div className="flex flex-row font-inter">
        <Navbar setShowQuestionaire={setShowQuestionaire}/>
        <Chatbox/>
        {showQuestionaire && <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
                <Questionnaire setShowQuestionaire={setShowQuestionaire}/>
            </div>}
    </div>
  );
}

export default App;
