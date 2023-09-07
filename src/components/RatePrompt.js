import React, { useState, useContext } from "react";
import { collection, addDoc, query, where, getDocs, updateDoc, orderBy, endAt, limit } from "firebase/firestore";
import { db } from "../firebase-config";
import QueContext from '../context/que-context';
import TaskContext from '../context/task-context';
import { openai } from '../openai-config';

const RatePrompt = (props) => {
  const [usefulnessRating, setUsefulnessRating] = useState(null);
  const [credibilityRating, setCredibilityRating] = useState(null);
  const [recommendationRating, setRecommendationRating] = useState(null);
  const [satisfactionRating, setSatisfactionRating] = useState(null);
  const [explanationOptions, setExplanationOptions] = useState([])
  const [explanationSelectedOption, setExplanationSelectedOption] = useState(-1)
  const [explanationRate, setExplanationRate] = useState(-1)
  const [isLoading, setIsLoading] = useState(false);
  const [selfExp, setSelfExp] = useState('')
  const queCtx = useContext(QueContext)
  const taskCtx = useContext(TaskContext)
  const explanationRateList = [
    'Very Poor: The explanation is entirely incorrect, incomprehensible, leaving the user completely confused.', 
    'Poor: The explanation is mostly inaccurate, unclear, or incomplete, making it challenging for the user to understand.', 
    'Fair: The explanation is somewhat relevant and clear but may contain some inaccuracies or lack important details.', 
    'Good: The explanation is mostly accurate and clear, offering a satisfactory understanding of the prompt or the output.', 
    'Excellent: The explanation provided by ChatGPT is highly accurate, clear, and thoroughly explain the prompt or the output.']

  const handleGenerateExplanation = async () => {
    setIsLoading(true)
    const {
        taskTopic,
        taskType,
        topicFamiliaritySpecificOptions,
        topicFamiliaritySpecificSelectedOption,
        expectedComplexitySpecificOptions,
        expectedComplexitySpecificSelectedOption,
        expectedSpendingTime,
        expectedOutcome,
    } = queCtx.formData
    const chatsCollection = collection(db, "chatsIndividual"); 
    const currentQ = query(chatsCollection, where("id", "==", props.promptID));
    
    const querySnapshot = await getDocs(currentQ);
    const role = querySnapshot.docs[0].data().role;
    const prompt = querySnapshot.docs[0].data().prompt;
    let explainMessage = '';
    if (role === 'user') {
        explainMessage = `The user entered a prompt: "${prompt}". 
        The user is reviewing how the prompt relates to and help proceed the task.
        Please provide five short possible explanations for user's intentions with that prompt.`
    }
    else if (role === 'assistant') {
        const previousQ = query(
        chatsCollection,
        where('taskID', '==', taskCtx?.taskID),
        orderBy('typingEndTime', 'asc'),
        endAt(props.promptID), limit(1));
        // const previousQ = query(q, orderBy('typingEndTime', 'desc'), startAt(props.promptID), limit(1));
        const prevQuerySnapshot = await getDocs(previousQ);
        const prevPrompt = prevQuerySnapshot.docs[0].data().prompt;
        explainMessage = `The user entered a prompt: "${prevPrompt}", and ChatGPT responsed: "${prompt}". 
        The user is reviewing how the prompt and response relates to and help proceed the task.
        Please provide five short possible explanations for how ChatGPT addressed the user's needs.`
        // console.log(prevPrompt)
        }
    const messages=[
        {
          "role": "system",
          "content": `You are an assistant help the user ${taskType +' about '+ taskTopic}. 
          The user has a familiarity degree of (${topicFamiliaritySpecificSelectedOption + 1} out of 5), 
           stating ${topicFamiliaritySpecificOptions[topicFamiliaritySpecificSelectedOption]}".
            The user think the complexity of this task (${expectedComplexitySpecificSelectedOption + 1} out of 5), 
            ${expectedComplexitySpecificOptions[expectedComplexitySpecificSelectedOption]}. 
            The user expects to spend ${expectedSpendingTime} to ${expectedOutcome}. 
            Given the familiarity level, complexity level, and user expectations, 
            adjust your answers so that the user can understand better.`
        },
        {
          "role": "user",
          "content": `${explainMessage}. You output must be in the json format with the keynum as keys and explanations as values.}`
        }]
    // console.log(messages)
    const response = await openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages:messages, 
        max_tokens: 512,
    })
    const res = JSON.parse(response.data.choices[0].message.content);
    const tempArray = [];
    for (const key in res) {
        const item = res[key];
        tempArray.push(`${key}. ${item}`);
    }
    setExplanationOptions(tempArray);
    setIsLoading(false);
}

  const handleSubmit = async () => {
        const shouldProceed = window.confirm("Are you sure you want to submit the form?");
        if (shouldProceed) {
            const formData = {
                promptID: props.promptID,
                usefulnessRating: usefulnessRating + 1,
                credibilityRating: credibilityRating + 1,
                recommendationRating: recommendationRating + 1,
                satisfactionRating: satisfactionRating + 1,
                explanationOptions,
                explanationSelectedOption: explanationSelectedOption,
                explanationRate: explanationRate,
                selfExp: selfExp,
            };

            try {
                // Save the form data to Firestore
                const docRef = await addDoc(collection(db, "promptRatings"), formData);
                console.log("Document written with ID:", docRef.id);
                // Query for the chat document matching the promptID
                const chatsCollection = collection(db, "chatsIndividual"); 
                const q = query(chatsCollection, where("id", "==", props.promptID));

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // Get the first document (assuming only one document will match)
                    const chatDoc = querySnapshot.docs[0];

                    // Update the chat document with the new ratingID
                    await updateDoc(chatDoc.ref, {
                        ratingID: docRef.id
                    });
                } else {
                    console.error("No matching chat document found for promptID:", props.promptID);
                }
                // Close the prompt and handle any further actions here (if needed)
                props.setShowRatePrompt(false);
                props.setIsPromptRated(new Date()) // to force rerender of useEffect to fetch the ratingID
            } catch (error) {
                console.error("Error adding document:", error);
            }
        }
  };


  return (
    <div className="fixed flex flex-col bg-[#142838] py-12 px-20 h-fit rounded-xl min-w-[30rem] max-h-[85%] overflow-auto space-y-4">
        {/* Generate Explanation Button */}
        <div className="text-white text-center mb-2 font-bold">
            <h1>Part 1: Explain this prompt or ouput (AI generated explanation)</h1>
        </div>
            <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>1. Please click the button and ChatGPT will generate five explanations for the corresponding prompt/response. 
                Review the option and choose the best explanation. </h1>
            {/* {topicFamiliaritySpecificOptions.length === 0 && submitClicked && <p className="text-red-500 text-sm">required</p>} */}
        
        {!isLoading ? (
            <div class="container py-3 px-10 mx-0 min-w-full flex flex-col items-center">
                <button 
                    className="inline-flex justify-center bg-white px-6 py-2 w-fit rounded-2xl text-black"
                    onClick={handleGenerateExplanation}
                    >
                        Click to generate an explanation
                </button>
            </div>
            ) : (
                <p className="text-white mt-4 text-center">Generating...</p>
                )}
                {/* Display Explanation */}
                {explanationOptions.length > 0 && !isLoading && (
                <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
                    {explanationOptions.map((option, index) => (
                        <div key={index} className="flex items-center flex-row">
                            <div>
                                <button
                                    value={option}
                                    className={`w-4 h-4 rounded-full border-[1px] border-white ${explanationSelectedOption === index ? "bg-white" : ""}`}
                                    onClick={() => setExplanationSelectedOption(index)}
                                ></button>
                            </div>
                            <label className="ml-2 text-white">
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
        )}
        </div>  
        <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>2. How do you rate the selected evaluation?</h1>
            <div className="flex flex-col pl-2 pr-8 space-y-4 justify-between">
                {/* Array to generate the radio buttons */}
                {Array.from({length: 5}).map((_, index) => {
                    return (
                        <div className="flex flex-row space-x-2 items-center">
                            <div>
                                <button
                                    key={index}
                                    className={`w-4 h-4 rounded-full border-[1px] border-white ${explanationRate === index ? "bg-white" : ""}`}
                                    onClick={() => {
                                        setExplanationRate(index)
                                    }}>
                                </button>
                            </div>
                            <label>{explanationRateList[index]}</label>
                        </div>
                    );
                    })}
            </div>
        
        <h1>3. If you think the evaluation is poor or very poor, please explain *</h1>
        <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
            <input 
                className="w-full bg-transparent outline-none px-2 h-7"
                onChange={(e) => {
                    setSelfExp(e.target.value)
                }}>    
            </input>
        </div>  
        </div>    
        {/*display a breaking line */}
        <hr className="border-white border-[1px]"></hr>
        <h1 className="text-white text-center mb-2 font-bold">Part 2: Rate Prompt Questionnaire</h1>
        {/* Usefulness Rating */}
        <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>1. How useful was the prompt in guiding ChatGPT's response?</h1>
            <div className="flex flex-row pl-8 pr-16 justify-between">
                {/* Array to generate the radio buttons */}
                {Array.from({ length: 5 }).map((_, index) => {
                    return (
                    <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-[1px] border-white ${
                        usefulnessRating === index ? "bg-white" : ""
                        }`}
                        onClick={() => setUsefulnessRating(index)}
                    ></button>
                    );
                })}
            </div>
            <div className="flex justify-between pl-4 pr-8">
                <h1>Not Useful</h1>
                <h1>Moderately Useful</h1>
                <h1>Extremely Useful</h1>
            </div>
        </div>

        {/* Credibility Rating */}
        <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>2. How credible was the output provided by ChatGPT?</h1>
            <div className="flex flex-row pl-8 pr-16 justify-between">
                {/* Array to generate the radio buttons */}
                {Array.from({ length: 5 }).map((_, index) => {
                    return (
                    <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-[1px] border-white ${
                        credibilityRating === index ? "bg-white" : ""
                        }`}
                        onClick={() => setCredibilityRating(index)}
                    ></button>
                    );
                })}
            </div>
            <div className="flex justify-between pl-4 pr-8">
                <h1>Not Credible</h1>
                <h1>Moderately Credible</h1>
                <h1>Extremely Credible</h1>
            </div>
         </div>

        {/* Recommendation Rating */}
        <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>
                3. If this prompt and output will be shared in the online community to
                help other users with similar questions, how likely are you to
                recommend your prompts and ChatGPT’s output?
            </h1>
            <div className="flex flex-row pl-8 pr-16 justify-between">
                {/* Array to generate the radio buttons */}
                {Array.from({ length: 5 }).map((_, index) => {
                    return (
                    <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-[1px] border-white ${
                        recommendationRating === index ? "bg-white" : ""
                        }`}
                        onClick={() => setRecommendationRating(index)}
                    ></button>
                    );
                })}
            </div>
            <div className="flex justify-between pl-4 pr-8">
                <h1>Not likely</h1>
                <h1>Somewhat likely</h1>
                <h1>Very likely</h1>
            </div>
        </div>

        {/* Satisfaction Rating */}
        <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
            <h1>4. Rate your satisfaction level with this prompt and its output.</h1>
            <div className="flex flex-row pl-8 pr-16 justify-between">
                {/* Array to generate the radio buttons */}
                {Array.from({ length: 5 }).map((_, index) => {
                    return (
                    <button
                        key={index}
                        className={`w-4 h-4 rounded-full border-[1px] border-white ${
                        satisfactionRating === index ? "bg-white" : ""
                        }`}
                        onClick={() => setSatisfactionRating(index)}
                    ></button>
                    );
            })}
            </div>
            <div className="flex justify-between pl-4 pr-8">
                <h1>Very unsatisfied</h1>
                <h1>Neutral</h1>
                <h1>Very satisfied</h1>
            </div>
        </div>
        <div className="flex flex-row justify-around mt-12">
                <button
                    className="underline text-white"
                    onClick={() => props.setShowRatePrompt(false)}
                >
                    Cancel
                </button>
                <button
                    className="bg-white px-6 py-2 rounded-2xl"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
        </div>
    </div>
  );
};

export default RatePrompt;
