import { useState } from "react";

const PostTaskQuestionnaire = (props) => {
    const [gainConfirmation, setGainConfirmation] = useState(null);
    const [costConfirmation, setCostConfirmation] = useState(null);
    const [satisfaction, setSatisfaction] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [encounteredProblems, setEncounteredProblems] = useState([]);
    const [otherChallenges, setOtherChallenges] = useState('');

    
    // Array of encountered problems with subgroups
    const encounteredProblemsList = [
        {
            problems: [
                'No challenges'
            ]
        },
        {
            heading: 'Understanding and refining prompts:',
            problems: [
                'Difficulty in formulating clear and effective prompts',
                'Struggling to refine and iterate prompts for desired outputs',
        ],
        },
        {
            heading: 'Obtaining relevant and accurate information:',
            problems: [
                'Receiving irrelevant or off-topic responses',
                'Inaccurate or unreliable information provided by ChatGPT',
        ],
        },
        {
            heading: 'Handling ambiguous or complex queries:',
            problems: [
                'ChatGPT struggling to comprehend complex or nuanced questions',
                'Dealing with ambiguity in queries and getting appropriate responses',
        ],
        },
        {
            heading: 'Managing task-specific requirements:',
            problems: [
                'ChatGPT not understanding specific task requirements or constraints',
                'Challenges in conveying task-specific context or instructions effectively',
        ],
        },
        {
            heading: 'Engaging in meaningful conversations:',
            problems: [
                'Difficulty in having coherent and contextually relevant conversations with ChatGPT',
                'Limited ability of ChatGPT to sustain engaging and interactive dialogue',
        ],
        },
        {
            heading: 'Ensuring ethical and unbiased responses:',
            problems: [
                "Concerns about potential biases or inappropriate content in ChatGPT's responses",
                'Challenges in ensuring responsible and ethical use of ChatGPT',
        ],
        },
        {
            problems: [
                'Other challenges' 
            ]
        },];

    // Handle checkbox change
    const handleEncounteredProblemsChange = (problem) => {
            if (encounteredProblems.includes(problem)) {
                setEncounteredProblems(encounteredProblems.filter((p) => p !== problem));
            } else {
                setEncounteredProblems([...encounteredProblems, problem]);
            }
    };

    const handleSubmit = () => {
        
    }

    return(
        <div className="flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl min-w-[30rem] max-h-[85%] overflow-auto">
            <h1 className="text-white text-center">Post task Questionnaire</h1>
            {/* Questions */}
            <div className="flex flex-col text-white space-y-4 max-w-[28rem]">
                <h1>1. How much outcome did you obtain through this task?</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <button
                                key={index}
                                className={`w-4 h-4 rounded-full border-[1px] border-white ${gainConfirmation === index ? "bg-white" : ""}`}
                                onClick={() => setGainConfirmation(index)}
                            ></button>
                        );
                    })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Much less than expected</h1>
                    <h1>Just as expected</h1>
                    <h1>Much more than expected</h1>
                </div>

                {/* Question 2 */}
                <h1>2. How much effort did it take for you to obtain the outcome through this task?</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <button
                                key={index}
                                className={`w-4 h-4 rounded-full border-[1px] border-white ${costConfirmation === index ? "bg-white" : ""}`}
                                onClick={() => setCostConfirmation(index)}
                            ></button>
                        );
                    })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Much less than expected</h1>
                    <h1>Just as expected</h1>
                    <h1>Much more than expected</h1>
                </div>

                {/* Question 3 */}
                <h1>3. Rate your satisfaction level with this task.</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <button
                                key={index}
                                className={`w-4 h-4 rounded-full border-[1px] border-white ${satisfaction === index ? "bg-white" : ""}`}
                                onClick={() => setSatisfaction(index)}
                            ></button>
                        );
                    })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Very unsatisfied</h1>
                    <h1>Unsatisfied</h1>
                    <h1>Neutral</h1>
                    <h1>Satisfied</h1>
                    <h1>Very satisfied</h1>
                </div>

                {/* Question 4 */}
                <h1>4. If this task content will be shared in the online community to help other users with similar tasks, how likely is it for you to recommend your prompts and ChatGPT’s output?</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <button
                                key={index}
                                className={`w-4 h-4 rounded-full border-[1px] border-white ${recommendation === index ? "bg-white" : ""}`}
                                onClick={() => setRecommendation(index)}
                            ></button>
                        );
                    })}
                </div>
                <div className="flex justify-between pl-4 pr-8">
                    <h1>Not likely</h1>
                    <h1>Somewhat likely</h1>
                    <h1>Very likely</h1>
                </div>
                <h1>Encountered problems</h1>
                {/* Question 3 */}
                <div className="flex flex-col pl-8 pr-16 space-y-3">
                    {/* Make checkboxes using array with subgroups */}
                    {encounteredProblemsList.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <h1 className="underline">{group.heading}</h1>
                            {group.problems.map((problem, index) => (
                                <div key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={encounteredProblems.includes(problem)}
                                        onChange={() => handleEncounteredProblemsChange(problem)}
                                        className="form-checkbox mr-2 w-5 h-5 rounded bg-transparent border-[1px] border-white focus:ring-transparent focus:border-none"
                                    />
                                    <label htmlFor={`checkbox-${index}`}>{problem}</label>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Text input for other problems */}
                    <div className="flex flex-row justify-between rounded-md bg-[#2F4454] py-1 mx-4">
                    <input
                        className="w-full bg-transparent outline-none px-2 h-7"
                        onChange={(e) => {
                            setOtherChallenges(e.target.value);
                        }}
                    />
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-around mt-8">
                <button className="underline text-white"onClick={() => props.setShowPostTaskQuestionnaire(false)}>Cancel</button>
                <button className="bg-white px-6 py-2 rounded-2xl" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    )
}

export default PostTaskQuestionnaire;