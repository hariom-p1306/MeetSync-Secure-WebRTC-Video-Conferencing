import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";

import { Button, IconButton, TextField, Snackbar } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamIcon from "@mui/icons-material/Videocam";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import SecurityIcon from "@mui/icons-material/Security";
import LogoutIcon from "@mui/icons-material/Logout";

import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    const code = meetingCode.trim();

    if (!code) {
      setErrorMsg("Please enter a meeting code");
      return;
    }

    await addToUserHistory(code);
    navigate(`/${code}`);
  };

  const handleCreateInstantMeeting = async () => {
    const newMeetingCode = `meet-${Date.now().toString().slice(-6)}`;

    setMeetingCode(newMeetingCode);
    await addToUserHistory(newMeetingCode);

    navigate(`/${newMeetingCode}`);
  };

  const handleCopy = async () => {
    const code = meetingCode.trim();

    if (!code) {
      setErrorMsg("Enter a meeting code first");
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="homeContainer">
      {/* Navbar */}
      <div className="homeNavbar">
        <div
          className="homeLogo"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          <span className="homeLogoIcon"></span>
          <h3>MeetSync</h3>
        </div>

        <div className="navRight">
          <Button
            onClick={() => navigate("/history")}
            className="historyBtn"
            startIcon={<RestoreIcon />}
          >
            History
          </Button>

          <Button
            onClick={handleLogout}
            className="logoutBtn"
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <main className="homeDashboard">
        {/* Left Content */}
        <section className="homeHero">
          <div className="welcomeBadge">Welcome back 👋</div>

          <h1>
            Meet, collaborate, and connect{" "}
            <span>in real time.</span>
          </h1>

          <p>
            Create secure rooms, join meetings instantly, and collaborate with
            smooth video, real-time chat, and screen sharing.
          </p>

          <div className="homeFeatureChips">
            <div>
              <SecurityIcon />
              <span>Secure Rooms</span>
            </div>

            <div>
              <ScreenShareIcon />
              <span>Screen Sharing</span>
            </div>

            <div>
              <ChatIcon />
              <span>Real-time Chat</span>
            </div>
          </div>
        </section>

        {/* Join Card */}
        <section className="joinMeetingCard">
          <div className="joinCardHeader">
            <div>
              <h2>Join a Meeting</h2>
              <p>Enter a meeting code to join instantly.</p>
            </div>

            <div className="joinIconBox">
              <VideocamIcon />
            </div>
          </div>

          <div className="meetingInputRow">
            <TextField
              fullWidth
              variant="outlined"
              label="Enter Meeting Code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoinVideoCall();
              }}
              sx={{
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

            <IconButton onClick={handleCopy} className="copyCodeBtn">
              <ContentCopyIcon />
            </IconButton>
          </div>

          <Button onClick={handleJoinVideoCall} className="primaryJoinBtn">
            Join Meeting
          </Button>

          <div className="orDivider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            className="createMeetingBtn"
            onClick={handleCreateInstantMeeting}
          >
            <span>
              <VideocamIcon />
              Create Instant Meeting
            </span>
            <b>+</b>
          </button>
        </section>

        {/* Right Visual */}
        <section className="homeVisualCard">
          <div className="miniMeetingWindow">
            <div className="miniTopBar">
              <span></span>
              <p>Live Meeting</p>
              <small>4 users</small>
            </div>

            <div className="miniVideoGrid">
              <div>HP</div>
              <div>AS</div>
              <div>RK</div>
              <div>You</div>
            </div>

            <div className="miniControls">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>
      </main>

      {/* Quick Action Cards */}
      <section className="quickActions">
        <div className="quickActionCard" onClick={handleCreateInstantMeeting}>
          <div className="quickIcon videoIcon">
            <VideocamIcon />
          </div>
          <div>
            <h3>Create Instant Meeting</h3>
            <p>Start a secure meeting room with one click.</p>
          </div>
        </div>

        <div className="quickActionCard" onClick={() => navigate("/history")}>
          <div className="quickIcon historyIcon">
            <RestoreIcon />
          </div>
          <div>
            <h3>Meeting History</h3>
            <p>View your previously joined meeting rooms.</p>
          </div>
        </div>

        <div className="quickActionCard">
          <div className="quickIcon shareIcon">
            <ContentCopyIcon />
          </div>
          <div>
            <h3>Share Meeting Code</h3>
            <p>Copy a meeting code and share it with others.</p>
          </div>
        </div>
      </section>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Meeting code copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={2500}
        onClose={() => setErrorMsg("")}
        message={errorMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

export default withAuth(HomeComponent);