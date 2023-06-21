const Prompt = (props) => {
    return(
        <div className="bg-[#3c586e] h-full flex p-5 pl-14" >
            <h1 className="text-white">{props.text}</h1>
        </div>
    );
}

export default Prompt;