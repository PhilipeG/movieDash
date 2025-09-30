import { useState, useEffect } from "react";
import { getMovieImages, getMovieCertification, getMovieDetails } from "../services/tmdb";
import type { Movie, MovieDetails } from "../services/tmdb";

// formata o tempo de duração
function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

const streamingLinkMap: { [key: string]: string } = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Amazon Prime Video': 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=',
  'Disney Plus': 'https://www.disneyplus.com/search?q=',
  'Max': 'https://play.max.com/search?q=',
  'Star Plus': 'https://www.starplus.com/search?q=',
  'Apple TV Plus': 'https://tv.apple.com/br/search?term=',
  'Globoplay': 'https://globoplay.globo.com/busca/?q=',
};


interface Props {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: Props) {
  const [tab, setTab] = useState<"sinopse" | "info" | "galeria">("sinopse");
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [certification, setCertification] = useState<string>("");
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    if (!movie) return;

    async function loadExtraData() {
      setLoadingDetails(true);
      if (!movie) return;

      try {
        const imageData = await getMovieImages(movie.id);
        const cert = await getMovieCertification(movie.id);
        const movieDetails = await getMovieDetails(movie.id);
        setDetails(movieDetails);

        const backdrops = imageData.backdrops
          .slice(0, 5)
          .map((img: any) => `https://image.tmdb.org/t/p/w780${img.file_path}`);
        const poster = movie.poster_path
          ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
          : [];
        setImages([...poster, ...backdrops]);
        setCertification(cert);

      } catch (error) {
        console.error("Erro ao carregar dados extras do modal:", error);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadExtraData();
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo escuro */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white rounded-xl shadow-2xl max-w-5xl w-[95%] max-h-[85vh] overflow-hidden z-10 border border-gray-700 flex">
        
        {/* Coluna esquerda: poster/carrossel */}
        <div className="w-1/2 relative flex items-center justify-center bg-black">
          {images.length > 0 && (
            <img
              src={images[currentImage]}
              alt={movie.title}
              className="w-full h-full object-contain rounded-l-xl p-3"
            />
          )}
          <div className="absolute bottom-4 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full ${
                  currentImage === index ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* Coluna direita: info + tabs */}
        <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
          <button
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-gray-100 bg-clip-text text-transparent">
            {movie.title}
          </h2>
          
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-3">
            <span>{movie.release_date?.slice(0, 4)}</span>
            <span>•</span>
            <span className="flex items-center gap-1"> 
              ⭐ {movie.vote_average.toFixed(1)}
            </span>
            {certification && (
              <>
                <span>•</span>
                <span className="border border-gray-500 text-gray-300 rounded px-1.5 text-xs font-semibold">
                  {certification}
                </span>
              </>
            )}
          </p>

          {/* Abas Atualizadas */}
          <div className="mt-6 flex gap-6 border-b border-gray-700">
            <button onClick={() => setTab("sinopse")} className={`pb-2 ${tab === "sinopse" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}>Sinopse</button>
            <button onClick={() => setTab("info")} className={`pb-2 ${tab === "info" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}>Informações</button>
            <button onClick={() => setTab("galeria")} className={`pb-2 ${tab === "galeria" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"}`}>Galeria</button>
          </div>

          {/* Conteúdo Condicional Atualizado */}
          <div className="mt-4 text-gray-300">
            {tab === "sinopse" && <p>{movie.overview}</p>}

            {tab === "info" && (
              loadingDetails ? <p>Carregando...</p> : (() => {
                const streamingProviders = details?.['watch/providers']?.results?.BR?.flatrate || [];
                const watchLink = details?.['watch/providers']?.results?.BR?.link;

                return (
                  <div className="space-y-4">

                    <div>
                      <strong className="text-white">Data de Lançamento:</strong>
                      <p>{details?.release_date ? new Date(details.release_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                    </div>

                    <div>
                      <strong className="text-white">Duração:</strong>
                      <p>{details?.runtime ? formatRuntime(details.runtime) : 'N/A'}</p>
                    </div>

                    <div>
                      <strong className="text-white">Gênero:</strong>
                      <p>{details?.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
                    </div>

                    <div>
                      <strong className="text-white">Elenco Principal:</strong>
                      <p>{details?.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A'}</p>
                    </div>

                    <div>
                      <strong className="text-white">Onde Assistir (Streaming):</strong>
                      {streamingProviders.length > 0 && watchLink ? (
                        <a href={watchLink} target="_blank" rel="noopener noreferrer" title="Ver opções para assistir">
                          <div className="flex flex-wrap gap-2 mt-2 transition-opacity hover:opacity-80">
                            {streamingProviders.map(p => (
                              <img key={p.provider_id} src={`https://image.tmdb.org/t/p/w500${p.logo_path}`} alt={p.provider_name} title={p.provider_name} className="w-10 h-10 rounded-lg" />
                            ))}
                          </div>
                        </a>
                      ) : <p>Não disponível para streaming.</p>}
                  </div>
              </div>
            )
          })()
        )}

            {tab === "galeria" && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, i) => <img key={i} src={img} className="rounded" />)}
              </div>
            )}
          </div>

        </div>

      </div>
      
    </div>
  );
}