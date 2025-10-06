import { useState } from "react"; // 1. Importar o useState
import type { Movie } from "../services/tmdb";
import styles from "./MovieCard.module.css";

interface Props {
  movie: Movie;
  onFavorite: (id: number) => void;
  isFavorite: boolean;
  onClick: () => void;
}

export default function MovieCard({
  movie,
  onFavorite,
  isFavorite,
  onClick,
}: Props) {
  //controla o carregamento da imagem do card específico
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      className={`${styles.card} flex flex-col shadow cursor-pointer hover:scale-105 transition-transform duration-200`}
      onClick={onClick}
    >
      {/* Container da altura fixa para evitar pulos no layout */}
      <div className="h-72 w-full">
        {movie.poster_path ? (
          <>
            {/* Exibe o Skeleton enquanto a imagem não estiver carregada */}
            {!isImageLoaded && (
              <div className="w-full h-full bg-gray-700 animate-pulse rounded-t-lg"></div>
            )}

            {/* A imagem real do filme */}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              // 5. Atualiza o estado quando a imagem carregar
              onLoad={() => setIsImageLoaded(true)}
              // A imagem só fica visível quando carregada, senão fica oculta
              className={`w-full h-full object-cover rounded-t-lg ${
                isImageLoaded ? "block" : "hidden"
              }`}
            />
          </>
        ) : (
          // Placeholder para filmes SEM imagem
          <div className="h-72 flex items-center justify-center bg-gray-800 rounded-t-lg">
            <div className="h-72 w-full flex items-center justify-center text-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg p-4">
              <h3 className="text-gray-300 font-bold text-lg">
                {movie.title}
              </h3>
        </div>
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col flex-grow">
        <h2 className="text-sm mt-2 flex-grow">{movie.title}</h2>
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