import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { Badge, Button, IconButton } from "@mui/material";
import io from "socket.io-client";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useNavigate } from "react-router-dom";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;

const connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: [
        "turn:13.232.240.115:3478?transport=udp",
        "turn:13.232.240.115:3478?transport=tcp",
      ],
      username: "meetsyncuser",
      credential: "MeetSyncTurn2026",
    },
  ],
};

export default function VideoMeetConponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoref = useRef(null);
  const screenStreamRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);

  const [showModal, setModal] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [videos, setVideos] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [uploadedRecordingUrl, setUploadedRecordingUrl] = useState("");
  const [uploadedRecordingFileName, setUploadedRecordingFileName] = useState("");

  const [connectionStatus, setConnectionStatus] = useState("Waiting");
  const [iceStatus, setIceStatus] = useState("Not connected");

  const navigate = useNavigate();

  // ---------------------------
  // Permissions
  // ---------------------------

  const getPermissions = async () => {
    try {
      let hasVideo = false;
      let hasAudio = false;

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoStream) {
          hasVideo = true;
          videoStream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        hasVideo = false;
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (audioStream) {
          hasAudio = true;
          audioStream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        hasAudio = false;
      }

      setVideoAvailable(hasVideo);
      setAudioAvailable(hasAudio);
      setScreenAvailable(Boolean(navigator.mediaDevices.getDisplayMedia));

      if (hasVideo || hasAudio) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: hasVideo,
          audio: hasAudio,
        });

        window.localStream = userMediaStream;

        if (localVideoref.current) {
          localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log("Permission error:", error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // ---------------------------
  // Dummy black/silent stream
  // ---------------------------

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);

    const stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const createBlackSilentStream = () => {
    return new MediaStream([black(), silence()]);
  };

  // ---------------------------
  // User media handling
  // ---------------------------

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;

    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      try {
        connections[id].addStream(stream);
      } catch (error) {
        console.log(error);
      }

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          localVideoref.current?.srcObject
            ?.getTracks()
            .forEach((track) => track.stop());
        } catch (error) {
          console.log(error);
        }

        window.localStream = createBlackSilentStream();

        if (localVideoref.current) {
          localVideoref.current.srcObject = window.localStream;
        }
      };
    });
  };

  const getUserMedia = () => {
    if (screen) return;

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(getUserMediaSuccess)
        .catch((error) => console.log(error));
    } else {
      try {
        localVideoref.current?.srcObject
          ?.getTracks()
          .forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  //upload funtion 

  const uploadRecordingToS3 = async (recordingBlob) => {
    try {
      setIsUploadingRecording(true);

      const meetingCode =
        window.location.pathname.replace("/", "") || "default-room";

      // Step 1: Get presigned upload URL from backend
      const response = await fetch(`${server}/api/v1/recordings/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingCode,
          fileType: "video/webm",
        }),
      });

      const data = await response.json();
      console.log("Presigned URL response:", data);
      console.log("Backend server:", server);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get upload URL");
      }

      // Step 2: Upload actual recording blob to AWS S3
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/webm",
        },
        body: recordingBlob,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", uploadResponse.status, errorText);
        throw new Error(`Failed to upload recording to S3: ${uploadResponse.status}`);
      }

      setUploadedRecordingUrl(data.fileUrl);
      setUploadedRecordingFileName(data.fileName);

      console.log("Recording uploaded successfully:", data.fileUrl);
      alert("Recording uploaded to AWS S3 successfully!");

      return data.fileUrl;
    } catch (error) {
      console.error("Recording upload error:", error);
      alert("Recording upload failed. Please check console.");
    } finally {
      setIsUploadingRecording(false);
    }
  };

  // ---------------------------
  // WebRTC signaling
  // ---------------------------

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        ?.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  })
                  .catch((error) => console.log(error));
              })
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => console.log(error));
    }

    if (signal.ice) {
      connections[fromId]
        ?.addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((error) => console.log(error));
    }
  };

  const createPeerConnection = (socketListId) => {
    if (socketListId === socketIdRef.current) return;
    if (connections[socketListId]) return;

    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

    connections[socketListId].onconnectionstatechange = () => {
      setConnectionStatus(connections[socketListId].connectionState);
    };

    connections[socketListId].oniceconnectionstatechange = () => {
      setIceStatus(connections[socketListId].iceConnectionState);
    };

    connections[socketListId].onicecandidate = (event) => {
      if (event.candidate !== null) {
        socketRef.current.emit(
          "signal",
          socketListId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    connections[socketListId].onaddstream = (event) => {
      setVideos((prevVideos) => {
        const exists = prevVideos.find(
          (videoItem) => videoItem.socketId === socketListId
        );

        if (exists) {
          return prevVideos.map((videoItem) =>
            videoItem.socketId === socketListId
              ? { ...videoItem, stream: event.stream }
              : videoItem
          );
        }

        return [...prevVideos, { socketId: socketListId, stream: event.stream }];
      });
    };

    if (window.localStream) {
      connections[socketListId].addStream(window.localStream);
    } else {
      window.localStream = createBlackSilentStream();
      connections[socketListId].addStream(window.localStream);
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("whiteboard-draw", (drawData) => {
        drawLine(drawData);
      });

      socketRef.current.on("whiteboard-clear", () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((prevVideos) =>
          prevVideos.filter((videoItem) => videoItem.socketId !== id)
        );

        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          createPeerConnection(socketListId);
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2]
              .createOffer()
              .then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({
                        sdp: connections[id2].localDescription,
                      })
                    );
                  })
                  .catch((error) => console.log(error));
              })
              .catch((error) => console.log(error));
          }
        }
      });
    });
  };

  // ---------------------------
  // Screen sharing
  // ---------------------------

  const replaceVideoTrackForAllPeers = async (newTrack) => {
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      const sender = connections[id]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];

      if (localVideoref.current) {
        localVideoref.current.srcObject = screenStream;
      }

      await replaceVideoTrackForAllPeers(screenTrack);

      setScreen(true);

      screenTrack.onended = async () => {
        await stopScreenShare();
      };
    } catch (error) {
      console.log("Screen share error:", error);
      setScreen(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable,
      });

      window.localStream = cameraStream;

      if (localVideoref.current) {
        localVideoref.current.srcObject = cameraStream;
      }

      const cameraTrack = cameraStream.getVideoTracks()[0];

      if (cameraTrack) {
        await replaceVideoTrackForAllPeers(cameraTrack);
      }

      setScreen(false);
    } catch (error) {
      console.log("Stop screen share error:", error);
      setScreen(false);
    }
  };

  const handleScreen = async () => {
    if (screen) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  // ---------------------------
  // Whiteboard
  // ---------------------------

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = event.clientX || event.touches?.[0]?.clientX;
    const clientY = event.clientY || event.touches?.[0]?.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const drawLine = ({ fromX, fromY, toX, toY }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const point = getCanvasCoordinates(event);

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (event) => {
    event.preventDefault();

    if (!isDrawingRef.current) return;

    const currentPoint = getCanvasCoordinates(event);

    const drawData = {
      fromX: lastPointRef.current.x,
      fromY: lastPointRef.current.y,
      toX: currentPoint.x,
      toY: currentPoint.y,
    };

    drawLine(drawData);

    socketRef.current?.emit("whiteboard-draw", drawData);

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socketRef.current?.emit("whiteboard-clear");
  };

  // ---------------------------
  // Chat + Recording + Common handlers
  // ---------------------------

  const connect = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    setAskForUsername(false);
    getUserMedia();
    connectToSocketServer();
  };

  const handleVideo = () => {
    if (screen) return;
    setVideo((prev) => !prev);
  };

  const handleAudio = () => {
    setAudio((prev) => !prev);
  };

  const handleChat = () => {
    setModal((prev) => !prev);
    setNewMessages(0);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender, data, time: new Date().toLocaleTimeString() },
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.emit(
      "chat-message",
      message,
      username,
      socketIdRef.current
    );

    setMessage("");
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Meeting link copied!");
    } catch (error) {
      console.log("Copy failed:", error);
    }
  };

  const startRecording = () => {
    try {
      const stream = localVideoref.current?.srcObject;

      if (!stream) {
        alert("No media stream available to record");
        return;
      }

      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp8,opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const recordingBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        const localRecordingUrl = URL.createObjectURL(recordingBlob);
        setRecordingUrl(localRecordingUrl);

        recordedChunksRef.current = [];

        await uploadRecordingToS3(recordingBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.log("Recording error:", error);
      alert("Recording is not supported in this browser or stream.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (!recordingUrl) return;

    const a = document.createElement("a");
    a.href = recordingUrl;
    a.download = `meetsync-recording-${Date.now()}.webm`;
    a.click();
  };

  const downloadRecordingFromS3 = async () => {
    try {
      if (!uploadedRecordingFileName) {
        alert("No uploaded recording found");
        return;
      }

      const response = await fetch(`${server}/api/v1/recordings/download-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: uploadedRecordingFileName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get download URL");
      }

      window.open(data.downloadUrl, "_blank");
    } catch (error) {
      console.error("Recording download error:", error);
      alert("Failed to download recording from AWS S3");
    }
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }

    try {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());

      localVideoref.current?.srcObject
        ?.getTracks()
        .forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    Object.keys(connections).forEach((id) => {
      connections[id]?.close();
      delete connections[id];
    });

    socketRef.current?.disconnect();
    navigate("/home");
  };

  // ---------------------------
  // Lobby Screen
  // ---------------------------

  if (askForUsername) {
    const roomCode = window.location.pathname.replace("/", "");

    return (
      <div className="lobbyContainer">
        <div className="lobbyCard">
          <div className="lobbyHeader">
            <div className="lobbyLogo">
              <span></span>
              <p>MeetSync Room</p>
            </div>

            <div className="lobbyRoomCode">
              Room: <b>{roomCode}</b>
            </div>
          </div>

          <div className="lobbyTitle">
            <h2>Ready to Join?</h2>
            <p>Check your camera preview and enter your name before joining.</p>
          </div>

          <div className="videoPreview">
            <video ref={localVideoref} autoPlay muted playsInline />
            <div className="previewBadge">Camera Preview</div>
          </div>

          <TextField
            fullWidth
            label="Enter your name"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") connect();
            }}
            sx={{
              mt: 3,
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                background: "rgba(255,255,255,0.08)",
                borderRadius: "16px",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.16)",
                },
                "&:hover fieldset": { borderColor: "#ff8a00" },
                "&.Mui-focused fieldset": { borderColor: "#ff0058" },
              },
              "& .MuiInputLabel-root": { color: "#aaa" },
            }}
          />

          <Button
            fullWidth
            onClick={connect}
            sx={{
              mt: 3,
              py: 1.6,
              borderRadius: "16px",
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(90deg, #ff8a00, #ff0058)",
              color: "white",
              boxShadow: "0 18px 40px rgba(255,0,88,0.25)",
              "&:hover": {
                boxShadow: "0 0 35px rgba(255,0,88,0.55)",
              },
            }}
          >
            Join Meeting
          </Button>

          <p className="lobbyNote">
            Your camera and microphone will be used during the meeting.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Meeting Screen
  // ---------------------------

  return (
    <div className={styles.meetVideoContainer}>
      {/* Top Bar */}
      <div className={styles.meetingTopBar}>
        <div className={styles.meetingBrand}>
          <span className={styles.brandDot}></span>
          <span>MeetSync Room</span>
        </div>

        <div className={styles.meetingStatus}>
          <span className={styles.liveBadge}>Live Meeting</span>

          {isRecording && (
            <span className={styles.recordingBadge}>Recording</span>
          )}

          <span>{videos.length + 1} Participants</span>

          <button
            className={styles.statsToggleBtn}
            onClick={() => setShowDiagnostics((prev) => !prev)}
          >
            Stats
          </button>

          <button
            className={styles.whiteboardToggleBtn}
            onClick={() => setShowWhiteboard((prev) => !prev)}
          >
            Whiteboard
          </button>

          <button className={styles.shareRoomBtn} onClick={copyMeetingLink}>
            <ContentCopyIcon fontSize="small" />
            Share
          </button>
        </div>
      </div>

      {/* Whiteboard */}
      {showWhiteboard && (
        <div className={styles.whiteboardPanel}>
          <div className={styles.whiteboardHeader}>
            <div>
              <h3>Collaborative Whiteboard</h3>
              <p>Draw and share ideas in real time.</p>
            </div>

            <div className={styles.whiteboardActions}>
              <button onClick={clearWhiteboard}>
                <DeleteIcon fontSize="small" />
                Clear
              </button>

              <button onClick={() => setShowWhiteboard(false)}>✕</button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={900}
            height={420}
            className={styles.whiteboardCanvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      )}

      {/* Diagnostics */}
      {showDiagnostics && (
        <div className={styles.diagnosticsPanel}>
          <div>
            <span>Connection</span>
            <b>{connectionStatus}</b>
          </div>

          <div>
            <span>ICE State</span>
            <b>{iceStatus}</b>
          </div>

          <div>
            <span>Participants</span>
            <b>{videos.length + 1}</b>
          </div>

          <div>
            <span>Mic</span>
            <b>{audio ? "On" : "Off"}</b>
          </div>

          <div>
            <span>Camera</span>
            <b>{video ? "On" : "Off"}</b>
          </div>

          <div>
            <span>Screen</span>
            <b>{screen ? "Sharing" : "Off"}</b>
          </div>

          <div>
            <span>Recording</span>
            <b>{isRecording ? "On" : "Off"}</b>
          </div>
        </div>
      )}

      {/* Chat */}
      {showModal && (
        <div className={styles.chatRoom}>
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <div>
                <h2>Chat</h2>
                <p>Room messages</p>
              </div>

              <button onClick={handleChat} className={styles.closeChatBtn}>
                ✕
              </button>
            </div>

            <div className={styles.chattingDisplay}>
              {messages.length > 0 ? (
                messages.map((item, index) => (
                  <div className={styles.chatMessage} key={index}>
                    <div className={styles.chatMessageTop}>
                      <p className={styles.chatSender}>{item.sender}</p>
                      <span>{item.time}</span>
                    </div>
                    <p className={styles.chatText}>{item.data}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noMessages}>No messages yet</p>
              )}
            </div>

            <div className={styles.chattingArea}>
              <TextField
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                label="Enter your chat"
                variant="outlined"
                size="small"
                sx={{
                  input: { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&:hover fieldset": { borderColor: "#ff8a00" },
                    "&.Mui-focused fieldset": { borderColor: "#ff0058" },
                  },
                  "& .MuiInputLabel-root": { color: "#aaa" },
                }}
              />

              <Button
                onClick={sendMessage}
                sx={{
                  minWidth: "70px",
                  background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                  borderRadius: "14px",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Local Video */}
      <video
        className={styles.meetUserVideo}
        ref={localVideoref}
        autoPlay
        muted
        playsInline
      />

      {/* Remote Videos */}
      <div className={styles.conferenceView}>
        {videos.map((videoItem) => (
          <div className={styles.remoteVideoCard} key={videoItem.socketId}>
            <video
              data-socket={videoItem.socketId}
              ref={(ref) => {
                if (ref && videoItem.stream) {
                  ref.srcObject = videoItem.stream;
                }
              }}
              autoPlay
              playsInline
            />

            <div className={styles.participantName}>Participant</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.buttonContainers}>
        <IconButton onClick={handleAudio} style={{ color: "white" }}>
          {audio ? <MicIcon /> : <MicOffIcon />}
        </IconButton>

        <IconButton onClick={handleVideo} style={{ color: "white" }}>
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>

        {screenAvailable && (
          <IconButton onClick={handleScreen} style={{ color: "white" }}>
            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        )}

        <Badge badgeContent={newMessages} max={999} color="secondary">
          <IconButton onClick={handleChat} style={{ color: "white" }}>
            <ChatIcon />
          </IconButton>
        </Badge>

        <IconButton
          onClick={isRecording ? stopRecording : startRecording}
          style={{ color: isRecording ? "#ff4b5c" : "white" }}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? <StopCircleIcon /> : <FiberManualRecordIcon />}
        </IconButton>

        {recordingUrl && (
          <IconButton
            onClick={downloadRecording}
            style={{ color: "white" }}
            title="Download Recording"
          >
            <DownloadIcon />
          </IconButton>
        )}

        {uploadedRecordingFileName && (
          <IconButton
            onClick={downloadRecordingFromS3}
            style={{ color: "#86efac" }}
            title="Download Cloud Recording"
          >
            <DownloadIcon />
          </IconButton>
        )}
        {/* Add this here */}
        {isUploadingRecording && (
          <span className={styles.uploadingText}>Uploading recording...</span>
        )}
        <IconButton onClick={handleEndCall} style={{ color: "#ff4b5c" }}>
          <CallEndIcon />
        </IconButton>
      </div>
    </div>
  );
}