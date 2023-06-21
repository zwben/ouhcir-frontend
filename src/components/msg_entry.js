import {useState, useRef} from 'react';
import Prompt from './prompt';
import Response from './response';
import send_message_icon from "../assets/msg_entry/send_message_icon.svg"
import microphone_icon from "../assets/msg_entry/microphone_icon.svg"



const MsgEntry = (props) => {
     
    // const [prompt, setPrompt] = useState(null);
    const textRef = useRef();      

    const sendMessage = async (e) => {
        const newMessage = textRef.current.value
        console.log('message: ' + newMessage);
        props.setPrompt(newMessage)
        var messageComp = {'user_message': newMessage, "gpt_reply": ''}
        const updatedMessagesArray = [...props.messagesArray, messageComp];
        // get the response from API
        props.setMessagesArray(updatedMessagesArray);
        textRef.current.value = '';
    }

    return(
        <div className="" >
            <div className='rounded-3xl bg-[#3c586e] px-8 py-3 min-h-11 flex flex-grow'>
                <textarea className="bg-transparent focus:outline-none h-7 text-white resize-none w-full" 
                        ref={textRef}
                        placeholder="Type a prompt... "
                        onKeyDown={(event) => {
                            if (event.keyCode === 13) {
                                sendMessage();
                            }
                        }}>
                    </textarea>
                    <button onClick={sendMessage}>
                        <img src={microphone_icon}/>
                    </button>
            </div>

        </div>
    );
}

export default MsgEntry;