import {useState, useRef} from 'react';
import Prompt from './prompt';
import send_message_icon from "../assets/msg_entry/send_message_icon.svg"
import microphone_icon from "../assets/msg_entry/microphone_icon.svg"



const MsgEntry = (props) => {
     
    const [prompt, setPrompt] = useState(null);
    const textRef = useRef();  
    
    const handleTextareaChange = () => {
        if (textRef.current) {
            textRef.current.style.height = '7px'; // Reset the height 7px
            textRef.current.style.height = `${textRef.current.scrollHeight}px`; // Set the height to the scrollHeight
        }
    };

    const sendPrompt = async (e) => {
        const newMessage = textRef.current.value
        if (newMessage.trim() != ''){
            console.log('message: ' + newMessage);
            props.setPrompt(newMessage)
            var messageComp = {'user_message': newMessage, "gpt_reply": 'Hello, I am your AI'}
            const updatedMessagesArray = [...props.promptResponseArray, messageComp];
            // get the response from API
            props.setPromptResponseArray(updatedMessagesArray);
            textRef.current.value = '';
            handleTextareaChange()
        }
    }

    return(
        <div className="flex flex-row space-x-6" >
            <div className='rounded-3xl bg-[#3c586e] px-8 py-3 min-h-11 flex flex-grow'>
                <textarea className="bg-transparent focus:outline-none h-7 text-white resize-none w-full" 
                        ref={textRef}
                        placeholder="Type a prompt... "
                        onKeyDown={(event) => {
                            if (event.keyCode === 13) {
                                sendPrompt();
                            }
                        }}
                        onChange={handleTextareaChange}>
                    </textarea>
                    <button>
                        <img src={microphone_icon}/>
                    </button>
            </div>
            <button onClick={sendPrompt}>
                <img src={send_message_icon}/>
            </button>

        </div>
    );
}

export default MsgEntry;