import {useState, useContext} from 'react';
import { useRef, useEffect } from 'react';
import MsgEntry from './msg_entry'
import Prompt from './prompt';

import { openai } from '../openai-config';
import user_profile from '../assets/chatbox/user_profile.svg'
import ai_profile from '../assets/chatbox/ai_profile.svg'
import CommentPopUp from './CommentPopUp';
import { collection, query, orderBy, getDocs, where, addDoc } from 'firebase/firestore';
import TaskContext from '../context/task-context';
import AuthContext from '../context/auth-context';
import { db } from '../firebase-config';
import { uid } from 'uid';
import FavouritesContext from '../context/favorites-context';

function ChatBox (){
    const [showCommentPopup, setShowCommentPopup] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [promptID, setPromptID] = useState('')
    const [responseID, setResponseID] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [promptResponseArray, setPromptResponseArray] = useState([])

    const taskCtx = useContext(TaskContext)
    const authCtx = useContext(AuthContext)
    const favCtx = useContext(FavouritesContext)
    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}

    // to handle automatic scrolling to the end
    useEffect(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
    }, [promptResponseArray]);
    
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const promptRef = collection(db, 'chatsInduvidual');
        
                // Add a where clause to filter by taskID
                const q = query(
                    promptRef,
                    where('taskID', '==', taskCtx?.taskID || ''),
                    orderBy('timestamp', 'asc')
                );
        
                const querySnapshot = await getDocs(q);
                const chatHistory = [];
                
                querySnapshot.forEach((doc) => {
                    const { role, prompt, id } = doc.data();
                    chatHistory.push({ role, content: prompt, id });
                });
                console.log(chatHistory)
                setPromptResponseArray(chatHistory);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
            };
      
        fetchChatHistory();
      }, [taskCtx?.taskID]);

    const getAPIResponse = async (array, promptID) => {  
        try {
            setIsLoading(true)
            // Filter out the IDs from the array
            const filteredMessages = array.map((message) => {
                const { role, content } = message;
                return { role, content };
            });
          const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: filteredMessages,
                });
            const message = completion.data.choices[0].message
            const tempResponseID = uid()
            setResponseID(tempResponseID)
            array.push({...message, id: tempResponseID});
            setPromptResponseArray([...array])
            // Save the response to Firestore database
            await saveResponseToFirestore(message, promptID, tempResponseID);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false)
    }

    const saveResponseToFirestore = async (message, promptID, tempResponseID) => {
        try {
            const promptRef = collection(db, 'chatsInduvidual');
            console.log('Setting promptID is saveResponseToFirestore ' + promptID)
            const docRef = await addDoc(promptRef, {
                id: tempResponseID,
                taskID: taskCtx?.taskID || '',
                prompt: message.content,
                responseTo: promptID,
                userID: authCtx?.user.uid || '',
                role: 'assistant',
                timestamp: new Date(),
            });
        } catch (error) {
            console.error("Error saving prompt:", error);
        }
      };
        
    // Create an array of message components
    const messageComponents = promptResponseArray.map((message, index) => {
        var isStarred = false
        
        if (favCtx && favCtx.favourites.find(e => e.promptID == message.id)){
            isStarred =true
        }
        return (
            <div key={`message-${index}`}>
                {message.role === 'user' ? (
                    <Prompt
                        divKey={`message-${index}`}
                        promptID = {promptID || message.id}
                        text={message.content}
                        showCommentPopup={showCommentPopup}
                        setShowCommentPopup={setShowCommentPopup}
                        bgColor={bgObj.user}
                        profile_image={user_profile}
                        isStarred={isStarred}
                    />
                ) : (
                    <Prompt
                        divKey={`message-${index}`}
                        promptID = {responseID || message.id}
                        showCommentPopup={showCommentPopup}
                        text={message.content}
                        bgColor={bgObj.ai}
                        setShowCommentPopup={setShowCommentPopup}
                        profile_image={ai_profile}
                        isStarred={isStarred}
                    />
                )}
                </div>
            )
    });

    return(
        <div className="bg-[#2f4454] flex w-full h-full justify-center" >         
            <div className='w-full mb-36'>
                {messageComponents}
                {isLoading && <Prompt text='Loading...' bgColor={bgObj.ai} profile_image={ai_profile} />}
            </div>
            <div className='fixed bottom-0 mb-8 w-[50%]'>
                <MsgEntry 
                    setPromptID = {setPromptID}
                    responseID = {responseID}
                    setPromptResponseArray={setPromptResponseArray} promptResponseArray={promptResponseArray}
                    setPrompt={setPrompt} getAPIResponse={getAPIResponse}/>
            </div>
        </div>
    );

    
}

export default ChatBox;