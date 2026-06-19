import axios from "axios";

export const API_BACKEND = axios.create({
  baseURL: "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon",
});;

export interface LoginResponse {
  id?: string;
  userId?: string;
  username?: string;
}

export interface TrainerStats {
  level: string;
  vitorias: string;
  derrotas: string;
}
export const SORTEADO_LEVEL = 2;

export const hasSorteado = (level: string | number | undefined | null): boolean =>
  Number(level ?? 1) >= SORTEADO_LEVEL;

// cadastro
export const register = async (
  username: string,
  password: string
): Promise<void> => {
  await API_BACKEND.post("/auth/v1/register", { username, password });
};

// login
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await API_BACKEND.post<LoginResponse>("/auth/v1/login", {
    username,
    password,
  });
  return response.data;
};

// get estatisticas perfil
export const getTrainerStats = async (userId: string): Promise<TrainerStats> => {
  const response = await API_BACKEND.get<TrainerStats>(
    `/auth/v1/stats/${userId}`
  );
  return response.data;
};

// atualiza estatisticas do treinador (vitórias, derrotas, nível)
export const updateTrainerStats = async (
  userId: string,
  stats: TrainerStats
): Promise<void> => {
  await API_BACKEND.put(`/auth/v1/stats/${userId}`, stats);
};
