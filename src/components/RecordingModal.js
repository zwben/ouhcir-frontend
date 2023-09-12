import {useState, useRef, useContext, useEffect} from 'react';
import microphone_icon from "../assets/msg_entry/microphone_icon.svg"
import TaskContext from '../context/task-context';
import AuthContext from '../context/auth-context';
import { db } from '../firebase-config';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage';

import { addDoc, collection } from 'firebase/firestore';
import { uid } from 'uid';

const RecordingModal = ({isOpen, onClose}) => {


const [elapsedTime, setElapsedTime] = useState(0);

const [timerStatus, setTimerStatus] = useState('reset');

const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

useEffect(() => {
    let interval;
    if (timerStatus === 'running') {
        interval = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
    } else if (timerStatus === 'reset') {
        setElapsedTime(0);
    }

    return () => {
        clearInterval(interval);
    };
}, [timerStatus]);

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

    const [audioData, setAudioData] = useState([]);
    const [playbackURL, setPlaybackURL] = useState("");


    const textRef = useRef();  
    const taskCtx = useContext(TaskContext)
    const authCtx = useContext(AuthContext)

    const startRecording = async () => {
    setTimerStatus('running');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();
        setRecordingStartTime(new Date());
        
        // Generate a unique ID for this recording
        const newRecordID = uid();
        setRecordID(newRecordID);
        
        
    recorder.ondataavailable = (event) => {
        setAudioData((prevData) => [...prevData, event.data]);
    };

        recorder.onstop = () => {
            // Handle recording stop
            setRecordingEndTime(new Date());
        };
    };
    
    const stopRecording = () => {
    setTimerStatus('paused');
        if (mediaRecorder) {
            mediaRecorder.stop();

        const audioBlob = new Blob(audioData, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
        setPlaybackURL(audioURL);

       }
    };
    
    const discardRecording = () => {
    setTimerStatus('reset');
        if (mediaRecorder) {
            mediaRecorder.stop();

        }
        setAudioData([]);
        setRecordID(null);
        setRecordingStartTime(null);
        setRecordingEndTime(null);
    };

    
    const playRecording = async () => {
        if (audioData.length === 0) {
            console.error("No audio data available for playback.");
            return;
        }
        
        // Create a blob from the audio data
        const audioBlob = new Blob(audioData, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);
    
        const audio = new Audio(audioURL);
        try {
            await audio.play();
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const saveRecordingDetails = async () => {
        if (audioData.length === 0) {
            window.alert("No audio data available for upload.");
            return;
        }
        const shouldProceed = window.confirm('Are you sure you want to upload the recording?');
        if(shouldProceed){
        const audioBlob = new Blob(audioData, { type: 'audio/wav' });
        const storage = getStorage();
        // 1. Upload the audio file to Firebase Storage
        // Assuming 'recordings' is your desired storage folder
        const storageRef = ref(storage, 'recordings/' + recordID + '.wav');
        const uploadTask = uploadBytesResumable(storageRef, audioBlob);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Track the upload progress (Optional)
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                console.error('Error uploading file:', error);
            }, 
            async () => {
                // Handle successful uploads on complete
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const recordingDetails = {
                        id: recordID,
                        taskID: taskCtx?.taskID || '',
                        userID: authCtx?.user.uid || '',
                        recordingStartTime,
                        recordingEndTime,
                        audioFileURL: downloadURL // This is the URL to access the audio file
                    };
    
                    const recordingRef = collection(db, 'recordings');
                    await addDoc(recordingRef, recordingDetails);
                    console.log('Recording details and audio file saved successfully!');
                } catch (error) {
                    console.error('Error saving recording details:', error);
                }
            }
        );
    }
    };
    
    const handleClose = () => {
        if (audioData.length!==0) {
            const userConfirmed = window.confirm("You have an unsaved recording. Do you want to upload it before close?");
            if (userConfirmed) {
                saveRecordingDetails();
                onClose();
            }
        } else {
            onClose();
        }
    };
            
    return(
        <div className='flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl w-1/2'>
            <div className='text-white'>
                <h3 className='text-center text-lg'>Think Aloud Protocol</h3>
                <p className='italic'>
                    When interacting with ChatGPT, we would appreciate it if you could verbalize your thoughts and reactions.
                    The goal is to capture your impressions and insights as you write your questions (prompts) and read the outputs.
                    </p>
                <p className='underline mt-4'>As you compose your prompts:</p>
                <p>• Share your initial expectations, concerns, or uncertainties about how ChatGPT will respond.</p>
                <p>• Explain any context or background information that you think is relevant.</p>
                <p>• Articulate the reasoning behind the structure or wording of your questions.</p>
                <p className='underline'>While reading ChatGPT's outputs:</p>
                <p>• Express your thoughts on the quality and relevance of the generated responses.</p>
                <p>• Highlight any surprising or insightful aspects of the outputs.</p>
                <p>• Identify areas where the responses may be helpful or need improvement.</p>
                <p className='italic mt-4'>Remember, we value your honest feedback and suggestions. Your recordings will be treated confidentially and used only for research and improvement purposes. Your input will help us enhance the ChatGPT experience.</p>

                <div className="flex justify-center text-lg mt-6">{formatTime(elapsedTime)}</div>
            </div>

            <div className="flex flex-row justify-between mt-4">
                <button className="bg-white px-6 py-2 rounded-2xl w-1/3" onClick={startRecording}>Start Recording</button>
                <button className="bg-white px-6 py-2 rounded-2xl w-1/3" onClick={stopRecording}> End Recording</button>
            </div>

            <div className="flex flex-row justify-between mt-4">
                <button className="bg-white px-6 py-2 rounded-2xl w-1/3" onClick={discardRecording}>Discard</button>
                <button className="bg-white px-6 py-2 rounded-2xl w-1/3" onClick={playRecording}>Play Recording</button>
            </div>

            <div className="flex flex-row justify-between mt-12">
                <button className="underline text-white w-1/3" onClick={handleClose}> Close </button>
                <button className="bg-white px-6 py-2 rounded-2xl w-1/3" onClick={saveRecordingDetails}> Upload </button>
            </div>
        </div>

    );
}
export default RecordingModal;