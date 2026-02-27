
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        //(localStorage.getItem("token"))

        const isAuthenticated = () => {
            if ((localStorage.getItem("token"))) {
                return true;
            }
            return false;
        }

        

        useEffect(() => {
            const token = localStorage.getItem("token");

            console.log("Token:", token);

            if (!token) {
                router("/auth");
            }
        }, [router]);

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;

