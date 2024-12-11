import express from 'express'
import http from 'node:http'
import cors from 'cors'
import { Server } from 'socket.io'
import { roomHandler } from './room'

const port = process.env.PORT ?? 8080
const app = express()
const server = http.createServer(app)

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('User Connected', socket.id)

  roomHandler(socket)

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})