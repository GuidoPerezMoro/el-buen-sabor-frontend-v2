export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Bienvenido a El Buen Sabor</h1>
        <p className="text-lg">Comenzá tu pedido ahora</p>
        <button className="bg-primary text-white px-6 py-3 rounded-md shadow hover:opacity-90 transition">
          Ver Menú
        </button>
      </div>
    </main>
  );
}
