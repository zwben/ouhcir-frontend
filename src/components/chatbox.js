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
    const [isLoading, setIsLoading] = useState(true);
    const [promptResponseArray, setPromptResponseArray] = useState([])

    let messageComponent = []; //A message component includes a message and its respons.
    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}

    window.scrollTo(0, document.documentElement.scrollHeight);


    
    const getAPIResponse = async (array) => {  
        try {
            setIsLoading(true)
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: array,
                });
            console.log('Actual: Getting openAI response')
            setResponse(completion.data.choices[0].message)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false)
    }



    if(promptResponseArray.length > 0){
        console.log(promptResponseArray)
        messageComponent = promptResponseArray.map((message, i)=>{
        return(
            <div>
                <Prompt 
                    key={"prompt-" + i} text={message.content}
                    setShowCommentPopup={setShowCommentPopup}
                    bgColor={bgObj.user} profile_image={user_profile} 
                    /> 
                <Prompt key={"response-" + i} text={message.content}
                    bgColor = {bgObj.ai}
                    setShowCommentPopup={setShowCommentPopup} profile_image={ai_profile}
                    /> 
            </div>
        );
        })
    }

    // TODO: Fix the scrolling
    return(
        <div className="bg-[#2f4454] flex w-full h-full justify-center " >         
            <div className='w-full'>
                {messageComponent}
            </div>
            <div className='absolute bottom-0 mb-8 w-[50%]'>
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