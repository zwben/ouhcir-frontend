import star_icon from '../assets/common/star_icon.svg'
import star_filled_icon from '../assets/common/star_filled_icon.svg'
import more_icon from '../assets/chatbox/more_icon.svg'
import comment_icon from '../assets/chatbox/comment_icon.svg'


const Prompt = (props) => {
    return(
        <div className={"flex flex-row justify-between space-x-4 align-top p-5 pl-14 " + props.bgColor} >
            <div className='w-full'>
                <div className='inline-flex w-full space-x-4'>
                    <img className='w-9 h-9' src={props.profile_image}/>
                    <p className="text-white xl:max-w-[50%] lg:max-w-[65%] w-full leading-7">{props.text}</p>
                </div>
            </div>
            <div className='flex-shrink-0 inline-flex space-x-4 pr-1 h-fit'>
                <button>
                    <img className='w-7' src={star_icon}/>
                </button>
                <button onClick={() => props.setShowCommentPopup(true)}>
                    <img className='w-6' src={comment_icon}/>
                </button>
                <button>
                    <img className='w-6' src={more_icon}/>
                </button>
            </div>
        </div>
    );
}

export default Prompt;