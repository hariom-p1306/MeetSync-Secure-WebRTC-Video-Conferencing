import * as React from 'react';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {

    const [showPassword, setShowPassword] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
    const [open, setOpen] = React.useState(false);
    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        try {
            setError("");

            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setFormState(0);
            }

            setUsername("");
            setPassword("");
            setName("");

        } catch (err) {
            let message = err.response?.data?.message || "Something went wrong";
            setError(message);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background:
                        "radial-gradient(circle at 80% 30%, rgba(99,102,241,0.4), transparent 40%), linear-gradient(135deg, #0f0f1a, #1a1a2e)",
                }}
            >
                <CssBaseline />

                <Paper
                    elevation={0}
                    sx={{
                        width: 400,
                        p: 5,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(25px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 0 80px rgba(99,102,241,0.35)",
                        color: "white",
                    }}
                >
                    <Box display="flex" flexDirection="column" alignItems="center">

                        <Avatar sx={{ bgcolor: "transparent", mb: 1 }}>
                            <LockOutlinedIcon sx={{ color: "#ff8a00" }} />
                        </Avatar>

                        <Typography variant="h5" fontWeight={600}>
                            {formState === 0 ? "Welcome Back" : "Create Account"}
                        </Typography>

                        <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>
                            {formState === 0 ? "Sign in to continue" : "Sign up to get started"}
                        </Typography>

                        {formState === 1 && (
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputLabelProps={{ style: { color: "#aaa" } }}
                                InputProps={{
                                    style: { color: "white", background: "rgba(255,255,255,0.08)", borderRadius: 10 }
                                }}
                            />
                        )}

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}

                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "#444",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#ff8a00",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#ff0058",
                                    },
                                },
                            }}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputLabelProps={{ style: { color: "#aaa" } }}
                            InputProps={{
                                style: {
                                    color: "white",
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: 10
                                },
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
                                )
                            }}
                        />

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 5,
                                fontWeight: 600,
                                background: "linear-gradient(90deg, #ff8a00, #ff0058)",
                                color: "white",
                                "&:hover": {
                                    boxShadow: "0 0 30px rgba(255,0,88,0.6)",
                                },
                            }}
                            onClick={handleAuth}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>

                        <Typography sx={{ mt: 2, opacity: 0.7 }}>
                            {formState === 0 ? "Don't have an account?" : "Already have an account?"}
                            <span
                                style={{ color: "#ff8a00", cursor: "pointer", marginLeft: 5 }}
                                onClick={() => setFormState(formState === 0 ? 1 : 0)}
                            >
                                {formState === 0 ? "Sign Up" : "Sign In"}
                            </span>
                        </Typography>

                    </Box>
                </Paper>
            </Grid>
        </ThemeProvider>
    );
}
