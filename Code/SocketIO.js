const express = require("express");

let logged_in_users = [];
let socketIDs = [];


function SocketIO(http){
    const socketIO = require('socket.io')(http);
    socketIO.on('connection', (socket) => {
            socket.on('log_user', (arg)=>{
            console.log(`⚡: ${socket.id} user just connected`);
            socket.user_id = arg.user_id;
            logged_in_users.push(arg.user_id);
            socketIDs.push(socket.id);
            console.log(socketIDs);
            console.log(logged_in_users);
        });
        socket.on('disconnect', () => {
            for(var i=0;i<logged_in_users.length;i++){
                if(socket.user_id == logged_in_users[i]){
                    logged_in_users.splice(i , 1);
                    socketIDs.splice(i , 1);
                    console.log("hi");
                }
            }
            
            
            console.log(`❌: ${socket.id} user disconnected`);
        });
    });
    

    
}
module.exports = SocketIO;
exports.logged_in_users = logged_in_users;
exports.socketIDs = socketIDs;