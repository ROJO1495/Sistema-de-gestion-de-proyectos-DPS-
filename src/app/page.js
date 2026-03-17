export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Menú Lateral (Sidebar) */}
      <aside className="bg-slate-900 text-white w-full md:w-64 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-center md:text-left">
          Gestor
        </h1>
        <nav className="flex flex-col space-y-4">
          <a href="#" className="hover:text-blue-400 transition-colors">Inicio</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Mis Proyectos</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Tareas</a>
        </nav>
        
        {/* Botón de cerrar sesión al fondo */}
        <div className="mt-auto pt-8">
          <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de contenido principal */}
      <main className="flex-1 p-6 md:p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-600 mt-2">Bienvenido. Aquí está el resumen de tu trabajo.</p>
        </header>

        {/* Tarjetas de resumen (Progreso general pedido en la rúbrica) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-500">Proyectos Activos</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-500">Tareas Pendientes</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-500">Progreso General</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0%</p>
          </div>
        </div>

        {/* Espacio para la lista de proyectos */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Proyectos Recientes</h3>
          <p className="text-gray-500 text-sm">Aún no hay proyectos para mostrar.</p>
        </div>
      </main>

    </div>
  );
}