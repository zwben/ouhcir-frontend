import {useState} from 'react';
import React, { useRef, useEffect } from 'react';
import MsgEntry from './msg_entry'
import Prompt from './prompt';

import { openai } from '../openai-config';

import user_profile from '../assets/chatbox/user_profile.svg'
import ai_profile from '../assets/chatbox/ai_profile.svg'
import CommentPopUp from './CommentPopUp';

function ChatBox (){
    const [showCommentPopup, setShowCommentPopup] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [promptResponseArray, setPromptResponseArray] = useState([])

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}

    useEffect(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
    }, [promptResponseArray]);
                    
    const getAPIResponse = async (array) => {  
        try {
            setIsLoading(true)
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: array,
                });
            console.log('Actual: Getting openAI response')
            array.push(completion.data.choices[0].message);
            setPromptResponseArray([...array])
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false)
    }

    // Create an array of message components
    const messageComponents = promptResponseArray.map((message, index) => (
        <div key={`message-${index}`}>
            {message.role === 'user' ? (
                <Prompt
                    text={message.content}
                    setShowCommentPopup={setShowCommentPopup}
                    bgColor={bgObj.user}
                    profile_image={user_profile}
                />
            ) : (
                <Prompt
                    text={message.content}
                    bgColor={bgObj.ai}
                    setShowCommentPopup={setShowCommentPopup}
                    profile_image={ai_profile}
                />
            )}
            </div>
    ));

    console.log(promptResponseArray)

    return(
        <div className="bg-[#2f4454] flex w-full h-full justify-center" >         
            <div className='w-full mb-36'>
                {messageComponents}
                {isLoading && <Prompt text='Loading...' bgColor={bgObj.ai} profile_image={ai_profile} />}
            </div>
            <div className='fixed bottom-0 mb-8 w-[50%]'>
                <MsgEntry 
                    setPromptResponseArray={setPromptResponseArray} promptResponseArray={promptResponseArray}
                    setPrompt={setPrompt} getAPIResponse={getAPIResponse}/>
            </div>
            {showCommentPopup && <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
                <CommentPopUp setShowCommentPopup={setShowCommentPopup}/>
            </div>}
        </div>
    );

    
}

export default ChatBox;