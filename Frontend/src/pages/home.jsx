import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from "../contexts/AuthContext";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';

function HomeComponent() {

    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [copied, setCopied] = useState(false);

    const { addToUserHistory } = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    const handleCopy = () => {
        if (!meetingCode) return;

        navigator.clipboard.writeText(meetingCode);
        setCopied(true);
    };


    return (
        <div className="homeContainer">

            {/* NAVBAR */}
            <div className="homeNavbar">

                <h3 className="logoText">Apna Video Call</h3>

                <div className="navRight">
                    <IconButton
                        onClick={() => navigate("/history")}
                        sx={{ color: "white" }}
                    >
                        <RestoreIcon />
                    </IconButton>

                    <span className="historyText">History</span>

                    <Button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        className="logoutBtn"
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="meetContainer">

                <div className="leftPanel">

                    <h1>
                        Providing Quality Video Call <br />
                        Just Like Quality Education
                    </h1>

                    {/* <div className="joinBox">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Enter Meeting Code"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            sx={{
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
                            onClick={handleJoinVideoCall}
                            className="joinBtn"
                        >
                            JOIN
                        </Button>
                    </div> */}

                    <div className="joinBox">

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Enter Meeting Code"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            sx={{
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

                        {/* COPY BUTTON */}
                        <IconButton
                            onClick={handleCopy}
                            sx={{
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: "12px",
                                color: "white",
                                height: "56px",
                                "&:hover": {
                                    background: "rgba(255,255,255,0.15)"
                                }
                            }}
                        >
                            <ContentCopyIcon />
                        </IconButton>

                        <Button
                            onClick={handleJoinVideoCall}
                            className="joinBtn"
                        >
                            JOIN
                        </Button>

                    </div>

                </div>

                <div className="rightPanel">
                    <img src="/logo3.png" alt="illustration" />
                </div>

            </div>
            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                message="Meeting Code Copied!"
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </div>
    );

}

//export default HomeComponent;

export default withAuth(HomeComponent);
