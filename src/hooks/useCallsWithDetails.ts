import { useState, useEffect, useCallback, useMemo } from 'react';
import { Call } from '@/types/api';
import { API_CONFIG } from '@/config/api';

interface Commercial {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface EnrichedCall {
  id: number;
  phoneNumber: string;
  callDate: Date;
  duration: number;
  status: string;
  decision: string | null;
  notes: string | null;
  commercialId: number;
  commercialName: string;
  hasRecording: boolean;
  audioUrl: string | null;
  callType?: 'incoming' | 'outgoing';
}

interface UseCallsWithDetailsReturn {
  enrichedCalls: EnrichedCall[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCallsWithDetails = (): UseCallsWithDetailsReturn => {
  const [enrichedCalls, setEnrichedCalls] = useState<EnrichedCall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer tous les appels
  const fetchCalls = useCallback(async (): Promise<Call[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Token non trouvé');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/calls?skip=0&limit=100&token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Impossible de récupérer les appels');

      const data = await response.json();
      if (!Array.isArray(data.data) && !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }
      
      const calls = Array.isArray(data.data) ? data.data : data;
      return calls as Call[];
    } catch (err) {
      console.error('Erreur lors de la récupération des appels:', err);
      throw err;
    }
  }, []);

  // Fonction pour récupérer tous les commerciaux
  const fetchCommercials = useCallback(async (): Promise<Record<number, Commercial>> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Token non trouvé');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/users/commercials?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Impossible de récupérer les commerciaux');

      const data = await response.json();
      if (!Array.isArray(data.data) && !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }
      
      const commercials = Array.isArray(data.data) ? data.data : data;
      
      // Créer une map pour accès rapide par ID
      const commercialMap: Record<number, Commercial> = {};
      commercials.forEach((c: Commercial) => {
        commercialMap[c.id] = c;
      });
      
      return commercialMap;
    } catch (err) {
      console.error('Erreur lors de la récupération des commerciaux:', err);
      throw err;
    }
  }, []);

  // Fonction pour vérifier si un enregistrement existe
  const checkRecording = useCallback(async (callId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/v1/recordings/by-call/${callId}?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.status === 200;
    } catch (err) {
      console.error(`Erreur lors de la vérification de l'enregistrement pour l'appel ${callId}:`, err);
      return false;
    }
  }, []);

  // Fonction principale pour récupérer et enrichir les données
  const fetchAndEnrich = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer appels et commerciaux en parallèle
      const [calls, commercialMap] = await Promise.all([
        fetchCalls(),
        fetchCommercials(),
      ]);

      // Vérifier les enregistrements en parallèle pour tous les appels
      const recordingChecks = calls.map(call => 
        checkRecording(call.id).then(hasRecording => ({ callId: call.id, hasRecording }))
      );
      const recordingsResult = await Promise.all(recordingChecks);
      
      // Créer une map des enregistrements pour accès rapide
      const recordingMap: Record<number, boolean> = {};
      recordingsResult.forEach(({ callId, hasRecording }) => {
        recordingMap[callId] = hasRecording;
      });

      // Enrichir les appels avec les données commerciales et d'enregistrement
      const enriched: EnrichedCall[] = calls.map(call => {
        const commercial = commercialMap[call.commercial_id];
        const commercialName = commercial
          ? `${commercial.first_name} ${commercial.last_name}`
          : `Commercial #${call.commercial_id}`;

        const hasRecording = recordingMap[call.id] || false;
        const token = localStorage.getItem('access_token');
        const audioUrl = hasRecording && token
          ? `${API_CONFIG.BASE_URL}/api/v1/recordings/by-call/${call.id}/play?token=${token}`
          : null;

        return {
          id: call.id,
          phoneNumber: call.phone_number,
          callDate: new Date(call.call_date),
          duration: call.duration,
          status: call.status.toUpperCase(),
          decision: call.decision ? call.decision.toUpperCase() : null,
          notes: call.notes,
          commercialId: call.commercial_id,
          commercialName,
          hasRecording,
          audioUrl,
          callType: call.call_type,
        };
      });

      setEnrichedCalls(enriched);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setEnrichedCalls([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCalls, fetchCommercials, checkRecording]);

  // Fetch au montage et quand les dépendances changent
  useEffect(() => {
    fetchAndEnrich();
  }, [fetchAndEnrich]);

  // Fonction pour actualiser les données
  const refetch = useCallback(async () => {
    await fetchAndEnrich();
  }, [fetchAndEnrich]);

  return {
    enrichedCalls,
    isLoading,
    error,
    refetch,
  };
};

export default useCallsWithDetails;
