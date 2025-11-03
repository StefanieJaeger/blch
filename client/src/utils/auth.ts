import { Role } from "../types/User";

export function authenticate(password: string): Role | null {
    if (password === "admin") return "admin";
    if (password === "voter") return "voter";
    return null;
}