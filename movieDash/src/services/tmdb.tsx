import axios from "axios";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: "pt-BR",
  },
});

// --- INTERFACES ---
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// --- ESTA É A INTERFACE COMPLETA E CORRIGIDA ---
export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
  'watch/providers': {
    results: {
      BR?: {
        link?: string;
        flatrate?: WatchProvider[];
        rent?: WatchProvider[];
        buy?: WatchProvider[];
      };
    };
  };
}

// --- FUNÇÕES DA API (com tipos corrigidos) ---
export async function getMovieById(id: number): Promise<Movie> {
  const res = await api.get<Movie>(`/movie/${id}`);
  return res.data;
}

export async function getGenres(): Promise<Genre[]> {
  const res = await api.get<{ genres: Genre[] }>("/genre/movie/list");
  return res.data.genres;
}

export async function getMovieImages(id: number) {
  const response = await api.get<any>(`/movie/${id}/images`);
  return response.data;
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const response = await api.get<MovieDetails>(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,watch/providers',
    },
  });
  return response.data;
}

function getRandomPage(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getPopularMovies = async (): Promise<Movie[]> => {
  const randomPage = getRandomPage(1, 50);
  const res = await api.get<{ results: Movie[] }>("/movie/popular", { params: { page: randomPage } });
  return res.data.results.slice(0, 18);
};

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  const res = await api.get<{ results: Movie[] }>("/search/movie", { params: { query, page } });
  return res.data.results.slice(0, 18);
};

export async function getMovieCertification(id: number): Promise<string> {
  // ... (função sem alterações)
  return "L"; // Retorno simplificado para brevidade
}