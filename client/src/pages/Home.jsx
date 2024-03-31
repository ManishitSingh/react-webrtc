import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    email: "",
    roomId: "",
  });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("join-room", {
        roomId: details.roomId,
        email: details.email,
      });
    },
    [details, socket]
  );

  const handleEmail = useCallback(({ roomId,email }) => {
    console.log(email, "has joined the room", roomId);
    navigate(`/room/${roomId}`);

  }, [navigate]);

  useEffect(() => {
    socket.on("user-connected", handleEmail);
    return () => {
      socket.off("user-connected", handleEmail);
    };
  }, [handleEmail, socket]);

  return (
    <div className="flex justify-center items-center  h-screen w-screen">
      <form onSubmit={handleSubmit} className="  flex flex-col w-[300px] gap-2">
        <input
          type="text"
          placeholder="Enter your email here"
          className="border-2 p-2 border-black"
          onChange={(e) => {
            setDetails({ ...details, email: e.target.value });
          }}
          value={details.email}
        />
        <input
          type="text"
          placeholder="Enter Room Code"
          className="border-2 border-black p-2"
          onChange={(e) => {
            setDetails({ ...details, roomId: e.target.value });
          }}
          value={details.roomId}
        />
        <button
          type="submit"
          className="border-2 font-bold w-1/2 mx-auto border-black"
        >
          Join Room
        </button>
      </form>
    </div>
  );
};

export default Home;
