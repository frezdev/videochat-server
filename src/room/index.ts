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
      socket.to(roomId).emit("get-users", {
        roomId,
        participants: rooms[roomId]
      });

      socket.on("disconnect", () => {
        console.log("user left the room", peerId);
        leaveRoom({ roomId, peerId });
      });
    }
  }

  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(id => id !== peerId)
      socket.leave(roomId)
      socket.to(roomId).emit('user-disconnected', { peerId })
    }
  }

  const closeRoom = ({ roomId }: { roomId: string }) => {
    delete rooms[roomId]
    socket.to(roomId).emit("room-closed", { roomId })
  }

  const uptateUserConfig = ({ peerId, roomId, audio, video }: {
    peerId: string,
    roomId: string,
    audio: boolean,
    video: boolean
  }) => {
    socket.to(roomId).emit('user-config-updated', { peerId, audio, video })
  }

  socket.on('create-room', createRoom)
  socket.on('join-room', joinGroup)
  socket.on('close-room', closeRoom)
  socket.on('update-user-config', uptateUserConfig)
}