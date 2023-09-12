import { useState, useContext } from 'react';
// eslint-disable-next-line no-unused-vars
import { useRef, useEffect } from 'react';
import MsgEntry from './MsgEntry'
import Prompt from './prompt';
import RecordingModal from './RecordingModal';

import { openai } from '../openai-config';
import user_profile from '../assets/chatbox/user_profile.svg';
import ai_profile from '../assets/chatbox/ai_profile.svg';
// eslint-disable-next-line no-unused-vars
import { collection, query, orderBy, getDocs, where, addDoc } from 'firebase/firestore';
import TaskContext from '../context/task-context';
import AuthContext from '../context/auth-context';
import { db } from '../firebase-config';
import { uid } from 'uid';
import FavouritesContext from '../context/favorites-context';
import QueContext from '../context/que-context';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';

function ChatBox (){
    const [showCommentPopup, setShowCommentPopup] = useState(false)
    const [showMoreActionsPopUp, setShowMoreActionsPopUp] = useState(false)
    const [isPromptRated, setIsPromptRated] = useState(null) // to force a rerender of useEffect to see if a prompt has been rated
    // eslint-disable-next-line no-unused-vars
    const [prompt, setPrompt] = useState('')
    // eslint-disable-next-line no-unused-vars
    const [response, setResponse] = useState('')
    // eslint-disable-next-line no-unused-vars
    const [promptID, setPromptID] = useState('')
    const [responseID, setResponseID] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [promptResponseArray, setPromptResponseArray] = useState([])
    const [msgEntryText, setMsgEntryText] = useState() // for handling whenever the user clicked the question or prompt suggestions
    const taskCtx = useContext(TaskContext)
    const authCtx = useContext(AuthContext)
    const favCtx = useContext(FavouritesContext)
    const queCtx = useContext(QueContext)
    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [fromSuggested, setFromSuggested] = useState(false);
    const [fromSuggestedTime, setFromSuggestedTime] = useState(null);

    // gpt related states
    const [promptSuggestions, setPromptSuggestions] = useState([])
    const [questionsSuggestions, setQuestionsSuggestions] = useState([])

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getPromptSuggestions = async (promptResponseArray) => {
        if (response !== '' || promptResponseArray.length >=2 ){
            try{
                const arrLength = promptResponseArray.length
                const {taskTopic, taskType, topicFamiliaritySpecificOptions, 
                    topicFamiliaritySpecificSelectedOption,expectedComplexitySpecificOptions, 
                    expectedComplexitySpecificSelectedOption, expectedSpendingTime, 
                    expectedOutcome,} = queCtx.formData
                
                const filteredPromptResponseArray = promptResponseArray.map(({ id, ratingID, ...rest }) => rest);
                const prevConversation = []
                // Push the second-to-last element without the 'id' property
                prevConversation.push(filteredPromptResponseArray[arrLength - 2]);
                
                // Push the last element without the 'id' property
                prevConversation.push(filteredPromptResponseArray[arrLength - 1]);
                // console.log(prevConversation)

                const messages = [
                    {
                        "role": "system",
                        "content": `You are a teacher help the user ${taskType +' about '+ taskTopic}. The user has a familiarity degree of (${topicFamiliaritySpecificSelectedOption + 1} out of 5), stating ${topicFamiliaritySpecificOptions[topicFamiliaritySpecificSelectedOption]}". The user think the complexity of this task (${expectedComplexitySpecificSelectedOption + 1} out of 5), ${expectedComplexitySpecificOptions[expectedComplexitySpecificSelectedOption]}. The user expects to spend ${expectedSpendingTime} to ${expectedOutcome}. Given the familiarity level, complexity level, and user expectations, adjust your answers so that the user can understand better.`
                    },
                    {
                        "role": "user",
                        "content": `The user entered an instruction prompt: "${prevConversation[0].content}". Please generate five improved prompts by revising the previous prompt: "${prevConversation[0].content}" in terms of clarity. The new generated prompts should be related to this task and topic that can help the user proceed the task. You output must be as a json array of just the questions`
                
                    }
                ];
                

                console.log(messages)
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    max_tokens: 512,
                });
                // console.log(response)
                const res = JSON.parse(response.choices[0].message.content);
                setPromptSuggestions(res)
                } catch(e){
                    console.log(e)
                }
        }
    }
    // to get question suggestions
    useEffect(() => {
        const getQuestionSuggestions = async (formData, promptResponseArray) => {
            try{
                const {
                    taskTopic,
                    taskType,
                    topicFamiliaritySpecificOptions,
                    topicFamiliaritySpecificSelectedOption,
                    expectedComplexitySpecificOptions,
                    expectedComplexitySpecificSelectedOption,
                    expectedSpendingTime,
                    expectedOutcome,
                } = formData
 
                const messages = [
                        {
                            "role": "system",
                            "content": `You are a teacher help the user ${taskType +' about '+ taskTopic}. The user has a familiarity degree of (${topicFamiliaritySpecificSelectedOption + 1} out of 5), stating ${topicFamiliaritySpecificOptions[topicFamiliaritySpecificSelectedOption]}". The user think the complexity of this task (${expectedComplexitySpecificSelectedOption + 1} out of 5), ${expectedComplexitySpecificOptions[expectedComplexitySpecificSelectedOption]}. The user expects to spend ${expectedSpendingTime} to ${expectedOutcome}. Given the familiarity level, complexity level, and user expectations, adjust your answers so that the user can understand better.`
                        },
                    ];

                if ( promptResponseArray.length >=2 ){
                    const arrLength = promptResponseArray.length
                    const filteredPromptResponseArray = promptResponseArray.map(({ id, ratingID, ...rest }) => rest);
                    const prevConversation = []
                    // Push the second-to-last element without the 'id' property
                    prevConversation.push(filteredPromptResponseArray[arrLength - 2]);
                    
                    // Push the last element without the 'id' property
                    prevConversation.push(filteredPromptResponseArray[arrLength - 1]);
                    messages.push({
                        "role": "user",
                        "content": `The user has a previous conversation with you: ### "User": "${prevConversation[0].content}"; "Assistant": "${prevConversation[1].content.slice(0, 2000)}"###. Based on the previous conversation, please generate five follow up questions related to this task and topic that the user is most likely to ask for the next step. You need to consider the probability of whether the user may ask each question and arrange the questions from the highest probability to the lowest. You output must be as a json array of just the questions`
                    })
                    }
                else{
                    messages.push({
                        "role": "user",
                        "content": `Please generate five questions related to this task and topic that the user is most likely to ask. You need to consider the probability of whether the user may ask each question and arrange the questions from the highest probability to the lowest. You output must be as a json array of just the questions`
                    })
                }
                console.log(messages)
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    max_tokens: 1024,
                });
            
                const res = JSON.parse(response.choices[0].message.content);
                setQuestionsSuggestions(res)
                } catch(e){
                    console.log(e)
                }
        }
        if (queCtx.formData !== null && !isLoading) {
            getQuestionSuggestions(queCtx.formData, promptResponseArray);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queCtx.formData, isLoading]);                      

    // to handle automatic scrolling to the end
    useEffect(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
    }, [getPromptSuggestions, promptResponseArray, queCtx.formData]);
    
    // To get the chat history
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (taskCtx.taskID){
                try {
                    const chatsRef = collection(db, 'chatsIndividual');
            
                    // Add a where clause to filter by taskID
                    const q = query(
                        chatsRef,
                        where('taskID', '==', taskCtx?.taskID),
                        orderBy('typingEndTime', 'asc')
                    );
            
                    const querySnapshot = await getDocs(q);
                    const chatHistory = [];
                    
                    querySnapshot.forEach((doc) => {
                        const { role, prompt, id, ratingID} = doc.data();
                        chatHistory.push({ role, content: prompt, id, ratingID });
                    });
                    setPromptResponseArray(chatHistory);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                }
            }
            };
        fetchChatHistory();
      }, [taskCtx?.taskID, isPromptRated]);

    const getAPIResponse = async (array, promptID) => {  
        try {
            setIsLoading(true)
            setFromSuggested(false)

            // Filter out the IDs from the array
            const filteredMessages = array.map((message) => {
                const { role, content } = message;
                return { role, content };
            });
            let messages = []
            if (taskCtx.taskID){
                const {taskTopic, taskType, topicFamiliaritySpecificOptions, 
                    topicFamiliaritySpecificSelectedOption,expectedComplexitySpecificOptions, 
                    expectedComplexitySpecificSelectedOption, expectedSpendingTime, 
                    expectedOutcome,} = queCtx.formData

                messages = [
                    {
                        "role": "system",
                        "content": `You are a teacher help the user ${taskType +' about '+ taskTopic}. The user has a familiarity degree of (${topicFamiliaritySpecificSelectedOption + 1} out of 5), stating ${topicFamiliaritySpecificOptions[topicFamiliaritySpecificSelectedOption]}". The user think the complexity of this task (${expectedComplexitySpecificSelectedOption + 1} out of 5), ${expectedComplexitySpecificOptions[expectedComplexitySpecificSelectedOption]}. The user expects to spend ${expectedSpendingTime} to ${expectedOutcome}. Given the familiarity level, complexity level, and user expectations, adjust your answers so that the user can understand better. Provide you answer in a markdown format.`
                    },
            ];}
            else{
                messages = [{"role": "system", "content": `You are an assistant answering users' questions focusing on specific tasks. As the user has not provide the task information, you need to politely remind the user to take the pre-task questionnaire.`},];

            }

            // filteredMessages[filteredMessages.length - 1].content += '. Provide you answer in a markdown format';
            messages.push(...filteredMessages);
            // console.log(messages)
            const typingStartTime = new Date()
            const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    stream: true,
                });
            let accumulatedResponse = '';
            let message = '';
            const tempResponseID = uid();
            setResponseID(tempResponseID)
            for await (const part of completion) {
                message = part.choices[0]?.delta?.content || '';
                // console.log(message)
                accumulatedResponse += message;
                // console.log(accumulatedResponse)
                if (array.length > 0 && array[array.length - 1].id === tempResponseID) {
                    // Update the last message in the array
                    array[array.length - 1].content = accumulatedResponse;
                } else {
                    // Append a new message object
                    array.push({ role: 'assistant', content: accumulatedResponse, id: tempResponseID });
                }                
                setPromptResponseArray([...array])  // This will trigger a re-render and the renderer will process the updated response
            }
            // const message = completion.choices[0].message
            const typingEndTime = new Date()
            // Save the response to Firestore database
            await saveResponseToFirestore(accumulatedResponse, promptID, tempResponseID, typingStartTime, typingEndTime);
            if (taskCtx.taskID){
                getPromptSuggestions(array);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false)
    }

    const saveResponseToFirestore = async (message, promptID, tempResponseID, typingStartTime, typingEndTime) => {
        try {
            const promptRef = collection(db, 'chatsIndividual');
            await addDoc(promptRef, {
                id: tempResponseID,
                ratingID: null,
                taskID: taskCtx?.taskID || '',
                prompt: message,
                responseTo: promptID,
                userID: authCtx?.user.uid || '',
                role: 'assistant',
                typingStartTime, 
                typingEndTime,
            });
        } catch (error) {
            console.error("Error saving prompt:", error);
        }
      };
    
    const handleQuestionClicked = (value) => {
        setMsgEntryText(value);
        setFromSuggested(true);
        setFromSuggestedTime(new Date());
    }
    var questionSuggestionsComp = null
    var promptSuggestionsComp = null
    if (questionsSuggestions.length > 0){
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
    if (promptSuggestions.length > 0){
        promptSuggestionsComp = promptSuggestions.map((question, index) => {
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


    const toggleRecordingModal = () => {
        setIsRecordingModalOpen(prevState => !prevState);
    };
    

    const renderers = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match && match[1] ? match[1] : "";
            
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = hljs.highlight(validLanguage, children[0]).value;

            if (inline) {
                return <code className={className} {...props} dangerouslySetInnerHTML={{ __html: highlighted }} />;
            }
            return <pre className={className} {...props}><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>;
        }
    };




    // Create an array of message components
    const messageComponents = promptResponseArray.map((message, index) => {
        var isStarred = false
        if (favCtx.favourites && favCtx.favourites.find(e => e.promptID === message.id)){
            isStarred =true
        }
        return (
            <div key={`message-${index}`}>
                {message.role === 'user' ? (
                    <Prompt
                        divKey={`message-${index}`}
                        role='user'
                        promptID = {message.id}
                        setIsPromptRated={setIsPromptRated}
                        text={message.content}
                        stringText={message.content}
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
                        promptID = {message.id}
                        setIsPromptRated={setIsPromptRated}
                        role='assistant'
                        ratingID={message?.ratingID}
                        showCommentPopup={showCommentPopup}
                        setShowCommentPopup={setShowCommentPopup}
                        showMoreActionsPopUp={showMoreActionsPopUp}
                        setShowMoreActionsPopUp={setShowMoreActionsPopUp}
                        stringText={message.content}
                        text=<ReactMarkdown components={renderers} children={message.content} />
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
            <div className='w-full mb-56'>
                {messageComponents}
                {/* {isLoading && <Prompt text='Loading...' bgColor={bgObj.ai} profile_image={ai_profile} />} */}
            </div>
            {questionsSuggestions.length > 0 && <div className="fixed bottom-[170px] flex flex-row space-x-4 w-fit max-w-[75%] ml-4">
                <h1 className='text-[#D9D9D9]'>Questions</h1>
                {questionSuggestionsComp}
            </div>}
            {promptSuggestions.length > 0 && <div className="fixed bottom-[100px] flex flex-row space-x-4 w-fit max-w-[75%] ml-4 mt-4">
                <h1 className='text-[#D9D9D9]'>Prompts</h1>
                {promptSuggestionsComp}
            </div>}
            <div className='fixed bottom-0 mb-8 w-[50%] flex flex-col left-[60%] transform -translate-x-1/2 '>
                <MsgEntry 
                    msgEntryText={msgEntryText}
                    setPromptSuggestions={setPromptSuggestions}
                    setMsgEntryText={setMsgEntryText}
                    setPromptID = {setPromptID}
                    responseID = {responseID}
                    fromSuggested = {fromSuggested}
                    fromSuggestedTime = {fromSuggestedTime}
                    setPromptResponseArray={setPromptResponseArray} promptResponseArray={promptResponseArray}
                    setPrompt={setPrompt} getAPIResponse={getAPIResponse}
                    onMicrophoneClick={toggleRecordingModal}/>
            </div>
            {isRecordingModalOpen && 
                <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
                    <RecordingModal isOpen={isRecordingModalOpen} onClose={toggleRecordingModal} />
                </div>
            }            
        </div>
    );

    
}

export default ChatBox;