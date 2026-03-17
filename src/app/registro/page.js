"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 

export default function Registro() {
  // Estados para almacenar los datos del formulario de registro
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Hook de Next.js para manejar las redirecciones entre páginas
  const router = useRouter(); 

  // Función principal que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue por defecto
    
    // Validación de seguridad básica en el cliente
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, verifica.");
      return;
    }

    try {
      // Petición GET para verificar si el email ya existe en JSON Server
      const respuestaValidacion = await axios.get(`http://localhost:3001/usuarios?email=${email}`);
      
      if (respuestaValidacion.data.length > 0) {
        alert("Ese correo ya está registrado. Intenta con otro o inicia sesión.");
        return;
      }

      // Estructura de datos del nuevo usuario. 
      // Se asigna el rol "Usuario" por defecto para gestión de permisos.
      const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: password,
        rol: "Usuario" 
      };

      // Petición POST para guardar el nuevo registro en la base de datos simulada
      await axios.post("http://localhost:3001/usuarios", nuevoUsuario);

      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
      
      // Redirigir a la pantalla de login tras un registro exitoso
      router.push("/login");

    } catch (error) {
      console.error("Hubo un error al registrar el usuario:", error);
      alert("Error de conexión. Intenta nuevamente más tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal del formulario con estilos responsivos */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
        
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
          Crear una Cuenta
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grupo: Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500" 
              placeholder="Ej. Juan Pérez" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>

          {/* Grupo: Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500" 
              placeholder="ejemplo@correo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          {/* Grupo: Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* Grupo: Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-500" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          
          {/* Botón de envío */}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors mt-2">
            Registrarse
          </button>
        </form>

        {/* Enlace alternativo de navegación */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta? <a href="/login" className="text-slate-900 font-semibold hover:underline">Inicia sesión aquí</a>
        </p>

      </div>
    </div>
  );
}