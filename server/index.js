const express = require('express');
const {Server} = require('socket.io');


const io = new Server(3000,{
    cors:true
});

const emailToSocket = new Map();
const roomToEmail = new Map()

io.on('connection',(socket)=>{
    console.log("Socket Connected",socket.id);

    socket.on('join-room',({roomId,email})=>{
        console.log("joined-room-",roomId,email);
        emailToSocket.set(email,socket);
        roomToEmail.set(socket.id,email);
        io.to(roomId).emit('user-joined',{email,id:socket.id});//server sending all the msgs to the user in the current room about new user
        socket.join(roomId);
        io.to(socket.id).emit('user-connected',{roomId,email});//sending msg to new user its joined
    });

    socket.on('call-user',({offer,to})=>{
        console.log("Call to",to);
        io.to(to).emit('incoming-call',{offer,from:socket.id});
    });

    socket.on('call-accepted',({ans,to})=>{
        io.to(to).emit('call-accepted',{ans,from:socket.id});
    })

    socket.on('nego-start',({offer,to})=>{
        io.to(to).emit('nego-start',{offer,from:socket.id});
    })

    socket.on('nego-done',({ans,to})=>{
        io.to(to).emit('nego-final',{ans,from:socket.id});
    });


});

