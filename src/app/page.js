"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";

export default function Home() {

  //Contexto de autenticacion
  const { sesion, isAuthenticated, isLoading, login, register, logout } = useAuth();

  // Pantalla de login/registro
  const [vistaAuth, setVistaAuth] = useState("login");
  const [emailForm, setEmailForm]     = useState("");
  const [passForm, setPassForm]       = useState("");
  const [nombreForm, setNombreForm]   = useState("");
  const [rolForm, setRolForm]         = useState("usuario");
  const [errorAuth, setErrorAuth]     = useState("");

  // Datos principales
  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas]       = useState([]);
  const [todasTareas, setTodasTareas] = useState([]);
  const [proyectoActivo, setProyectoActivo] = useState(null);

  // Formulario proyecto
  const [nomProy, setNomProy]   = useState("");
  const [descProy, setDescProy] = useState("");
  const [editProy, setEditProy] = useState(null);

  // Formulario tarea
  const [nomTarea, setNomTarea] = useState("");
  const [usuTarea, setUsuTarea] = useState("");
  const [editTarea, setEditTarea] = useState(null);

  // Cuando hay sesion, cargar los datos
  useEffect(() => {
    if (isAuthenticated) {
      cargarProyectos();
      cargarTodasTareas();
    }
  }, [isAuthenticated]);


  //Autenticacion
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorAuth("");
    try {
      await login(emailForm, passForm);
    } catch (error) {
      setErrorAuth(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorAuth("");
    try {
      await register(nombreForm, emailForm, passForm, rolForm);
    } catch (error) {
      setErrorAuth(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    setProyectos([]); 
    setTareas([]); 
    setProyectoActivo(null);
  };

  // ── Lógica de Negocio: Proyectos ──
  const cargarProyectos = async () => {
    const res = await api.get("/proyectos");
    setProyectos(res.data);
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    const datos = { nombre: nomProy, descripcion: descProy };
    if (editProy) {
      await api.put(`/proyectos/${editProy}`, datos);
    } else {
      await api.post("/proyectos", datos);
    }
    setNomProy(""); setDescProy(""); setEditProy(null);
    cargarProyectos();
  };

  const eliminarProyecto = async (id) => {
    if (!window.confirm("¿Confirma la eliminación del proyecto?")) return;
    await api.delete(`/proyectos/${id}`);
    if (proyectoActivo?.id === id) { setProyectoActivo(null); setTareas([]); }
    cargarProyectos();
  };

  // ── Lógica de Negocio: Tareas ──
  const cargarTodasTareas = async () => {
    const res = await api.get("/tareas");
    setTodasTareas(res.data);
  };

  const cargarTareas = async (proyecto) => {
    setProyectoActivo(proyecto);
    const res = await api.get(`/tareas?projectId=${proyecto.id}`);
    setTareas(res.data);
  };

  const guardarTarea = async (e) => {
    e.preventDefault();
    const datos = { nombre: nomTarea, usuario: usuTarea, estado: "pendiente", projectId: proyectoActivo.id };
    if (editTarea) {
      await api.put(`/tareas/${editTarea}`, datos);
    } else {
      await api.post("/tareas", datos);
    }
    setNomTarea(""); setUsuTarea(""); setEditTarea(null);
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Confirma la eliminación de la tarea?")) return;
    await api.delete(`/tareas/${id}`);
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  const cambiarEstado = async (tarea, nuevoEstado) => {
    await api.put(`/tareas/${tarea.id}`, { ...tarea, estado: nuevoEstado });
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  // ── Renderizado y Logica de Presentacion ──
  
  // Evitamos destellos mientras se resuelve la sesion en el localStorage )
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando contexto de aplicación...</div>;

  const esGerente = sesion?.role === "gerente";
  const completadas = todasTareas.filter(t => t.estado === "completada").length;
  const progresoPct = todasTareas.length > 0 ? Math.round((completadas / todasTareas.length) * 100) : 0;

  //Controlador de Rutas
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center">Gestión de Proyectos</h1>
          <p className="text-xs text-gray-400 text-center mb-6">Universidad Don Bosco — DPS</p>

          <div className="flex mb-6 border rounded-lg overflow-hidden">
            <button className={`flex-1 py-2 text-sm font-semibold ${vistaAuth === "login" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => { setVistaAuth("login"); setErrorAuth(""); }}>
              Iniciar sesión
            </button>
            <button className={`flex-1 py-2 text-sm font-semibold ${vistaAuth === "registro" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => { setVistaAuth("registro"); setErrorAuth(""); }}>
              Registrarse
            </button>
          </div>

          {errorAuth && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2 mb-4">{errorAuth}</p>
          )}

          {vistaAuth === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <input className="w-full border rounded p-2 text-sm" type="email" placeholder="Correo Electrónico"
                value={emailForm} onChange={e => setEmailForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="password" placeholder="Contraseña"
                value={passForm} onChange={e => setPassForm(e.target.value)} required />
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                Autenticar
              </button>
              <p className="text-xs text-gray-400 text-center">Prueba: gerente@mail.com / 123456</p>
            </form>
          )}

          {vistaAuth === "registro" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <input className="w-full border rounded p-2 text-sm" placeholder="Nombre completo"
                value={nombreForm} onChange={e => setNombreForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="email" placeholder="Correo Electrónico"
                value={emailForm} onChange={e => setEmailForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="password" placeholder="Contraseña"
                value={passForm} onChange={e => setPassForm(e.target.value)} required />
              <select className="w-full border rounded p-2 text-sm"
                value={rolForm} onChange={e => setRolForm(e.target.value)}>
                <option value="usuario">Usuario Estándar</option>
                <option value="gerente">Gerente de Proyecto</option>
              </select>
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                Registrar Entidad
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  //Controlador de Rutas: Vista Protegida para el Dashboard
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-700">Gestión de Proyectos</h1>
            <p className="text-sm text-gray-500">Sesión activa: {sesion.nombre} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white uppercase ${esGerente ? "bg-blue-600" : "bg-green-500"}`}>
              {sesion.role}
            </span>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">
              Finalizar Sesión
            </button>
          </div>
        </div>

        {/* Metricas Generales */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Progreso general — {completadas} de {todasTareas.length} tareas completadas ({progresoPct}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progresoPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Modulo de Proyectos */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-gray-700 mb-3">Directorio de Proyectos ({proyectos.length})</h2>
            
            {esGerente && (
              <form onSubmit={guardarProyecto} className="mb-4 space-y-2">
                <input className="w-full border rounded p-2 text-sm" placeholder="Nomenclatura del proyecto"
                  value={nomProy} onChange={e => setNomProy(e.target.value)} required />
                <input className="w-full border rounded p-2 text-sm" placeholder="Descripción técnica"
                  value={descProy} onChange={e => setDescProy(e.target.value)} required />
                <button className="w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">
                  {editProy ? "Actualizar Registro" : "Inicializar Proyecto"}
                </button>
                {editProy && (
                  <button type="button" onClick={() => { setEditProy(null); setNomProy(""); setDescProy(""); }}
                    className="w-full border text-gray-500 py-1.5 rounded text-sm hover:bg-gray-50">
                    Abortar Edición
                  </button>
                )}
              </form>
            )}

            {proyectos.length === 0 && <p className="text-sm text-gray-400 italic">No existen proyectos instanciados.</p>}
            {proyectos.map(p => (
              <div key={p.id} onClick={() => cargarTareas(p)}
                className={`p-3 mb-2 border rounded-lg cursor-pointer transition-colors ${proyectoActivo?.id === p.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                <p className="text-sm font-semibold">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.descripcion}</p>
                {esGerente && (
                  <div className="flex gap-3 mt-1" onClick={e => e.stopPropagation()}>
                    <button className="text-xs text-yellow-600 hover:underline"
                      onClick={() => { setEditProy(p.id); setNomProy(p.nombre); setDescProy(p.descripcion); }}>
                      Modificar
                    </button>
                    <button className="text-xs text-red-500 hover:underline" onClick={() => eliminarProyecto(p.id)}>
                      Suprimir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Modulo de Tareas */}
          <div className="bg-white rounded-xl shadow p-4">
            {proyectoActivo ? (
              <>
                <h2 className="font-bold text-gray-700 mb-3">Desglose de Tareas — {proyectoActivo.nombre}</h2>
                {esGerente && (
                  <form onSubmit={guardarTarea} className="mb-4 space-y-2">
                    <input className="w-full border rounded p-2 text-sm" placeholder="Designación de la tarea"
                      value={nomTarea} onChange={e => setNomTarea(e.target.value)} required />
                    <input className="w-full border rounded p-2 text-sm" placeholder="Recurso asignado..."
                      value={usuTarea} onChange={e => setUsuTarea(e.target.value)} required />
                    <button className="w-full bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700">
                      {editTarea ? "Actualizar Parámetros" : "Asignar Recurso"}
                    </button>
                    {editTarea && (
                      <button type="button" onClick={() => { setEditTarea(null); setNomTarea(""); setUsuTarea(""); }}
                        className="w-full border text-gray-500 py-1.5 rounded text-sm hover:bg-gray-50">
                        Abortar Edición
                      </button>
                    )}
                  </form>
                )}

                {tareas.length === 0 && <p className="text-sm text-gray-400 italic">No se han registrado tareas subyacentes.</p>}
                {tareas.map(t => (
                  <div key={t.id} className="p-3 mb-2 border rounded-lg bg-gray-50">
                    <p className="text-sm font-semibold">{t.nombre}</p>
                    <p className="text-xs text-gray-400">Responsable: {t.usuario}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <select className="text-xs border rounded px-1 py-0.5"
                        value={t.estado || "pendiente"}
                        onChange={e => cambiarEstado(t, e.target.value)}>
                        <option value="pendiente">Fase Pendiente</option>
                        <option value="en progreso">En Ejecución</option>
                        <option value="completada">Fase Completada</option>
                      </select>
                      {esGerente && (
                        <>
                          <button className="text-xs text-yellow-600 hover:underline"
                            onClick={() => { setEditTarea(t.id); setNomTarea(t.nombre); setUsuTarea(t.usuario); }}>
                            Modificar
                          </button>
                          <button className="text-xs text-red-500 hover:underline" onClick={() => eliminarTarea(t.id)}>
                            Suprimir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-10 text-center">
                Seleccione un nodo de proyecto para inspeccionar sus dependencias.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
