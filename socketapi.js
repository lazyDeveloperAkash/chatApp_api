const socketIo = require("socket.io");

function initializeSocketIo(server, options) {
    const io = socketIo(server, options);

    let clients = [];
    let groups = [];

    function uniqueObj(newObj) {
        const isDuplicate = clients.some(obj => obj.contact === newObj.contact);
        if (!isDuplicate) clients.push(newObj);
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
            receaver && io.to(receaver.socketId).emit('new-message', { msg: data.msg });
        })

        socket.on('join-to-room', ({ rooms }) => {
            rooms.map((e) => {
                socket.join(e);
            })
        })

        socket.on('group-msg', ({ groupId, msg, name, id }) => {
            io.to(groupId).emit('group-message', { msg, name, id: id });
        })

        socket.on('disconnect', function (data) {
            const idx = clients.findIndex(obj => obj['socketId'] === socket.id);
            if (idx !== -1) clients.splice(idx, 1);
            console.log("user disconected !");
        });

        socket.on('call-init', (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.receaver);
            receaver && io.to(receaver.socketId).emit('incoming-call', { name: data.name, callType: data.callType, contact: data.user })
        })
        socket.on("call-status", (data) => {
            const receaver = clients.find(obj => obj['contact'] === data.contact);
            receaver && io.to(receaver.socketId).emit('call-status', { peerId: data.peerId, name: data.name, contact: data.contact });
        })
        socket.on('call-disconect', (data)=>{
            const receaver = clients.find(obj => obj['contact'] === data.contact);
            receaver && io.to(receaver.socketId).emit('call-disconect', true);
        })
    })
    return io;
}

module.exports = initializeSocketIo