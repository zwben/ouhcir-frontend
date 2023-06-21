const Response = (props) => {
    return (
      <div className="bg-[#2f4454] h-full flex p-5 pl-14">
        {props.text === '' ? (
          <p className="text-white">Loading...</p>
        ) : (
          <h1 className="text-white">{props.text}</h1>
        )}
      </div>
    );
  };

export default Response;