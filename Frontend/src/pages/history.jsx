import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        console.log("History response:", history);

        // Ensure it's an array
        if (Array.isArray(history)) {
          setMeetings(history);
        } else {
          console.log("Not an array:", history);
          setMeetings([]);
        }
      } catch (err) {
        console.log("Error fetching history:", err);
        setMeetings([]);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };


return (
  <div
    style={{
      minHeight: "100vh",
      padding: "60px",
      color: "white",
      background:
        "radial-gradient(circle at 20% 70%, rgba(255,0,88,0.2), transparent 40%), radial-gradient(circle at 80% 30%, rgba(99,102,241,0.4), transparent 40%), linear-gradient(135deg, #0f0f1a, #1a1a2e)",
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
      <IconButton
        onClick={() => navigate("/home")}
        sx={{ color: "white", marginRight: 2 }}
      >
        <HomeIcon />
      </IconButton>

      <Typography variant="h4" fontWeight={600}>
        Meeting History
      </Typography>
    </div>

    {/* Content */}
    {meetings.length === 0 ? (
      <Typography variant="h6" sx={{ opacity: 0.7 }}>
        No history found
      </Typography>
    ) : (
      meetings.map((e, i) => (
        <Card
          key={i}
          sx={{
            marginBottom: 3,
            padding: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            boxShadow: "0 0 30px rgba(99,102,241,0.3)",
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 0 50px rgba(255,0,88,0.4)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Typography variant="h6" fontWeight={600}>
                Code: {e.meetingCode}
              </Typography>

              <Typography sx={{ opacity: 0.7, marginTop: 1 }}>
                Date: {formatDate(e.createdAt || e.date)}
              </Typography>
            </div>

            <button
              onClick={() => navigate(`/${e.meetingCode}`)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                color: "white",
              }}
            >
              Rejoin
            </button>
          </CardContent>
        </Card>
      ))
    )}
  </div>
);



}