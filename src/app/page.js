"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function Home() {

  // Sesión
  const [sesion, setSesion] = useState(null); // null = no ha iniciado sesión

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

  // Al cargar, revisar si ya hay sesión guardada
  useEffect(() => {
    const guardada = JSON.parse(localStorage.getItem("userSession"));
    if (guardada) {
      setSesion(guardada);
    }
  }, []);

  // Cuando hay sesión, cargar los datos
  useEffect(() => {
    if (sesion) {
      cargarProyectos();
      cargarTodasTareas();
    }
  }, [sesion]);


  // ── Autenticación ──────────────────────────────────────────────────────────

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setErrorAuth("");

    // Buscar usuario en la API
    const res = await axios.get(`${API}/usuarios?email=${emailForm}&password=${passForm}`);

    if (res.data.length === 0) {
      setErrorAuth("Email o contraseña incorrectos.");
      return;
    }

    const usuario = res.data[0];
    localStorage.setItem("userSession", JSON.stringify(usuario));
    setSesion(usuario);
  };

  const registrarse = async (e) => {
    e.preventDefault();
    setErrorAuth("");

    // Validar que el email no esté en uso
    const existe = await axios.get(`${API}/usuarios?email=${emailForm}`);
    if (existe.data.length > 0) {
      setErrorAuth("Ese email ya está registrado.");
      return;
    }

    // Crear usuario nuevo
    const nuevo = { nombre: nombreForm, email: emailForm, password: passForm, role: rolForm };
    const res = await axios.post(`${API}/usuarios`, nuevo);

    localStorage.setItem("userSession", JSON.stringify(res.data));
    setSesion(res.data);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("userSession");
    setSesion(null);
    setProyectos([]); setTareas([]); setProyectoActivo(null);
  };


  // ── Proyectos ────────────────────

  const cargarProyectos = async () => {
    const res = await axios.get(`${API}/proyectos`);
    setProyectos(res.data);
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();
    const datos = { nombre: nomProy, descripcion: descProy };
    if (editProy) {
      await axios.put(`${API}/proyectos/${editProy}`, datos);
    } else {
      await axios.post(`${API}/proyectos`, datos);
    }
    setNomProy(""); setDescProy(""); setEditProy(null);
    cargarProyectos();
  };

  const eliminarProyecto = async (id) => {
    if (!confirm("¿Eliminar proyecto?")) return;
    await axios.delete(`${API}/proyectos/${id}`);
    if (proyectoActivo?.id === id) { setProyectoActivo(null); setTareas([]); }
    cargarProyectos();
  };


  // ── Tareas ─────────────────────

  const cargarTodasTareas = async () => {
    const res = await axios.get(`${API}/tareas`);
    setTodasTareas(res.data);
  };

  const cargarTareas = async (proyecto) => {
    setProyectoActivo(proyecto);
    const res = await axios.get(`${API}/tareas?projectId=${proyecto.id}`);
    setTareas(res.data);
  };

  const guardarTarea = async (e) => {
    e.preventDefault();
    const datos = { nombre: nomTarea, usuario: usuTarea, estado: "pendiente", projectId: proyectoActivo.id };
    if (editTarea) {
      await axios.put(`${API}/tareas/${editTarea}`, datos);
    } else {
      await axios.post(`${API}/tareas`, datos);
    }
    setNomTarea(""); setUsuTarea(""); setEditTarea(null);
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  const eliminarTarea = async (id) => {
    if (!confirm("¿Eliminar tarea?")) return;
    await axios.delete(`${API}/tareas/${id}`);
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  const cambiarEstado = async (tarea, nuevoEstado) => {
    await axios.put(`${API}/tareas/${tarea.id}`, { ...tarea, estado: nuevoEstado });
    cargarTareas(proyectoActivo);
    cargarTodasTareas();
  };

  // Progreso general: % de tareas completadas
  const completadas  = todasTareas.filter(t => t.estado === "completada").length;
  const progresoPct  = todasTareas.length > 0 ? Math.round((completadas / todasTareas.length) * 100) : 0;

  const esGerente = sesion?.role === "gerente";


  // ══════════════════════════════════════════════════════════════════════════
  //  PANTALLA DE LOGIN / REGISTRO  (ruta protegida — si no hay sesión)
  // ══════════════════════════════════════════════════════════════════════════

  if (!sesion) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">

          <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center">Gestión de Proyectos</h1>
          <p className="text-xs text-gray-400 text-center mb-6">Universidad Don Bosco — DPS</p>

          {/* Tabs login / registro */}
          <div className="flex mb-6 border rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-semibold ${vistaAuth === "login" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => { setVistaAuth("login"); setErrorAuth(""); }}
            >
              Iniciar sesión
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold ${vistaAuth === "registro" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => { setVistaAuth("registro"); setErrorAuth(""); }}
            >
              Registrarse
            </button>
          </div>

          {errorAuth && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2 mb-4">{errorAuth}</p>
          )}

          {/* Formulario Login */}
          {vistaAuth === "login" && (
            <form onSubmit={iniciarSesion} className="space-y-3">
              <input className="w-full border rounded p-2 text-sm" type="email" placeholder="Email"
                value={emailForm} onChange={e => setEmailForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="password" placeholder="Contraseña"
                value={passForm} onChange={e => setPassForm(e.target.value)} required />
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                Entrar
              </button>
              <p className="text-xs text-gray-400 text-center">
                Prueba: gerente@mail.com / 123456
              </p>
            </form>
          )}

          {/* Formulario Registro */}
          {vistaAuth === "registro" && (
            <form onSubmit={registrarse} className="space-y-3">
              <input className="w-full border rounded p-2 text-sm" placeholder="Nombre completo"
                value={nombreForm} onChange={e => setNombreForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="email" placeholder="Email"
                value={emailForm} onChange={e => setEmailForm(e.target.value)} required />
              <input className="w-full border rounded p-2 text-sm" type="password" placeholder="Contraseña"
                value={passForm} onChange={e => setPassForm(e.target.value)} required />
              <select className="w-full border rounded p-2 text-sm"
                value={rolForm} onChange={e => setRolForm(e.target.value)}>
                <option value="usuario">Usuario</option>
                <option value="gerente">Gerente</option>
              </select>
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                Crear cuenta
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }


  // ══════════════════════════════════════════════════════════════════════════
  //  DASHBOARD PRINCIPAL  (solo si hay sesión — ruta protegida)
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-700">Gestión de Proyectos</h1>
            <p className="text-sm text-gray-500">Hola, {sesion.nombre} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white uppercase
              ${esGerente ? "bg-blue-600" : "bg-green-500"}`}>
              {sesion.role}
            </span>
            <button onClick={cerrarSesion} className="text-xs text-red-500 hover:underline">
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Progreso general */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Progreso general — {completadas} de {todasTareas.length} tareas completadas ({progresoPct}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
        </div>

        {/* Grid proyectos + tareas */}
        <div className="grid grid-cols-2 gap-4">

          {/* ── Columna Proyectos ── */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-gray-700 mb-3">Proyectos ({proyectos.length})</h2>

            {/* Formulario crear/editar — solo gerente */}
            {esGerente && (
              <form onSubmit={guardarProyecto} className="mb-4 space-y-2">
                <input className="w-full border rounded p-2 text-sm" placeholder="Nombre del proyecto"
                  value={nomProy} onChange={e => setNomProy(e.target.value)} required />
                <input className="w-full border rounded p-2 text-sm" placeholder="Descripción"
                  value={descProy} onChange={e => setDescProy(e.target.value)} required />
                <button className="w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">
                  {editProy ? "Actualizar proyecto" : "Crear proyecto"}
                </button>
                {editProy && (
                  <button type="button" onClick={() => { setEditProy(null); setNomProy(""); setDescProy(""); }}
                    className="w-full border text-gray-500 py-1.5 rounded text-sm hover:bg-gray-50">
                    Cancelar edición
                  </button>
                )}
              </form>
            )}

            {/* Lista de proyectos */}
            {proyectos.length === 0 && <p className="text-sm text-gray-400 italic">Sin proyectos aún.</p>}
            {proyectos.map(p => (
              <div key={p.id} onClick={() => cargarTareas(p)}
                className={`p-3 mb-2 border rounded-lg cursor-pointer
                  ${proyectoActivo?.id === p.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                <p className="text-sm font-semibold">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.descripcion}</p>
                {esGerente && (
                  <div className="flex gap-3 mt-1" onClick={e => e.stopPropagation()}>
                    <button className="text-xs text-yellow-600 hover:underline"
                      onClick={() => { setEditProy(p.id); setNomProy(p.nombre); setDescProy(p.descripcion); }}>
                      Editar
                    </button>
                    <button className="text-xs text-red-500 hover:underline"
                      onClick={() => eliminarProyecto(p.id)}>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Columna Tareas ── */}
          <div className="bg-white rounded-xl shadow p-4">
            {proyectoActivo ? (
              <>
                <h2 className="font-bold text-gray-700 mb-3">Tareas — {proyectoActivo.nombre}</h2>

                {/* Formulario crear/editar tarea — solo gerente */}
                {esGerente && (
                  <form onSubmit={guardarTarea} className="mb-4 space-y-2">
                    <input className="w-full border rounded p-2 text-sm" placeholder="Nombre de la tarea"
                      value={nomTarea} onChange={e => setNomTarea(e.target.value)} required />
                    <input className="w-full border rounded p-2 text-sm" placeholder="Asignar a..."
                      value={usuTarea} onChange={e => setUsuTarea(e.target.value)} required />
                    <button className="w-full bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700">
                      {editTarea ? "Actualizar tarea" : "Asignar tarea"}
                    </button>
                    {editTarea && (
                      <button type="button" onClick={() => { setEditTarea(null); setNomTarea(""); setUsuTarea(""); }}
                        className="w-full border text-gray-500 py-1.5 rounded text-sm hover:bg-gray-50">
                        Cancelar edición
                      </button>
                    )}
                  </form>
                )}

                {/* Lista de tareas */}
                {tareas.length === 0 && <p className="text-sm text-gray-400 italic">Sin tareas en este proyecto.</p>}
                {tareas.map(t => (
                  <div key={t.id} className="p-3 mb-2 border rounded-lg bg-gray-50">
                    <p className="text-sm font-semibold">{t.nombre}</p>
                    <p className="text-xs text-gray-400">Asignado a: {t.usuario}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Cambiar estado — ambos roles pueden */}
                      <select className="text-xs border rounded px-1 py-0.5"
                        value={t.estado || "pendiente"}
                        onChange={e => cambiarEstado(t, e.target.value)}>
                        <option value="pendiente">Pendiente</option>
                        <option value="en progreso">En progreso</option>
                        <option value="completada">Completada</option>
                      </select>
                      {/* Editar y eliminar — solo gerente */}
                      {esGerente && (
                        <>
                          <button className="text-xs text-yellow-600 hover:underline"
                            onClick={() => { setEditTarea(t.id); setNomTarea(t.nombre); setUsuTarea(t.usuario); }}>
                            Editar
                          </button>
                          <button className="text-xs text-red-500 hover:underline"
                            onClick={() => eliminarTarea(t.id)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-10 text-center">
                Selecciona un proyecto para ver sus tareas.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
