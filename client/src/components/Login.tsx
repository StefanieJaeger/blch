import { useState } from "react";
import { User } from "../types/User";

interface LoginProps {
    onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [address, setAddress] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (address) {
            onLogin({ address });
        } else {
            alert("Invalid login");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="walletAddress">Wallet Address:</label>
                <input 
                    type="text" 
                    id="walletAddress" 
                    name="walletAddress" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    required />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;