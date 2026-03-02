import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";

import { Badge, Button, IconButton } from "@mui/material";
import io from "socket.io-client";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
// import ChatIcon from '@mui/icons-material/Chat'
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from "react-router-dom";
import server from "../environment";
// import CloseIcon from '@mui/icons-material/Close';




const server_url = server;

const connections = {};

const peerConfigConnnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}


export default function VideoMeetConponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);



    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);


    let [screen, setScreen] = useState();


    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);


    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }

                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPermissions();
    }, [])




    let getUserMediaSuccess = (stream) => {

        // Stop old stream safely
        window.localStream?.getTracks().forEach(track => track.stop());

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        // if (localVideoref.current) {
        //     localVideoref.current.srcObject = stream;
        // }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            stream.getTracks().forEach(track => {
                connections[id].addTrack(track, stream);
            });

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit(
                            'signal',
                            id,
                            JSON.stringify({ sdp: connections[id].localDescription })
                        );
                    });
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            let tracks = localVideoref.current?.srcObject?.getTracks() || [];
            tracks.forEach(track => track.stop());

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                // window.localStream.getTracks().forEach(track => {
                //     connections[id].addTrack(track, window.localStream);
                // });
                connections[id].addStream(window.localStream)
            }
        });
    };

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }


    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }
    useEffect(() => {
        if (video != undefined && audio != undefined) {
            getUserMedia();
        }
    }, [audio, video])



    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let routeTo = useNavigate();
    let connect = () => {
        setAskForUsername(false);
        connectToSocketServer();
        socketRef.current.on("connect", () => {
            getUserMedia();
        });
    }

    let handleVideo = () => {

        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    // let handleAudio = () => {
    //     window.localStream?.getAudioTracks().forEach(track => {
    //         track.enabled = !audio;
    //     });
    //     setAudio(!audio);
    // }

    let handleChat = () => {
        setModal(!showModal)
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = audio;

            // window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        // if (localVideoref.current) {
        //     localVideoref.current.srcObject = stream;
        // }

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            // window.localStream.getTracks().forEach(track => {
            //     connections[id].addTrack(track, window.localStream);
            // });

            // window.localStream.getTracks().forEach(track => {
            //     const alreadyAdded = connections[id]
            //         .getSenders()
            //         .some(sender => sender.track === track);

            //     if (!alreadyAdded) {
            //         connections[id].addTrack(track, window.localStream);
            //     }
            // });
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }


    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e));
            }
        }
    }

    useEffect(() => {

        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }

    }



    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username, socketIdRef.current);
        setMessage("");
    }

    let handleEndCall = () => {
        console.log("Before end:", localStorage.getItem("token"));

        try {
            let tracks = localVideoref.current?.srcObject?.getTracks() || [];
            tracks.forEach(track => track.stop());
        } catch (e) { }

        socketRef.current?.disconnect();

        routeTo("/home");
    };



    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })
        setAskForUsername(false);

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    //Wait for their video stream 
                    // rha chnage kiya hai 
                    // connections[socketListId].onaddstream = (event) => {
                    //     setVideos((prevVideos) => {
                    //         console.log("Remote stream received");
                    //         // agar ye video pehle se exist karta hai
                    //         const exists = prevVideos.find(v => v.socketId === socketListId);
                    //         if (exists) {
                    //             // update stream
                    //             return prevVideos.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                    //         } else {
                    //             // naya video add karo
                    //             return [...prevVideos, { socketId: socketListId, stream: event.stream }];
                    //         }
                    //     });
                    // };

                    // connections[socketListId].ontrack = (event) => {
                    //     console.log("Remote track received");

                    //     const remoteStream = event.streams[0];

                    //     setVideos((prevVideos) => {
                    //         const exists = prevVideos.find(v => v.socketId === socketListId);

                    //         if (exists) {
                    //             return prevVideos.map(v =>
                    //                 v.socketId === socketListId
                    //                     ? { ...v, stream: remoteStream }
                    //                     : v
                    //             );
                    //         } else {
                    //             return [...prevVideos, { socketId: socketListId, stream: remoteStream }];
                    //         }
                    //     });
                    // };

                    connections[socketListId].ontrack = (event) => {
                        const remoteStream = event.streams[0];

                        setVideos(prevVideos => {
                            const alreadyExists = prevVideos.some(
                                video => video.socketId === socketListId
                            );

                            if (alreadyExists) {
                                return prevVideos.map(video =>
                                    video.socketId === socketListId
                                        ? { socketId: socketListId, stream: remoteStream }
                                        : video
                                );
                            }

                            return [...prevVideos, { socketId: socketListId, stream: remoteStream }];
                        });
                    };





                    //Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }

                    // if (window.localStream !== undefined && window.localStream !== null) {
                    //     // window.localStream.getTracks().forEach(track => {
                    //     //     connections[socketListId].addTrack(track, window.localStream);
                    //     // });

                    //     // window.localStream.getTracks().forEach(track => {
                    //     //     const alreadyAdded = connections[id]
                    //     //         .getSenders()
                    //     //         .some(sender => sender.track === track);

                    //     //     if (!alreadyAdded) {
                    //     //         connections[id].addTrack(track, window.localStream);
                    //     //     }
                    //     // });
                    // } else {
                    //     let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                    //     window.localStream = blackSilence();

                    //     // window.localStream.getTracks().forEach(track => {
                    //     //     connections[socketListId].addTrack(track, window.localStream);
                    //     // });

                    //     window.localStream.getTracks().forEach(track => {
                    //         const alreadyAdded = connections[id]
                    //             .getSenders()
                    //             .some(sender => sender.track === track);

                    //         if (!alreadyAdded) {
                    //             connections[id].addTrack(track, window.localStream);
                    //         }
                    //     });
                    // }




                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }




                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }




    return (
        <div>
            {askForUsername ?

                <div className="lobbyContainer">

                    <div className="lobbyCard">

                        <h2>Ready to Join?</h2>

                        <div className="videoPreview">
                            <video ref={localVideoref} autoPlay muted playsInline />
                        </div>

                        <TextField
                            fullWidth
                            label="Enter your name"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                mt: 2,
                                input: { color: "white" },
                                "& .MuiOutlinedInput-root": {
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: "12px",
                                    "& fieldset": { borderColor: "#444" },
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
                                py: 1.5,
                                borderRadius: 10,
                                fontWeight: 600,
                                background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                                color: "white",
                                "&:hover": {
                                    boxShadow: "0 0 30px rgba(255,0,88,0.6)",
                                },
                            }}
                        >
                            Join Meeting
                        </Button>

                    </div>

                </div> :

                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            {/* <h2 style={{ marginBottom: "10px" }}>Chat</h2> */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px"
                                }}
                            >
                                <h2>Chat</h2>


                                <button
                                    onClick={handleChat}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        fontSize: "20px",
                                        cursor: "pointer"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.chattingDisplay}>

                                {messages.length > 0 ? messages.map((item, index) => {


                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className={styles.chattingArea}>

                                <TextField value={message} onChange={e => setMessage(e.target.value)} id="outlined-basic" label="Enter your Chat" variant="outlined" />
                                <Button
                                    onClick={sendMessage}
                                    sx={{
                                        background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                                        borderRadius: "20px",
                                        color: "white"
                                    }}
                                >
                                    Send
                                </Button>                            </div>
                        </div>

                    </div> : <></>}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {/* {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />} */}
                                {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={handleChat} style={{ color: "white" }} >
                                <ChatIcon />
                            </IconButton>
                        </Badge>




                    </div>
                    {/* <div
                        className={styles.draggableVideo}
                        style={{
                            left: position.x,
                            top: position.y
                        }}
                        onMouseDown={startDrag}
                        onTouchStart={startDrag}
                    >
                        <video
                            ref={localVideoref}
                            autoPlay
                            muted
                        ></video>
                    </div> */}

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>

                                {/* <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                /> */}

                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>




                </div>

            }


        </div>
    );
}



