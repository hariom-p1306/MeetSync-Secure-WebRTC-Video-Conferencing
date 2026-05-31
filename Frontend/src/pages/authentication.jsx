import * as React from "react";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { Snackbar, Alert } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

import "../App.css";

export default function Authentication() {
  const [showPassword, setShowPassword] = React.useState(false);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0); // 0 = Login, 1 = Register
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const isLogin = formState === 0;

  const handleAuth = async () => {
    try {
      setError("");

      if (!username.trim() || !password.trim()) {
        setError("Username and password are required");
        return;
      }

      if (!isLogin && !name.trim()) {
        setError("Full name is required");
        return;
      }

      if (isLogin) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);

        setMessage(result || "Account created successfully");
        setOpen(true);
        setFormState(0);
      }

      setUsername("");
      setPassword("");
      setName("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      setError(errorMessage);
    }
  };

  const toggleFormState = () => {
    setFormState(isLogin ? 1 : 0);
    setError("");
    setMessage("");
  };

  const inputSx = {
    mt: 2,
    input: { color: "white" },
    "& .MuiOutlinedInput-root": {
      background: "rgba(255,255,255,0.08)",
      borderRadius: "16px",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.14)",
      },
      "&:hover fieldset": {
        borderColor: "#ff8a00",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ff0058",
      },
    },
    "& .MuiInputLabel-root": { color: "#aaa" },
  };

  return (
    <div className="authPage">
      <CssBaseline />

      <div className="authShell">
        {/* Left Side */}
        <section className="authInfo">
          <div className="authBrand">
            <span></span>
            <h2>MeetSync</h2>
          </div>

          <h1>
            Secure video meetings,
            <span> built for real-time collaboration.</span>
          </h1>

          <p>
            Sign in to create rooms, join meetings, chat in real time, and
            collaborate smoothly with your team.
          </p>

          <div className="authChips">
            <div>Secure Rooms</div>
            <div>WebRTC Powered</div>
            <div>Real-time Chat</div>
          </div>
        </section>

        {/* Auth Card */}
        <section className="authCard">
          <Box display="flex" flexDirection="column">
            <div className="authIcon">
              <LockOutlinedIcon />
            </div>

            <Typography
              variant="h5"
              fontWeight={900}
              sx={{ color: "white", textAlign: "center" }}
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#aaaabd",
                textAlign: "center",
                mt: 0.6,
                mb: 2,
              }}
            >
              {isLogin
                ? "Sign in to continue your meetings"
                : "Start secure video meetings with MeetSync"}
            </Typography>

            {formState === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={inputSx}
              />
            )}

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={inputSx}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAuth();
              }}
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#aaa" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && <div className="authError">{error}</div>}

            <Button
              fullWidth
              onClick={handleAuth}
              sx={{
                mt: 3,
                py: 1.55,
                borderRadius: "16px",
                fontWeight: 900,
                textTransform: "none",
                background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                color: "white",
                boxShadow: "0 18px 40px rgba(255,0,88,0.24)",
                "&:hover": {
                  boxShadow: "0 0 35px rgba(255,0,88,0.55)",
                },
              }}
            >
              {isLogin ? "Login" : "Register"}
            </Button>

            <Typography
              sx={{
                mt: 2.3,
                color: "#aaaabd",
                textAlign: "center",
                fontSize: "0.94rem",
              }}
            >
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <span className="authSwitch" onClick={toggleFormState}>
                {isLogin ? " Sign Up" : " Sign In"}
              </span>
            </Typography>
          </Box>
        </section>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={2500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="success"
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}