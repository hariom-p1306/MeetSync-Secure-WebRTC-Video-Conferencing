let IS_PROD = false;

const server = IS_PROD
  ? "https://meetsync-secure-webrtc-video-conferencing.onrender.com"
  : "http://localhost:8000";

export default server;
