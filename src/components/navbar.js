import edit_icon from "../assets/navbar/edit_icon.svg"
import star_filled from "../assets/navbar/star_filled.svg"
import tick_icon from "../assets/navbar/tick_icon.svg"


import { useState, useRef } from "react";
const Navbar = (props) => {
    const [isTaskNameEditable, setIsTaskNameEditable ] = useState(false)
    const [taskName, setTaskName] = useState('Task name')
    const taskNameLabelRef = useRef()
    const changeTaskName = (e) => {
        setTaskName(taskNameLabelRef.current.textContent)
        setIsTaskNameEditable(false)
    }
    return(
        <div className="bg-[#142838] w-80 h-screen flex flex-col text-[18px] pb-10 pt-10 justify-between" >
            <div className="pl-8 text-white">
                <label className ='' >Task selection: </label>
                <div className="flex flex-col mt-4">
                    <div className="flex flex-row justify-between rounded-md bg-[#2F4454] mr-9 px-4 py-1">
                        <label className="w-[12rem] outline-none" contentEditable={isTaskNameEditable} ref={taskNameLabelRef}>{taskName}</label>
                        {isTaskNameEditable && 
                            <button onClick={changeTaskName}>
                            <img src={tick_icon}/>
                            </button>}
                        {!isTaskNameEditable && <button onClick={()=> setIsTaskNameEditable(true)}>
                            <img src={edit_icon}/>
                        </button>}
                    </div>
                    <div className="mt-3">
                        <button 
                            onClick={()=>props.setShowQuestionaire(true)}
                            className="rounded-md px-4 py-1 bg-[#D9D9D9] text-[#142838]">Modify task
                        </button>
                    </div>
                    <div className="flex space-x-3 w-fit mt-16">
                        <img src={star_filled}/>
                        <label className="">Favourites</label>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <button className="rounded-md border-2 px-8 py-2 border-[#2F4454] text-white">End task</button>
            </div>
        </div>
    );
}

export default Navbar;