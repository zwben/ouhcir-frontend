import {useState, useRef, useContext} from 'react';
import { ReactMic } from 'react-mic';
import send_message_icon from "../assets/msg_entry/send_message_icon.svg"
import microphone_icon from "../assets/msg_entry/microphone_icon.svg"
import TaskContext from '../context/task-context';
import AuthContext from '../context/auth-context';
import { db } from '../firebase-config';
import { addDoc, collection } from 'firebase/firestore';
import { uid } from 'uid';

const RecordingModal = ({isOpen, onClose}) => {
    // eslint-disable-next-line no-unused-vars 
    const [prompt, setPrompt] = useState(null);
    const [typingStartTime, setTypingStartTime] = useState(null); // Timestamp for when user starts typing
    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const openRecordingModal = () => {
    startRecording();
        setIsRecordingModalOpen(true);
    };
    const closeRecordingModal = () => {
        stopRecording();
        setIsRecordingModalOpen(false);
    };
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [recordingEndTime, setRecordingEndTime] = useState(null);
    const [recordID, setRecordID] = useState(null);

    const textRef = useRef();  
    const taskCtx = useContext(TaskContext)
    const authCtx = useContext(AuthContext)
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();
        setRecordingStartTime(new Date());
        
        // Generate a unique ID for this recording
        const newRecordID = uid();
        setRecordID(newRecordID);
        
        recorder.onstop = () => {
            // Handle recording stop
            setRecordingEndTime(new Date());
            // TODO: Save recording data to Firestore (Step 3)
        };
    };
    
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
       }
    };
    const saveRecordingDetails = async () => {
        const recordingDetails = {
            id: recordID,
            taskID: taskCtx?.taskID || '',
            userID: authCtx?.user.uid || '',
            recordingStartTime,
            recordingEndTime
        };
        
        try {
            const recordingRef = collection(db, 'recordings'); // Assuming there's a 'recordings' collection in Firestore
            await addDoc(recordingRef, recordingDetails);
            console.log('Recording details saved successfully!');
        } catch (error) {
            console.error('Error saving recording details:', error);
        }
    };
        
    return(
        <div className='flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl'>
            <div>
                <h3>Think Aloud Protocol</h3>
                <p>Please speak your thoughts aloud as you complete the task.</p>
                <p>This will help us understand your thought process and any challenges you face.</p>
                <h3>Template</h3>
                <p>[Your thoughts here...]</p>
                <button onClick={onClose}>Close Modal</button>
            </div>
        
        </div>
    );
}
export default RecordingModal;