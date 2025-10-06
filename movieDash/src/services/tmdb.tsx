import axios from "axios";


// console.log("TMDB API KEY:", import.meta.env.VITE_TMDB_API_KEY);

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: "pt-BR",
    
  },

});

export async function getMovieById(id: number): Promise<Movie> {
  const res = await api.get(`/movie/${id}`);
  return res.data;
}

export async function getGenres(): Promise<Genre[]> {
  const res = await api.get("/genre/movie/list");
  return res  .data.genres;
}


export async function getMovieImages(id:number) {

  const response = await api.get(`/movie/${id}/images`);
  return response.data;
  
}

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

// Interface completa para os detalhes do filme

export interface MovieDetails extends Movie{
  runtime: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
  'watch/providers':{
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

// Nova função para buscar todos os detalhes de uma vez

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const response = await api.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,watch/providers',
    },
  });
  return response.data;
}

// final função

function getRandomPage(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getPopularMovies = async (): Promise<Movie[]> => {

  const randomPage = getRandomPage(1, 50); // sorteia entre 1 e 50
  const res = await api.get("/movie/popular", { params: { page: randomPage } });
  return res.data.results.slice(0, 18); // só 18 resultados
};

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  const res = await api.get("/search/movie", { params: { query, page } });
  return res.data.results.slice(0, 18); //limita a 18
};


export async function getMovieCertification(id: number): Promise<string> {
  try {
    const response = await api.get(`/movie/${id}/release_dates`);
    const results = response.data.results;

    // Procura pelos resultados do Brasil (BR)
    const brazilRelease = results.find(
      (result: any) => result.iso_3166_1 === "BR"
    );

    if (brazilRelease && brazilRelease.release_dates.length > 0) {
      // Encontra a primeira certificação não vazia na lista
      const releaseWithCert = brazilRelease.release_dates.find(
        (rd: any) => rd.certification
      );
      if (releaseWithCert) {
        return releaseWithCert.certification;
      }
    }
    // Retorna 'L' (Livre) como padrão se não encontrar nada
    return "L";
  } catch (error) {
    console.error("Erro ao buscar certificação:", error);
    return "L"; // Retorna 'L' em caso de erro na API
  }
}