import { useState, useContext} from "react";
import { collection, addDoc } from 'firebase/firestore';
import AuthContext from "../context/auth-context";
import TaskContext from "../context/task-context";
import { db } from "../firebase-config";

const Questionnaire = (props) => {
    const [fimiliaritySelectedOption, setFimiliaritySelectedOption] = useState(null);
    const [complexitySelectedOption, setComplexitySelectedOption] = useState(null)
    const [expectationSelectedOption, setExpectationSelectedOption] = useState(null)
    const [timeExpectationSelectedOption, setTimeExpectationSelectedOption] = useState(null)
    const [answerQualitySelectedOption, setAnswerQualitySelectedOption] = useState(null)
    const [promptFormulateSelectedOption, setPromptFormulateSelectedOption] = useState(null)
    // labels
    const [taskTopic,setTaskTopic] = useState('')
    const [promptsNum, setPromptsNum] = useState(0) 
    const [otherTaskType, setOtherTaskType] = useState('')
    const [otherExpectedOutcome, setOtherExpectedOutcome] = useState('')
    const [other, setOther] = useState('')
    const [taskTypeCheckboxes, setTaskTypeCheckboxes] = useState([]);   // list to containt checkbox values

    // contexts
    const authCtx = useContext(AuthContext)
    const taskCtx = useContext(TaskContext)

    const taskTypes = ['Learning a new topic', 'Completing an assignment', 'Writing or generating text', 
                        'Engaging in casual conversation or chat', 'Brainstorming ideas', 'Conducting academic research ideas',
                        'Replacing traditional search engines', 'Developing or programming', 'Other' ]
    const expectationTypes = ['Get a broad idea of the task', 'Partial complete', 'Fully complete', 'Other']
    const timeExpectationList = ['Less than 30 minutes', '1 to 2 hours', 'More than 3 hours'] 
    const answerQualityList = [
                                'uncertain: I am not sure what it will output, and I need to use several prompts to get the information I need', 
                                'Somewhat useful: Outputs from some prompts will be useful for me to proceed the task', 
                                'Useful: Outputs from most prompts will be useful for me to proceed the task', 
                                'Very useful : I can use a few prompts to get all detailed information I need', 
                                'Extremely useful: I can use one prompt, and the output from that prompt will contain all detailed information I need']
    const promptFormulateTimeList = [
                                    '30s: I can come up with the idea of how to formulate the prompt instantly', 
                                    '30s to 1.5 min: I can formulate the prompt quickly but may need to reformulate it once to revise some specific words',
                                    '1.5 to 3 min: I need some time to reformulate the prompt, but it will not take so long',
                                    '3 to 5 min: I need some time to reformulate the prompt',
                                    '5 more than 5 min: I need more time to reformulate the prompt to express my information need'
                                    ]
    const handleCheckboxChange = (value) => {
      if (taskTypeCheckboxes.includes(value)) {
        setTaskTypeCheckboxes(taskTypeCheckboxes.filter((item) => item !== value));
      } else{
        console.log(value)
        // If other is selected, enable the label for input
        setTaskTypeCheckboxes([...taskTypeCheckboxes, value]);
      }
      console.log(taskTypeCheckboxes)
    };
  
    const handleButtonClick = (buttonNumber) => {
        setFimiliaritySelectedOption(buttonNumber);
    };

    const handleSubmit = async () => {
        // Confirm is the user actually wants to save
        const shouldProceed = window.confirm('Are you sure you want to submit the form?');
        if(shouldProceed){
            // check if taskTypeCheckboxes include other, and append the value of the label to it
            if (taskTypeCheckboxes.includes('Other')){
                taskTypeCheckboxes.splice(taskTypeCheckboxes.indexOf('Other'))
                taskTypeCheckboxes.push('Other: ' + otherTaskType)
            }
            var finalExpectationType = expectationTypes[expectationSelectedOption]
            if (finalExpectationType === 'Other'){
                finalExpectationType = 'Other: ' + otherExpectedOutcome
            }
            console.log(authCtx.user)
            try {
                const formData = {
                    'userID': authCtx.user.uid,
                    'taskTopic': taskTopic,
                    'topicFimiliarityBasic': fimiliaritySelectedOption + 1,
                    'topicFimiliaritySpecific': 'temp',
                    'taskType': taskTypeCheckboxes,
                    'expectedComplexityBasic': complexitySelectedOption + 1,
                    'expectedComplexitySpecific': 'temp',
                    'expectedOutcome': finalExpectationType,
                    'expectedNumberOfPrompts': promptsNum,
                    'expectedSpendingTime': timeExpectationList[timeExpectationSelectedOption],
                    'expectedAnswerQuality': answerQualityList[answerQualitySelectedOption],
                    'expectedPromptFormulateTime': promptFormulateTimeList[promptFormulateSelectedOption],
                    'OtherExpectationsOfCost': other
                };
                const docRef = await addDoc(collection(db, 'pre_task_questionaire'), formData);
                console.log('Document written with ID:', docRef.id);
                taskCtx.saveTask(taskTopic, docRef.id)
                props.setShowQuestionnaire(false)
                alert('You questionnaire is saved. You can now start interacting with the chatbot.')
            } catch (error) {
                console.error('Error adding document:', error);
            }
            }
        };
          

    return(
        <div className="flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl min-w-[30rem] max-h-[85%] overflow-auto">
            <h1 className="text-white text-center">Pre-task Questionnaire</h1>
            {/* Questions */}
            <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
                {/* Question 1 */}
                <h1>1. Task name</h1>
                <div className="flex flex-row justify-between rounded-md bg-[#2F4454] mr-9 py-1">
                    <input 
                        className="w-full bg-transparent outline-none px-2 h-7"
                        onChange={(e)=>{setTaskTopic(e.target.value)}}>                            
                    </input>
                </div>
                {/* Question 2 */}
                <h1>2. Topic fimiliarity</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 5}).map((_, index) => {
                        return (
                            <button
                            key={index}
                            className={`w-4 h-4 rounded-full border-[1px] border-white ${
                                fimiliaritySelectedOption === index ? "bg-white" : ""}`}
                            onClick={() => handleButtonClick(index)}
                            ></button>
                        );
                        })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Not at all</h1>
                    <h1>Somewhat    </h1>
                    <h1>Extremely</h1>
                </div>
                {/* Question 3 */}
                <h1>3. Task type (check all that apply)</h1>
                <div className="flex flex-col space-y-3">
                    {/* // Make checkboxes using array */}
                    {taskTypes.map((taskName, index) => (
                        <div key={index} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={taskTypeCheckboxes.includes(taskName)}
                            onChange={() => handleCheckboxChange(taskName)}
                            className="form-checkbox mr-2 w-5 h-5 rounded bg-transparent border-[1px] border-white focus:ring-transparent focus:border-none"
                        />
                        <label  htmlFor={`checkbox-${index}`} className="text-white"> 
                            {taskName}
                        </label>
                        </div>
                    ))}
                    <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
                        <input 
                            className="w-full bg-transparent outline-none px-2 h-7"
                            onChange={(e) => {
                                setOtherTaskType(e.target.value)
                            }}></input>
                    </div>
                </div>
                {/* Question 4 */}
                <h1>4. How complex do you think it will be to complex this task?</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 5}).map((_, index) => {
                        return (
                            <button
                                key={index}
                                className={`w-4 h-4 rounded-full border-[1px] border-white ${complexitySelectedOption === index ? "bg-white" : ""}`}
                                onClick={() => {
                                    setComplexitySelectedOption(index)
                                }}
                            ></button>
                        );
                        })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Not at all</h1>
                    <h1>Somewhat    </h1>
                    <h1>Extremely</h1>
                </div>
                {/* Question 5 */}
                <h1>5. How do you expect to complete the task?</h1>
                <div className="flex flex-col pl-8 pr-16 space-y-4 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 4}).map((_, index) => {
                        return (
                            <div className="flex flex-row space-x-2 items-center">
                                <button
                                    key={index}
                                    className={`w-4 h-4 rounded-full border-[1px] border-white ${expectationSelectedOption === index ? "bg-white" : ""}`}
                                    onClick={() => {
                                        setExpectationSelectedOption(index)
                                    }}>
                                </button>
                                <label>{expectationTypes[index]}</label>
                            </div>
                        );
                        })}
                    <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
                        <input 
                            className="w-full bg-transparent outline-none px-2 h-7"
                            onChange={(e)=>{setOtherExpectedOutcome(e.target.value)}}>    
                        </input>
                    </div>
                </div>
                {/* Question 6*/}
                <h1>6. How many prompts do you expect to formulate or reformulate prompt to achieve your expected outcome?</h1>
                <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
                    <input 
                        className="w-full bg-transparent outline-none px-2 h-7" contentEditable={true}
                        onChange={(e)=>{setPromptsNum(e.target.value)}}>
                    </input>
                </div>
                {/* Question 7*/}
                <h1>7. How much time do you expect it will take to achieve your expected outcome?</h1>
                <div className="flex flex-col pl-8 pr-16 space-y-4 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 3}).map((_, index) => {
                        return (
                            <div className="flex flex-row space-x-2 items-center">
                                <button
                                    key={index}
                                    className={`w-4 h-4 rounded-full border-[1px] border-white ${timeExpectationSelectedOption === index ? "bg-white" : ""}`}
                                    onClick={() => {
                                        setTimeExpectationSelectedOption(index)
                                    }}>
                                </button>
                                <label>{timeExpectationList[index]}</label>
                            </div>
                        );
                        })}
                </div>
                {/* Question 8 */}
                <h1>8. How do you expect the quality of ChatGPT’s output toward achieving your outcome?</h1>
                <div className="flex flex-col pl-8 pr-16 space-y-4 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 5}).map((_, index) => {
                        return (
                            <div className="flex flex-row space-x-2 items-center">
                                <div>
                                    <button
                                        key={index}
                                        className={`w-4 h-4 rounded-full border-[1px] border-white ${answerQualitySelectedOption === index ? "bg-white" : ""}`}
                                        onClick={() => {
                                            setAnswerQualitySelectedOption(index)
                                        }}>
                                    </button>
                                </div>
                                <label>{answerQualityList[index]}</label>
                            </div>
                        );
                        })}
                </div>
                {/* Question 9 */}
                <h1>9. How much time do you expect it will take to formulate prompts for a single information need (a simple task or one step of a complex task)?</h1>
                <div className="flex flex-col pl-8 pr-16 space-y-4 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 5}).map((_, index) => {
                        return (
                            <div className="flex flex-row space-x-2 items-center">
                                <div>
                                    <button
                                        key={index}
                                        className={`w-4 h-4 rounded-full border-[1px] border-white ${promptFormulateSelectedOption === index ? "bg-white" : ""}`}
                                        onClick={() => {
                                            setPromptFormulateSelectedOption(index)
                                        }}>
                                    </button>
                                </div>
                                <label>{promptFormulateTimeList[index]}</label>
                            </div>
                        );
                        })}
                </div>
                {/* Question 10 */}
                <h1>10. What other cost or effort do you expect during the task?</h1>
                <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
                    <input 
                        className="w-full bg-transparent outline-none px-2 h-7"
                        onChange={(e) => {
                            setOther(e.target.value)
                        }}>    
                    </input>
                </div>
            </div>
            <div className="flex flex-row justify-around mt-8">
                <button className="underline text-white"onClick={() => props.setShowQuestionnaire(false)}>Cancel</button>
                <button className="bg-white px-6 py-2 rounded-2xl" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );

}

export default Questionnaire;