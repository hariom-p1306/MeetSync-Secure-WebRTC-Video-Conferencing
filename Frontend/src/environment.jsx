
let IS_PROD  = true;
const server = IS_PROD ?
    "https://meetsync-secure-webrtc-video-conferencing.onrender.com" :
     "http://localhost:8000"
    


export default server;