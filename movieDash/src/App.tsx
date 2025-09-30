import { useEffect, useState } from "react";
import { getPopularMovies, searchMovies } from "./services/tmdb";
import type { Movie } from "./services/tmdb";
import MovieCard from "./components/moviecard";
import MovieModal from "./components/movieModal";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // estado para controle do carregamento
  const [loading, setLoading] = useState(true);

  // carregar filmes ao iniciar
  useEffect(() => {
    async function load() {
      // Inicia o carregamento
      setLoading(true);
      const data = await getPopularMovies();
      setMovies(data);
      // Finaliza o carregamento assim que os dados chegarem
      setLoading(false); 
    }
    load();
  }, []);

  // busca de filmes
  const handleSearch = async () => {
    setLoading(true);
    const results = search.trim()
      ? await searchMovies(search)
      : await getPopularMovies();
    setMovies(results);
    setLoading(false);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen text-white p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">

      <header className="flex flex-col items-center w-full mb-12">

      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">🎬 DashMovie</h1>
      

      {/* barra de busca */}
      <div className="flex items-center gap-2 p-2 border-2 border-gray-700 rounded-lg 
                      focus-within:border-transparent focus-within:ring-2 focus-within:ring-red-600 
                      transition-all duration-300 w-full max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar filmes..."
          className="bg-transparent border-none text-white placeholder-gray-500 w-full focus:ring-0 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
        >
          Buscar
        </button>
      </div>
      </header>

      {/* 🎥 Grid de filmes */}
      {loading ? (
        // skeleton enquanto carrega
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 animate-pulse h-72 rounded-lg"
            ></div>
          ))}
        </div>
      ) : (
        // grid real
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onFavorite={toggleFavorite}
              isFavorite={favorites.includes(movie.id)}
              onClick={() => setSelectedMovie(movie)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default App;