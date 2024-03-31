import { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from 'react-player'
import Peer from "../service/Peer";

const Room = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState();
  const [yourStream, setYourStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleNewUser = useCallback(({ email, id }) => {
    console.log(email, "has joined the room");
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await Peer.getOffer();
    console.log("Offer",offer);
    socket.emit("call-user", { offer, to: remoteSocketId });  
    setYourStream(stream);
  }, [remoteSocketId, socket]);

  const handleCallFromUser = useCallback(async({offer,from})=>{
    console.log("Call from",from,offer);
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const ans = await Peer.getAnswer(offer);
    socket.emit('call-accepted',{ans,to:from});//sending the answer to the user who called
    setYourStream(stream);
    },[socket]);

  const sendStream = useCallback(async()=>{
    for(const track of yourStream.getTracks()){
      Peer.peer.addTrack(track,yourStream);
    }
  },[yourStream]);

  const handleCallAccepted = useCallback(async({ans,from})=>{
    await Peer.setLocalDescription(ans);
    console.log("Call accepted from",from,ans);
    sendStream();
  },[sendStream]);

  const handleNegotiation = useCallback(async()=>{
    const offer = await Peer.getOffer();
    socket.emit('nego-start',{offer,to:remoteSocketId});
  },[remoteSocketId,socket]);

  const handleNegoAnswer = useCallback(async({offer,from})=>{
    console.log("Nego from",from,offer);
    const ans = await Peer.getAnswer(offer);
    socket.emit('nego-done',{ans,to:from});
  },[socket]);

  const handleNegoFinal = useCallback(async({ans})=>{
    await Peer.setLocalDescription(ans);
    console.log("Nego Final",ans);
    
  },[]);

  useEffect(()=>{
    Peer.peer.addEventListener('track',async(e)=>{
      const remoteStream = e.streams;
      setRemoteStream(remoteStream[0]);
    })
  },[])

  useEffect(()=>{
    Peer.peer.addEventListener('negotiationneeded',handleNegotiation);
    return ()=>{
      Peer.peer.removeEventListener('negotiationneeded',handleNegotiation);
    }
  },[ handleNegotiation])

  useEffect(() => {
    socket.on("user-joined", handleNewUser);
    socket.on('incoming-call',handleCallFromUser);
    socket.on('call-accepted',handleCallAccepted);
    socket.on('nego-start',handleNegoAnswer);
    socket.on('nego-final',handleNegoFinal);
    return () => {
      socket.off("user-joined", handleNewUser);
      socket.off('incoming-call',handleCallFromUser);
      socket.off('call-accepted',handleCallAccepted);
      socket.off('nego-start',handleNegoAnswer);
      socket.off('nego-final',handleNegoFinal);
    };
  }, [socket, handleNewUser,handleCallFromUser,handleCallAccepted,handleNegoAnswer,handleNegoFinal]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in Room"}</h4>
      {remoteSocketId ? <button onClick={handleCallUser}>Call</button> : null}
      <div className="w-[300px]">
        {yourStream ? (
          <>
          <h1>My Stream</h1>
          <ReactPlayer
            url={yourStream}
            playing
            controls
            width="100%"
            height="100%"
            muted
            pip
            
          /></>
        ) : null}
      </div>
      <div className="w-[300px]">
        {remoteStream ? (<>
          <h1>RemoteStream</h1>
          <ReactPlayer
            url={remoteStream}
            playing
            controls
            width="100%"
            height="100%"
            
            pip
            
          />
        </>) : null}
      </div>
    </div>
  );
};

export default Room;
