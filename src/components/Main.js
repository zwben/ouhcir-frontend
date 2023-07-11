import { useState } from 'react';
import Navbar from './navbar';
import Chatbox from './chatbox';
import Questionnaire from './Questionnaire';

const Main = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  return (
    <div className='flex flex-row'>
      <Navbar setShowQuestionnaire={setShowQuestionnaire} />
      <Chatbox />
      {showQuestionnaire && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
          <Questionnaire setShowQuestionnaire={setShowQuestionnaire} />
        </div>
      )}
    </div>
  );
};

export default Main;