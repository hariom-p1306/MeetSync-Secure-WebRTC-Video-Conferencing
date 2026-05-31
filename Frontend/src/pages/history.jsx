import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import { Button, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import RestoreIcon from "@mui/icons-material/Restore";
import VideocamIcon from "@mui/icons-material/Videocam";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import "../App.css";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        console.log("History response:", history);

        if (Array.isArray(history)) {
          setMeetings(history);
        } else {
          setMeetings([]);
        }
      } catch (err) {
        console.log("Error fetching history:", err);
        setMeetings([]);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getLatestMeetingDate = () => {
    if (meetings.length === 0) return "No meetings yet";

    const latest = meetings[0]?.createdAt || meetings[0]?.date;
    return formatDate(latest);
  };

  return (
    <div className="historyPage">
      {/* Header */}
      <header className="historyNavbar">
        <div className="historyBrand" onClick={() => navigate("/home")}>
          <span className="historyLogoDot"></span>
          <h3>MeetSync</h3>
        </div>

        <Button
          onClick={() => navigate("/home")}
          className="historyHomeBtn"
          startIcon={<HomeIcon />}
        >
          Home
        </Button>
      </header>

      <main className="historyWrapper">
        {/* Page Title */}
        <section className="historyHero">
          <div>
            <div className="historyBadge">
              <RestoreIcon />
              Meeting Records
            </div>

            <h1>Meeting History</h1>

            <p>
              View your previously joined meeting rooms and quickly rejoin any
              session using the saved meeting code.
            </p>
          </div>

          <div className="historyStatsCard">
            <div className="statsIcon">
              <VideocamIcon />
            </div>

            <div>
              <h2>{meetings.length}</h2>
              <p>Total Meetings</p>
            </div>
          </div>

          <div className="historyStatsCard">
            <div className="statsIcon calendarIcon">
              <CalendarMonthIcon />
            </div>

            <div>
              <h2>{getLatestMeetingDate()}</h2>
              <p>Latest Meeting</p>
            </div>
          </div>
        </section>

        {/* History List */}
        <section className="historyListSection">
          <div className="historySectionHeader">
            <div>
              <h2>Recent Rooms</h2>
              <p>Your saved meeting codes appear here.</p>
            </div>

            <Button
              onClick={() => navigate("/home")}
              className="createFromHistoryBtn"
            >
              Join New Meeting
            </Button>
          </div>

          {meetings.length === 0 ? (
            <div className="emptyHistoryCard">
              <div className="emptyIcon">
                <RestoreIcon />
              </div>

              <h3>No history found</h3>

              <p>
                You have not joined any meeting yet. Start or join a meeting and
                it will appear here.
              </p>

              <Button
                onClick={() => navigate("/home")}
                className="primaryHistoryBtn"
              >
                Go to Home
              </Button>
            </div>
          ) : (
            <div className="historyGrid">
              {meetings.map((meeting, index) => (
                <div className="historyCard" key={index}>
                  <div className="historyCardLeft">
                    <div className="meetingIcon">
                      <VideocamIcon />
                    </div>

                    <div>
                      <h3>{meeting.meetingCode}</h3>
                      <p>Date: {formatDate(meeting.createdAt || meeting.date)}</p>
                    </div>
                  </div>

                  <button
                    className="rejoinBtn"
                    onClick={() => navigate(`/${meeting.meetingCode}`)}
                  >
                    Rejoin
                    <ArrowForwardIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}