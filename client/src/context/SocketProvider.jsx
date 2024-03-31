import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";

export const SocketContext = createContext();

export const useSocket =()=>{
    return useContext(SocketContext);
}

export const SocketContextProvider =({children})=>{
    const socket = useMemo(()=>{
        return io("http://localhost:3000");
    },[]); 
    

    return(
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}
SocketContextProvider.propTypes = {
    children: PropTypes.node.isRequired
}