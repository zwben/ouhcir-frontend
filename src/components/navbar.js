const Navbar = () => {
    return(
        <div className="bg-[#142838] w-80 h-screen top-0 sticky flex flex-col" >
            <h1 className ='text-white text-3xl flex justify-center mb-10 mt-5' >IT Support</h1>
            <p className ='text-white flex justify-center align-center mb-10 m-5' >Get the help you need! Ask IT related questions.</p>
            <button className="text-white flex justify-center mt-auto m-8">About</button>
        </div>
    );
}

export default Navbar;