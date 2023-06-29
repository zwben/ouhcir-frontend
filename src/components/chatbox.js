import {useState} from 'react';
import React, { useRef, useEffect } from 'react';
import MsgEntry from './msg_entry'
import Prompt from './prompt';

import user_profile from '../assets/chatbox/user_profile.svg'
import ai_profile from '../assets/chatbox/ai_profile.svg'
import CommentPopUp from './CommentPopUp';

function ChatBox (){
    const [showCommentPopup, setShowCommentPopup] = useState(false)

    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const [messagesArray, setMessagesArray] = useState([])

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}

    window.scrollTo(0, document.documentElement.scrollHeight);

    // TODO: Fix the scrolling
    return(
        <div className="bg-[#2f4454] flex w-full h-full flex-col " >         
            {/* <div>{messageComponent}</div> */}
            <div>
                <Prompt key={"prompt-" + 2} setShowCommentPopup={setShowCommentPopup} profile_image={user_profile}  bgColor="bg-[#3c586e]" text="Hello there! I hope you're doing well today. How can I be of assistance to you? Whether you have a specific question, need information on a particular topic, or simply want to engage in a conversation, I'm here to help. Feel free to share your thoughts or ask anything you'd like, and I'll provide you with a detailed and informative response."/> 
                <Prompt key={'prompt-'+2} setShowCommentPopup={setShowCommentPopup} profile_image={ai_profile} text="Hi, I'm your AI" bgColor = {bgObj.ai}/>
                <Prompt key={'prompt-'+2} setShowCommentPopup={setShowCommentPopup} profile_image={user_profile} text="How are you?" bgColor = {bgObj.user}/>
            </div>
            <div className='mx-25 absolute bottom-0 left-1/2 mb-8'>
                <MsgEntry setMessagesArray={setMessagesArray} messagesArray={messagesArray} setPrompt={setPrompt}/>
            </div>
            {showCommentPopup && <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
                <CommentPopUp setShowCommentPopup={setShowCommentPopup}/>
            </div>}
        </div>
    );

    
}

export default ChatBox;