import { useEffect, useState, Fragment } from "react";
import { Menu, Transition } from '@headlessui/react';
import { getPopularMovies, searchMovies, getGenres, getMovieById } from "./services/tmdb";
import type { Movie, Genre } from "./services/tmdb";
import MovieCard from "./components/moviecard";
import MovieModal from "./components/movieModal";
import { SortableMovieCard } from "./components/SortableMovieCard";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem('dashmovie-favorites') || '[]'));
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('dashmovie-view') || 'popular');
  const [seenMovies, setSeenMovies] = useState<number[]>(() => JSON.parse(localStorage.getItem('dashmovie-seen') || '[]'));

  useEffect(() => { localStorage.setItem('dashmovie-view', currentView) }, [currentView]);
  useEffect(() => { localStorage.setItem('dashmovie-favorites', JSON.stringify(favorites)) }, [favorites]);
  useEffect(() => { localStorage.setItem('dashmovie-seen', JSON.stringify(seenMovies)) }, [seenMovies]);

  const displayPopularMovies = async () => {
    setLoading(true);
    setCurrentView('popular');
    try {
      const movieData = await getPopularMovies();
      setMovies(movieData);
    } catch (error) { console.error("Falha ao carregar filmes populares:", error); setMovies([]); }
    finally { setLoading(false); }
  };

  const displayFavoriteMovies = async () => {
    setLoading(true);
    setCurrentView('favorites');
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('dashmovie-favorites') || '[]');
      if (favoriteIds.length === 0) { setMovies([]); return; }
      const favoriteMoviesData = await Promise.all(favoriteIds.map((id: number) => getMovieById(id)));
      setMovies(favoriteMoviesData);
    } catch (error) { console.error("Falha ao carregar filmes favoritos:", error); setMovies([]); }
    finally { setLoading(false); }
  };

  const displaySeenMovies = async () => {
    setLoading(true);
    setCurrentView('seen');
    try {
      const seenIds = JSON.parse(localStorage.getItem('dashmovie-seen') || '[]');
      if (seenIds.length === 0) { setMovies([]); return; }
      const seenMoviesData = await Promise.all(seenIds.map((id: number) => getMovieById(id)));
      setMovies(seenMoviesData);
    } catch (error) { console.error("Falha ao carregar filmes vistos:", error); setMovies([]); }
    finally { setLoading(false); }
  };
  
  const markAsSeen = (movieId: number) => {
    setFavorites(current => current.filter(id => id !== movieId));
    setSeenMovies(current => [...new Set([...current, movieId])]);
    setMovies(current => current.filter(movie => movie.id !== movieId));
  };

  const removeFromFavorites = (movieId: number) => {
    setFavorites(current => current.filter(id => id !== movieId));
    if (currentView === 'favorites') {
      setMovies(current => current.filter(movie => movie.id !== movieId));
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        await getGenres().then(setGenres);
        const savedView = localStorage.getItem('dashmovie-view') || 'popular';
        if (savedView === 'favorites') { await displayFavoriteMovies(); }
        else if (savedView === 'seen') { await displaySeenMovies(); }
        else { await displayPopularMovies(); }
      } catch (error) { console.error("Falha ao carregar dados iniciais:", error);
      } finally { setLoading(false); }
    }
    loadInitialData();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setMovies((currentMovies) => {
        const oldIndex = currentMovies.findIndex((item) => item.id === active.id);
        const newIndex = currentMovies.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return currentMovies;
        const newOrder = arrayMove(currentMovies, oldIndex, newIndex);
        setFavorites(newOrder.map(movie => movie.id));
        return newOrder;
      });
    }
  }

  const handleSearch = async () => {
    setLoading(true);
    setCurrentView('search');
    try {
      const results = search.trim() ? await searchMovies(search) : await getPopularMovies();
      setMovies(results);
    } catch (error) {
      console.error("Falha ao buscar filmes:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = (id: number) => {
    setFavorites(currentFavorites => {
      const isFavorited = currentFavorites.includes(id);
      const newFavorites = isFavorited ? currentFavorites.filter(favId => favId !== id) : [...currentFavorites, id];
      if (currentView === 'favorites' && isFavorited) {
        setMovies(currentMovies => currentMovies.filter(movie => movie.id !== id));
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen text-white p-6 bg-black bg-gradient-to-b from-black to-red-950">
      <header className="flex flex-col items-center w-full mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent cursor-pointer" onClick={displayPopularMovies}>
          🎬 DashMovie
        </h1>
        <div className="relative flex items-center gap-4 w-full max-w-lg">
          <div className="flex-grow flex items-center gap-2 p-2 border-2 border-gray-700 rounded-lg focus-within:border-transparent focus-within:ring-2 focus-within:ring-red-600 transition-all duration-300">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar filmes..."
              className="bg-transparent border-none text-white placeholder-gray-500 w-full focus:ring-0 focus:outline-none"
            />
            <button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded cursor-pointer">
              Buscar
            </button>
          </div>
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 border-2 border-gray-700 rounded-lg hover:border-red-600 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (<button onClick={displayFavoriteMovies} className={`${active ? 'bg-gray-700' : ''} block w-full text-left px-4 py-2 text-sm text-gray-300 rounded-t-lg cursor-pointer`}>Lista</button>)}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (<button onClick={displaySeenMovies} className={`${active ? 'bg-gray-700' : ''} block w-full text-left px-4 py-2 text-sm text-gray-300 cursor-pointer`}>Vistos</button>)}
                </Menu.Item>
                <Menu.Item><a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Lançamentos 2025</a></Menu.Item>
                <div className="relative group">
                  <span className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-b-lg cursor-pointer">
                    Gêneros
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                  <div className="absolute left-full top-0 mt-[-1px] w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 custom-scrollbar">
                    {genres.map(genre => (<Menu.Item key={genre.id}><a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{genre.name}</a></Menu.Item>))}
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {Array.from({ length: 18 }).map((_, i) => <div key={i} className="bg-gray-800 animate-pulse h-72 rounded-lg"></div>)}
        </div>
      ) : movies.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={movies.map(m => m.id)} strategy={rectSortingStrategy} disabled={currentView !== 'favorites'}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {movies.map((movie, index) => {
                const isFavorited = favorites.includes(movie.id);
                if (currentView === 'favorites') {
                  return <SortableMovieCard key={movie.id} rank={index + 1} movie={movie} onMarkAsSeen={markAsSeen} onRemoveFromFavorites={removeFromFavorites} isFavorite={isFavorited} onClick={() => setSelectedMovie(movie)} />;
                }
                if (currentView === 'seen') {
                  return <MovieCard key={movie.id} movie={movie} isFavorite={isFavorited} onClick={() => setSelectedMovie(movie)} />;
                }
                return <MovieCard key={movie.id} movie={movie} onFavorite={toggleFavorite} isFavorite={isFavorited} onClick={() => setSelectedMovie(movie)} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center text-gray-400 mt-10">
          <p className="text-xl">Nenhum filme encontrado.</p>
          {currentView === 'favorites' && <p>Adicione filmes à sua lista de favoritos para vê-los aqui.</p>}
          {currentView === 'seen' && <p>Marque filmes como vistos para que eles apareçam nesta lista.</p>}
        </div>
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
}

export default App;