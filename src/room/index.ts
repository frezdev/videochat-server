import { type Socket } from "socket.io/dist";

interface IRoomParams {
  roomId: string,
  peerId: string
}

const rooms: Record<string, string[]> = {};
export const roomHandler = (socket: Socket) => {
  const createRoom = ({ roomId }: { roomId: string, adminId: string }) => {
    rooms[roomId] = []
    socket.emit("room-created", { roomId });
  };

  const joinGroup = ({ roomId, peerId }: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId].push(peerId)
      socket.join(roomId)

      socket.to(roomId).emit('user-joined', { peerId, roomId })
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId]
      });

      socket.on("disconnect", () => {
        console.log({ roomId, peerId })
        console.log("user left the room", peerId);
        leaveRoom({ roomId, peerId });
      });
    }
  }

  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    rooms[roomId] = rooms[roomId].filter(id => id !== peerId)
    socket.leave(roomId)
    socket.to(roomId).emit('user-disconnected', { peerId })
  }

  socket.on('create-room', createRoom)
  socket.on('join-room', joinGroup)
}