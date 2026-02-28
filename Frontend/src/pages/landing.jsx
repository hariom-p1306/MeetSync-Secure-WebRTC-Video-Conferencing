import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
//import { Link, useNavigate } from 'react-router-dom'
export default function LandingPage() {

    const router = useNavigate();

    return (
        <div className="landingPageContainer">

            <nav className="navbar">
                {/* <h2 className="logo">Apna Video Call</h2> */}
                <h2 className="logo">
                    <span className="logoDot"></span>
                    Apna Video Call
                </h2>

                <div className="navlist">
                    <p onClick={() => router("/qa2342fsf")}>Join as Guest</p>
                    <p onClick={() => router("/auth")}>Register</p>
                    <p className="loginBtn" onClick={() => router("/auth")}>
                        Login
                    </p>
                </div>
            </nav>

            <div className="heroSection">

                <div className="heroContent">
                    <h1>
                        <span className="highlight">Connect</span> with your loved Ones
                    </h1>

                    <p>Cover a distance by Apna Video Call</p>

                    <button className="ctaBtn">
                        <Link to={"/auth"}>Get Started</Link>
                    </button>
                </div>

                <div className="heroImage">
                    <img src="/mobile.png" alt="video call preview" />
                </div>

            </div>
            <p className="footerCredit">
                Built with ❤️ by Hariom Patel
            </p>
        </div>
    )
}


