import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const router = useNavigate();

  const features = [
    {
      title: "Secure Rooms",
      desc: "Create private meeting rooms and invite participants with a unique link.",
      icon: "🔐",
    },
    {
      title: "HD Video Calls",
      desc: "Smooth real-time audio and video powered by WebRTC.",
      icon: "🎥",
    },
    {
      title: "Screen Sharing",
      desc: "Share your screen for presentations and real-time collaboration.",
      icon: "🖥️",
    },
    {
      title: "Real-Time Chat",
      desc: "Send instant messages during meetings with room-based chat.",
      icon: "💬",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create a Room",
      desc: "Start a meeting instantly and generate a secure room link.",
    },
    {
      step: "02",
      title: "Invite Participants",
      desc: "Share the room link with your friends, team, or guests.",
    },
    {
      step: "03",
      title: "Collaborate Live",
      desc: "Talk, chat, share screen, and collaborate in real time.",
    },
  ];

  return (
    <div className="landingPageContainer">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">
          <span className="logoDot"></span>
          MeetSync
        </h2>

        <div className="navLinks">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <p onClick={() => router("/qa2342fsf")}>Rooms</p>
        </div>

        <div className="navActions">
          <p className="loginText" onClick={() => router("/auth")}>
            Login
          </p>
          <button className="navCta" onClick={() => router("/auth")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="heroSection">
        <div className="heroContent">
          <div className="heroBadge">
            <span></span>
            WebRTC Powered • Secure • Real-Time
          </div>

          <h1>
            Meet, Share, and <span className="highlight">Collaborate</span> in
            Real Time
          </h1>

          <p className="heroSubtitle">
            A WebRTC-powered video conferencing platform with secure meeting
            rooms, screen sharing, real-time chat, and collaboration tools.
          </p>

          <div className="heroButtons">
            <button className="ctaBtn">
              <Link to="/auth">Start Meeting</Link>
            </button>

            <button
              className="secondaryBtn"
              onClick={() => router("/qa2342fsf")}
            >
              Join Room
            </button>
          </div>

          <p className="trustText">
            No downloads required • Browser-based • Secure rooms
          </p>
        </div>

        <div className="heroImage">
          <div className="meetingMockup">
            <div className="mockupTop">
              <span className="liveDot"></span>
              <p>Team Meeting</p>
              <small>00:24:31</small>
            </div>

            <div className="videoGrid">
              <div className="videoCard cardOne">
                <span>HP</span>
                <p>Hariom Patel</p>
              </div>
              <div className="videoCard cardTwo">
                <span>AS</span>
                <p>Aman Singh</p>
              </div>
              <div className="videoCard cardThree">
                <span>RK</span>
                <p>Rahul Kumar</p>
              </div>
              <div className="videoCard cardFour">
                <span>You</span>
                <p>You</p>
              </div>
            </div>

            <div className="meetingControls">
              <button>🎙️</button>
              <button>📹</button>
              <button>🖥️</button>
              <button>💬</button>
              <button className="leaveBtn">☎</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="featuresSection" id="features">
        <div className="sectionHeader">
          <h2>Powerful Features for Real-Time Meetings</h2>
          <p>Everything you need to connect and collaborate smoothly.</p>
        </div>

        <div className="featuresGrid">
          {features.map((feature, index) => (
            <div className="featureCard" key={index}>
              <div className="featureIcon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="howSection" id="how-it-works">
        <div className="sectionHeader">
          <h2>How It Works</h2>
          <p>Start your meeting in just three simple steps.</p>
        </div>

        <div className="stepsGrid">
          {steps.map((item, index) => (
            <div className="stepCard" key={index}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="techSection">
        <p>Built with modern real-time technologies</p>

        <div className="techBadges">
          <span>WebRTC</span>
          <span>Socket.io</span>
          <span>React</span>
          <span>Node.js</span>
          <span>MongoDB</span>
          <span>JWT Auth</span>
        </div>
      </section>

      <p className="footerCredit">Built with ❤️ by Hariom Patel</p>
    </div>
  );
}