import {useState} from 'react';
import React, { useRef, useEffect } from 'react';
import MsgEntry from './msg_entry'
import Prompt from './prompt';
import Response from './response';

import user_profile from '../assets/chatbox/user_profile.svg'
import ai_profile from '../assets/chatbox/ai_profile.svg'

function ChatBox (){
    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    const bgObj = {"user": "bg-[#3c586e]",
                    "ai": "bg-[#2f4454]"}
    const getAPIResponse = async (prompt) => {  
        console.log('Waiting for the server to respond')
        try {
          const apiUrl = 'http://127.0.0.1:8000/';
          const queryParams = new URLSearchParams({query: prompt});
          const url = apiUrl + '?' + queryParams;
          const response = await fetch(url);
          const jsonData = await response.json();
          console.log(jsonData);
          return jsonData;
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo(0, document.documentElement.scrollHeight);
          }, 1000);

        // Function to be executed when prompt state updates
        console.log("Prompt state has been updated");
      
        if(prompt !== ''){
        // Call your function to get API response here
            getAPIResponse(prompt)
            .then((jsonData) => {
                setMessagesArray((prevMessagesArray) => {
                    const lastItemIndex = prevMessagesArray.length - 1;
                    const updatedLastItem = { ...prevMessagesArray[lastItemIndex], gpt_reply: jsonData.reply };
                    const updatedMessagesArray = prevMessagesArray.slice(0, lastItemIndex).concat(updatedLastItem);
                    return updatedMessagesArray;
                    });

                // Set loading to false when you receive a response
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });

        }
    }, [prompt]);

    let messageComponent = []; //A message component includes a message and its respons.
    const [messagesArray, setMessagesArray] = useState([]);
    const ai = 'I am your AI'
    if(messagesArray.length > 0){
        console.log(messagesArray)
        messageComponent = messagesArray.map((message, i)=>{
        return(
            <div>
                <Prompt key={"prompt-" + i} text={message.user_message} /> 
                <Response key={"response-" + i} text={message.gpt_reply} isLoading={isLoading}/>
            </div>
        );
        })
    }

    window.scrollTo(0, document.documentElement.scrollHeight);

    // TODO: Fix the scrolling
    return(
        <div className="bg-[#2f4454] flex w-full h-full flex-col " >         
            {/* <div>{messageComponent}</div> */}
            <div>
                <Prompt key={"prompt-" + 2} profile_image={user_profile}  bgColor="bg-[#3c586e]" text="Hello there! I hope you're doing well today. How can I be of assistance to you? Whether you have a specific question, need information on a particular topic, or simply want to engage in a conversation, I'm here to help. Feel free to share your thoughts or ask anything you'd like, and I'll provide you with a detailed and informative response."/> 
                <Prompt key={'prompt-'+2} profile_image={ai_profile} text="Hi, I'm your AI" bgColor = {bgObj.ai}/>
                <Prompt key={'prompt-'+2} profile_image={user_profile} text="How are you?" bgColor = {bgObj.user}/>
            </div>
            <div className='mx-25 absolute bottom-0 left-1/2 mb-8'>
                <MsgEntry setMessagesArray={setMessagesArray} messagesArray={messagesArray} setPrompt={setPrompt}/>
            </div>
        </div>
    );

    
}

export default ChatBox;