// login with wallet address
// distinction between admin and voters

import { useState } from "react";
import { User } from "../types/User";
import { authenticate } from "../utils/auth";

interface LoginProps {
    onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [address, setAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const role = authenticate(password);
        if (role && address) {
            onLogin({ address, role });
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
            <div>
                <label htmlFor="password">Password (admin/voter):</label>
                <input 
                    type="text" 
                    id="password" 
                    name="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;