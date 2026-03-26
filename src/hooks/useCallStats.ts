import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface CallStats {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  average_duration: number;
  total_duration: number;
  response_rate: number;
}

export type Period = 'today' | 'week' | 'month';

/**
 * Hook pour récupérer les statistiques des appels depuis le backend
 * @param period - Période à analyser (today, week, month)
 * @returns Objet avec données stats et états de chargement
 */
export const useCallStats = (period: Period = 'today') => {
  return useQuery({
    queryKey: ['callStats', period],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: CallStats }>(
          `/api/v1/calls/stats?period=${period}`
        );

        // Gérer les différents formats de réponse
        if (response.data && 'data' in response.data && response.data.data) {
          return response.data.data as CallStats;
        }

        return response.data as unknown as CallStats;
      } catch (error) {
        console.error(`Erreur lors du chargement des stats (${period}):`, error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes (anciennement cacheTime)
  });
};

/**
 * Formater la durée en heures et minutes
 */
export const formatDurationLong = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

/**
 * Formater la durée moyenne en minutes et secondes
 */
export const formatDurationAverage = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};
