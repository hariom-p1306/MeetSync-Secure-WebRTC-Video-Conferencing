


import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//import router from "../../../Backend/src/routes/users.routes";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", { name, username, password });
            if (request.status === 201) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    // const handleLogin = async (username, password) => {
    //     try {
    //         const request = await client.post("/login", { username, password });
    //         if (request.status === 200) {
    //             setUserData(request.data.user);
    //             localStorage.setItem("token", request.data.token);
    //             return "Login Successful";

    //         }
    //     } catch (err) {
    //         throw err;
    //     }
    // };



    // const handleLogin = async (username, password) => {
    //     try {
    //         const request = await client.post("/login", {
    //             username,
    //             password
    //         });

    //         console.log(request.data);
    //         console.log("FULL RESPONSE:", response);

    //         if (request.status === 200) {
    //             // ✅ save token
    //             //localStorage.setItem("token", request.data.token);
    //             //localStorage.setItem("token", request.data.data.token);
    //             localStorage.setItem("token", response.token);

    //             // ✅ optional: save user data
    //             setUserData(request.data.user);

    //             // ✅ redirect correctly
    //             navigate("/home");
    //         }

    //     } catch (err) {
    //         console.error(err);
    //         throw err;
    //     }
    // };


    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", {
                username,
                password
            });

            console.log("FULL RESPONSE:", request);
            console.log("DATA:", request.data);

            // ✅ Safe token check
            if (request && request.data && request.data.token) {

                localStorage.setItem("token", request.data.token);

                // optional user data
                setUserData(request.data.user);

                navigate("/home");

            } else {
                console.log("Login response incorrect", request);
            }

        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // const handleLogin = async (username, password) => {
    //     try {
    //         const request = await client.post("/login", { username, password });


    //         if (request.status === 200) {
    //             setUserData(request.data.user);

    //             // ✅ VERY IMPORTANT
    //             localStorage.setItem("token", request.data.token);

    //             navigate("/home"); // optional but good
    //             return "Login Successful";
    //         }
    //     } catch (err) {
    //         throw err;
    //     }


    // };

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
        (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }







    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};


