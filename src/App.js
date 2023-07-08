import { useState } from 'react';
import {Route, Routes } from 'react-router-dom';
import SignUp from './components/SignUp';
import Main from './components/Main';

function App() {
  const [showQuestionaire, setShowQuestionaire] = useState(false);

  return (
    <div>
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/signup" element={<SignUp/>}/>
        </Routes>
    </div>
  );
}

export default App;
