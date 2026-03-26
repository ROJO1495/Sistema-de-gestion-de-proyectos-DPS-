"use client";
import { createContext, useState, useEffect, useContext } from "react";
import api from "../lib/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [sesion, setSesion] = useState(null);
    const [isloading, setIsLoading] = useState(true);

    useEffect(() => {
        const sesionGuardada = localStorage.getItem("userSession");
        if (sesionGuardada) {
            setSesion(JSON.parse(sesionGuardada));
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.get(`/usuarios?email=${email}&password=${password}`);
        if (res.data.length === 0) {
            throw new Error("Credenciales inválidas.");
        }
        const usuario = res.data[0];
        localStorage.setItem("userSession", JSON.stringify(usuario));
        setSesion(usuario);
    };

    const register = async (nombre, email, password, role) => {
        const existe = await api.get(`/usuarios?email=${email}`);
        if (existe.data.length > 0) {
            throw new Error("El correo electrónico ya se encuentra registrado.");
        }
        const nuevoUsuario = { nombre, email, password, role };
        const res = await api.post(`/usuarios`, nuevoUsuario);
        
        localStorage.setItem("userSession", JSON.stringify(res.data));
        setSesion(res.data);
    };

    const logout = () => {
        localStorage.removeItem("userSession");
        setSesion(null);
    };

    return (
        <AuthContext.Provider value={{ sesion, isAuthenticated: !!sesion, isloading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);