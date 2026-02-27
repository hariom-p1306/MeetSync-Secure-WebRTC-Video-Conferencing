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
    <div style={{ padding: "20px" }}>
      <IconButton onClick={() => navigate("/home")}>
        <HomeIcon />
      </IconButton>

      {meetings.length === 0 ? (
        <Typography variant="h6">No history found</Typography>
      ) : (
        meetings.map((e, i) => (
          <Card key={i} variant="outlined" style={{ marginBottom: "15px" }}>
            <CardContent>
              <Typography variant="h6">
                Code: {e.meetingCode}
              </Typography>

              <Typography color="text.secondary">
                Date: {formatDate(e.createdAt || e.date)}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}