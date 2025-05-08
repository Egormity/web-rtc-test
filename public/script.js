const socket = io('/')

// 
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

// 
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const peers = {}

// 
function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream
  videoElement.addEventListener('loadedmetadata', () => videoElement.play())
  videoGrid.append(videoElement)
}

// 
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const videoElement = document.createElement('video')
  call.on('stream', userVideoStream => addVideoStream(videoElement, userVideoStream))
  call.on('close', () => videoElement.remove())
  peers[userId] = call
}

// 
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  // 
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => addVideoStream(video, userVideoStream))
  })

  // 
  socket.on('user-connected', userId => connectToNewUser(userId, stream))
})

// 
myPeer.on('open', id => socket.emit('join-room', ROOM_ID, id))
socket.on('user-disconnected', userId => (peers[userId]) && peers[userId].close())


