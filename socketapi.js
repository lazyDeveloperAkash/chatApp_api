const socketIo = require("socket.io");

function initializeSocketIo(server, options) {
    const io = socketIo(server, options);

    let clients = [];

    function uniqueObj(newObj){
        const isDuplicate = clients.some(obj => obj.contact === newObj.contact);
        if(!isDuplicate) clients.push(newObj);
    }

    io.on("connection", (socket) => {
        // store data to an array
        socket.on("storeClientInfo", (data) => {
            const clientInfo = {
                socketId: socket.id,
                contact: data.contact
            }
            uniqueObj(clientInfo);
        })

        socket.on('join', (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.receaver);
            if(receaver) io.to(receaver.socketId).emit('new-message', { msg: data.msg });
        })

        socket.on('disconnect', function (data) {
            const idx = clients.findIndex(obj => obj['socketId'] === socket.id);
            if (idx !== -1) clients.splice(idx, 1);
            console.log("user disconected !");
        });

        socket.on('call-init', (data)=>{
            const receaver = clients.find(obj => obj['contact'] === data.receaver);
            if(receaver) io.to(receaver.socketId).emit('incoming-call',{ name: data.name, callType: data.callType, contact: data.user })
        })
        socket.on("call-status", (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.contact);
            if(receaver) io.to(receaver.socketId).emit('call-status', { peerId: data.peerId, name: data.name });
        })
        // socket.on('call-disconnected', (data)=>{
        //     console.log(data)
        //     io.to(data.callerSocketId).emit('call-disconected', data.calltype)
        // })
    })
    return io;
}

module.exports = initializeSocketIo