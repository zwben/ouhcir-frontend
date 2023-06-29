import { useState, useRef} from "react";

const CommentPopUp = (props) => {
    const [comment, setComment] = useState('');

    // Inside the component
    const textRef = useRef(null);

    const handleTextareaChange = () => {
        if (textRef.current) {
            textRef.current.style.height = 'auto'; // Reset the height to auto
            textRef.current.style.height = `${textRef.current.scrollHeight}px`; // Set the height to the scrollHeight
        }
    };

    const handleSubmit = () => {
        // onSubmit(comment);
        setComment('');
    };
    
    return(
        <div className="flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl">
            <textarea 
                ref = {textRef}
                className="bg-transparent overflow-hidden focus:outline-none text-white resize-none h-auto w-[21rem]" 
                placeholder="Type your comment"
                onChange={handleTextareaChange}
                >
            </textarea>
            <div className="flex flex-row justify-around mt-8">
                <button className="underline text-white"onClick={() => props.setShowCommentPopup(false)}>Cancel</button>
                <button className="bg-white px-6 py-2 rounded-2xl">Submit</button>
            </div>
        </div>
    );

}

export default CommentPopUp;