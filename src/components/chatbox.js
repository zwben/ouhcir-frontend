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
    const [showMoreActionsPopUp, setShowMoreActionsPopUp] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [promptID, setPromptID] = useState('')
    const [responseID, setResponseID] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [promptResponseArray, setPromptResponseArray] = useState([])
    const [msgEntryText, setMsgEntryText] = useState() // for handling whenever the user clicked the question or prompt suggestions
    const taskCtx = useContext(TaskContext)
    const authCtx = useContext(AuthContext)
    const favCtx = useContext(FavouritesContext)
    const queCtx = useContext(QueContext)

    // gpt related states
    const [promptSuggestions, setPromptSuggestions] = useState([])
    const [questionsSuggestions, setQuestionsSuggestions] = useState([])

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}
    
    // to get prompt suggestions and question suggestions
    useEffect(() => {
        const getQuestionSuggestions = async (formData) => {
            try{
                const {
                    taskTopic,
                    topicFimiliarityBasic,
                    topicFimiliaritySpecific,
                    topicFimiliaritySpecificOptions,
                    expectedComplexityBasic,
                    expectedComplexitySpecificOptions,
                    expectedComplexitySpecificSelectedOption,
                    expectedSpendingTime,
                } = formData
        
                console.log('here')
                console.log(queCtx.formData)
                const messages = [
                        {
                            "role": "system",
                            "content": `You are a teacher help the user learn the topic: ${taskTopic || ''}. The user has a familiarity degree of (${topicFimiliarityBasic} out of 5), stating ${topicFimiliaritySpecificOptions[topicFimiliaritySpecific]}".  The user think the complexity of this task (${expectedComplexityBasic} out of 5), ${expectedComplexitySpecificOptions[expectedComplexitySpecificSelectedOption]}. The user expects to spend ${expectedSpendingTime} to fully complete the task. Given the familiarity level, complexity level, and user expectation, adjust your answers so that the user can understand better.`
                        },
                        {
                            "role": "user",
                            "content": "Please generate five questions related to this task and topic that the user is most likely to ask. You need to consider the probability of whether the user may ask each question and arrange the questions from the highest probability to the lowest. You output must be as a json array"
                        },
                    ];
            
                console.log(messages);
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    max_tokens: 256,
                });
            
                const res = JSON.parse(response.data.choices[0].message.content);
                setQuestionsSuggestions(res)
                } catch(e){
                    console.log(e)
                }
        }
        const getPromptSuggestions = async () => {
            
        }
        if (queCtx.formData !== null) {
            getQuestionSuggestions(queCtx.formData);
        }
    }, [queCtx.formData?.taskTopic]);
                      

    // to handle automatic scrolling to the end
    useEffect(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
    }, [promptResponseArray]);
    
    // To get the chat history
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
    
    const handleQuestionClicked = (value) => {
        setMsgEntryText(value)
    }
    var questionSuggestionsComp = null
    if (questionsSuggestions.length > 0){
        console.log(questionsSuggestions)
        questionSuggestionsComp = questionsSuggestions.map((question, index) => {
            return (
                <div
                    value={question} 
                    key={'q-div-' + index} 
                    className='bg-[#D9D9D9] px-2 py-2 rounded-md cursor-pointer text-[11px] max-w-[223px] text-[#142838]' 
                    onClick={() => handleQuestionClicked(question)}
                  >
                    <p>{question}</p>
                </div>
            )
        })
    }
        
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
                        showMoreActionsPopUp={showMoreActionsPopUp}
                        setShowMoreActionsPopUp={setShowMoreActionsPopUp}
                        bgColor={bgObj.user}
                        profile_image={user_profile}
                        isStarred={isStarred}
                    />
                ) : (
                    <Prompt
                        divKey={`message-${index}`}
                        promptID = {responseID || message.id}
                        showCommentPopup={showCommentPopup}
                        setShowCommentPopup={setShowCommentPopup}
                        showMoreActionsPopUp={showMoreActionsPopUp}
                        setShowMoreActionsPopUp={setShowMoreActionsPopUp}
                        text={message.content}
                        bgColor={bgObj.ai}
                        profile_image={ai_profile}
                        isStarred={isStarred}
                    />
                )}
                </div>
            )
    });

    return(
        <div className="bg-[#2f4454] flex w-full h-full justify-center flex-col" >         
            <div className='w-full mb-40'>
                {messageComponents}
                {isLoading && <Prompt text='Loading...' bgColor={bgObj.ai} profile_image={ai_profile} />}
            </div>
            <div className="fixed bottom-[100px] flex flex-row space-x-4 w-fit max-w-[75%] left-1/2 transform -translate-x-1/2">
                <h1 className='text-[#D9D9D9]'>Questions</h1>
                {questionSuggestionsComp}
            </div>
            <div className='fixed bottom-0 mb-8 w-[50%] flex flex-col left-1/2 transform -translate-x-1/2'>
                <MsgEntry 
                    msgEntryText={msgEntryText}
                    setMsgEntryText={setMsgEntryText}
                    setPromptID = {setPromptID}
                    responseID = {responseID}
                    setPromptResponseArray={setPromptResponseArray} promptResponseArray={promptResponseArray}
                    setPrompt={setPrompt} getAPIResponse={getAPIResponse}/>
            </div>
        </div>
    );

    
}

export default ChatBox;