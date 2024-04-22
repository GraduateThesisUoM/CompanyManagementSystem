import io from "socket.io";

function LiveNotifications(){


    useEffect(()=>{
        const socket = io("https://localhost:3001", {transports: ["websocket"]})

        socket.on("connection", ()=>{
            console.log("Connected to socket io")
        });

        socket.on("new_user_login",(data)=>{
            condole.log("test", data.message);
        })

    }, [])
}