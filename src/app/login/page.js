"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 

export default function Login() {
  // Estados para capturar las credenciales del usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Hook para la navegación programática
  const router = useRouter();

  // Función encargada de validar las credenciales contra la API simulada
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Petición GET para buscar si existe un usuario con el correo ingresado
      const respuesta = await axios.get(`http://localhost:3001/usuarios?email=${email}`);
      const usuariosEncontrados = respuesta.data;

      // Validación de existencia de la cuenta
      if (usuariosEncontrados.length > 0) {
        const usuario = usuariosEncontrados[0];
        
        // Validación de coincidencia de contraseña
        if (usuario.password === password) {
          
          // Almacenamiento de sesión básico en el cliente (preparación para rutas protegidas)
          localStorage.setItem("usuarioLogueado", JSON.stringify({
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
          }));
          
          alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
          
          // Redirección al panel principal (Dashboard)
          router.push("/"); 
        } else {
          alert("Contraseña incorrecta. Por favor, verifica tus datos.");
        }
      } else {
        alert("No encontramos ninguna cuenta con este correo. Regístrate primero.");
      }

    } catch (error) {
      console.error("Error durante el proceso de autenticación:", error);
      alert("Error de conexión. Intenta nuevamente más tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      {/* Contenedor de la tarjeta de login */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
        
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
          Bienvenido de nuevo
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grupo: Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black bg-white placeholder-gray-500"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Grupo: Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-black bg-white placeholder-gray-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Botón de envío */}
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            Entrar al Sistema
          </button>
        </form>

        {/* Enlace de navegación hacia el registro */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <a href="/registro" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
            Regístrate aquí
          </a>
        </p>

      </div>
    </div>
  );
}