const MoreActionsPopUp = (props) => {
    
    return(
        <div className="flex flex-col bg-[#142838] py-12 px-16 h-fit rounded-xl">

            <div className="flex flex-row justify-around mt-8">
                <button 
                    className="underline text-white"
                    onClick={()=> props.setShowMoreActionsPopUp(false)}
                    >
                    Cancel
                </button>
            </div>
        </div>
    );
}
export default MoreActionsPopUp;
