import {useState} from 'react';
import React, { useRef, useEffect } from 'react';
import MsgEntry from './msg_entry'
import Prompt from './prompt';
import Response from './response';

function ChatBox (){
    const [prompt, setPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(true);

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
                <Prompt key={"prompt-" + i}text={message.user_message}/> 
                <Response key={"response-" + i} text={message.gpt_reply} isLoading={isLoading}/>
            </div>
        );
        })
    }

    window.scrollTo(0, document.documentElement.scrollHeight);

    // TODO: Fix the scrolling
    return(
        <div className="bg-[#2f4454] flex w-full h-full flex-col" >         
            <div>{messageComponent}</div>
            <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
            <MsgEntry setMessagesArray={setMessagesArray} messagesArray={messagesArray} setPrompt={setPrompt}/>
        </div>
    );

    
}

export default ChatBox;