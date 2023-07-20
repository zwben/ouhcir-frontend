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
import QueContext from '../context/que-context';

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
    const queCtx = useContext(QueContext)

    // gpt related states
    const [promptSuggestions, setPromptSuggestions] = useState([])
    const [questionsSuggestions, setQuestionsSuggestions] = useState([])

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}
    
    useEffect(() => {
        const getPromptSuggestions = async () => {
            if (queCtx.formData.taskTopic) {
                const { taskTopic, fimiliaritySelectedOption, topicFimiliaritySpecificOptions, complexitySelectedOption, expectedComplexitySpecificOptions, timeExpectationList, timeExpectationSelectedOption } = queCtx.formData;
                console.log(queCtx.formData)
                const messages = [
                        {
                            "role": "system",
                            "content": `You are a teacher help the user learn the topic: ${taskTopic}. The user has a familiarity degree of (${fimiliaritySelectedOption + 1} out of 5), stating ${topicFimiliaritySpecificOptions[fimiliaritySelectedOption]}".  The user think the complexity of this task (${complexitySelectedOption + 1} out of 5), ${expectedComplexitySpecificOptions[complexitySelectedOption]}. The user expects to spend ${timeExpectationList[timeExpectationSelectedOption]} to fully complete the task. Given the familiarity level, complexity level, and user expectation, adjust your answers so that the user can understand better.`
                        },
                        {
                            "role": "user",
                            "content": "Please generate five questions related to this task and topic that the user is most likely to ask. You need to consider the probability of whether the user may ask each question and arrange the questions from the highest probability to the lowest. You output must be as a json array"
                        },
                    ];
            
                console.log(messages);
                // const response = await openai.createChatCompletion({
                //     model: "gpt-3.5-turbo",
                //     messages: messages,
                //     max_tokens: 256,
                // });
            
                // const res = JSON.parse(response.data.choices[0].message.content);
                // console.log(res);
            }
        }
        
        if (queCtx.formData) {
            getPromptSuggestions();
        }
        }, [queCtx.formData]);
                      

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
        if (favCtx.favourites && favCtx.favourites.find(e => e.promptID == message.id)){
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