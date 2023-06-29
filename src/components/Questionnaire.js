import { useState, useRef} from "react";

const Questionnaire = (props) => {
    const [selectedButton, setSelectedButton] = useState(null);
    const [checkboxes, setCheckboxes] = useState([]);   // list to containt checkbox values
    const [otherSelected, setOtherSelected] = useState(false)
    const taskTypes = ['Learning a new topic', 'Completing an assignment', 'Writing or generating text', 
                        'Engaging in casual conversation or chat', 'Brainstorming ideas', 'Conducting academic research ideas',
                        'Replacing traditional search engines', 'Developing or programming', 'Other' ]

    const handleCheckboxChange = (value) => {
      if (checkboxes.includes(value)) {
        setCheckboxes(checkboxes.filter((item) => item !== value));
      } else {
        // If other is selected, enable the label for input
        if (value === 'Other'){
            setOtherSelected(true)
        }
        setCheckboxes([...checkboxes, value]);
      }
      console.log(checkboxes)
    };
  
    const handleButtonClick = (buttonNumber) => {
        setSelectedButton(buttonNumber);
    };

    return(
        <div className="flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl min-w-[30rem] overflow-auto">
            <h1 className="text-white text-center">Pre-task Questionnaire</h1>
            {/* Questions */}
            <div className="flex flex-col text-white space-y-3">
                {/* Question 1 */}
                <h1>Task name</h1>
                <div className="flex flex-row justify-between rounded-md bg-[#2F4454] mr-9 py-1">
                    <label className="w-[12rem] outline-none px-2" contentEditable={true}></label>
                </div>
                {/* Question 2 */}
                <h1>Topic fimiliarity</h1>
                <div className="flex flex-row pl-8 pr-16 justify-between">
                    {/* Array to generate the radio buttons */}
                    {Array.from({length: 5}).map((_, index) => {
                        return (
                            <button
                            key={index}
                            className={`w-4 h-4 rounded-full border-[1px] border-white ${
                                selectedButton === index ? "bg-white" : ""}`}
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
                <h1>Task type (check all that apply)</h1>
                <div className="flex flex-col space-y-3">
                    {/* // Make checkboxes using array */}
                    {taskTypes.map((taskName, index) => (
                        <div key={index} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={checkboxes.includes(taskName)}
                            onChange={() => handleCheckboxChange(taskName)}
                            className="form-checkbox mr-2 w-5 h-5 rounded bg-transparent border-[1px] border-white focus:ring-transparent focus:border-none"
                        />
                        <label  htmlFor={`checkbox-${index}`} className="text-white"> 
                            {taskName}
                        </label>
                        </div>
                    ))}
                    <div className="flex flex-row justify-between rounded-md bg-[#2F4454]  py-1 mx-4">
                        <label className="w-[12rem] outline-none px-2 h-7" contentEditable={otherSelected}></label>
                    </div>
                </div>
                
            </div>
            <div className="flex flex-row justify-around mt-8">
                <button className="underline text-white"onClick={() => props.setShowQuestionaire(false)}>Cancel</button>
                <button className="bg-white px-6 py-2 rounded-2xl">Submit</button>
            </div>
        </div>
    );

}

export default Questionnaire;