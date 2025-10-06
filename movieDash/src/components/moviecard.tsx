import { useState } from "react";
import type { Movie } from "../services/tmdb";
import styles from "./MovieCard.module.css";

interface Props {
  movie: Movie;
  onFavorite: (id: number) => void;
  isFavorite: boolean;
  onClick: () => void;
  rank?: number; // 1. Adicionada a propriedade opcional 'rank'
}

export default function MovieCard({
  movie,
  onFavorite,
  isFavorite,
  onClick,
  rank, // 2. Recebida a propriedade 'rank'
}: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      className={`${styles.card} flex flex-col shadow cursor-pointer`}
      onClick={onClick}
    >
      {/* 3. Renderização condicional do contador */}
      {rank && (
        <div className="absolute top-0 left-0 bg-black/70 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-br-lg z-10">
          {rank}
        </div>
      )}

      {/* Container da imagem com altura fixa */}
      <div className="h-72 w-full">
        {movie.poster_path ? (
          <>
            {!isImageLoaded && (
              <div className="w-full h-full bg-gray-700 animate-pulse rounded-t-lg"></div>
            )}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              onLoad={() => setIsImageLoaded(true)}
              className={`w-full h-full object-cover rounded-t-lg ${
                isImageLoaded ? "block" : "hidden"
              }`}
            />
          </>
        ) : (
          <div className="h-72 w-full flex items-center justify-center text-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg p-4">
            <h3 className="text-gray-300 font-bold text-lg">
              {movie.title}
            </h3>
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col flex-grow">
        <h2 className="text-sm mt-2 flex-grow min-h-[2.5rem]">{movie.title}</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(movie.id);
          }}
          className={`mt-2 px-2 py-1 w-full text-xs rounded ${
            isFavorite ? "bg-red-500 text-white" : "bg-gray-600 text-gray-200"
          }`}
        >
          {isFavorite ? "★ Favorito" : "☆ Favoritar"}
        </button>
      </div>
    </div>
  );
}