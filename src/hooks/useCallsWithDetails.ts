import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

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
}

interface UseCallsWithDetailsReturn {
  enrichedCalls: EnrichedCall[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type { EnrichedCall };

export const useCallsWithDetails = (): UseCallsWithDetailsReturn => {
  const { isAuthenticated } = useAuth();
  const [enrichedCalls, setEnrichedCalls] = useState<EnrichedCall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction principale pour récupérer et enrichir les données
  const fetchAndEnrich = useCallback(async () => {
    // CRITICAL: Do not fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      setEnrichedCalls([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer appels via Axios (auth handle par interceptor)
      const callsResponse = await api.get<any>('/api/v1/calls?skip=0&limit=100');
      const calls = Array.isArray(callsResponse.data) ? callsResponse.data : callsResponse.data.data || [];

      // Vérifier les enregistrements en parallèle pour tous les appels
      const recordingChecks = calls.map(call => 
        api.get<any>(`/api/v1/recordings/by-call/${call.id}`)
          .then(() => ({ callId: call.id, hasRecording: true }))
          .catch(err => {
            // 404 = enregistrement n'existe pas, c'est normal
            // Autres erreurs = problème réel
            if (err.response?.status === 404) {
              return { callId: call.id, hasRecording: false };
            }
            console.error(`Erreur lors de la vérification de l'enregistrement ${call.id}:`, err);
            return { callId: call.id, hasRecording: false };
          })
      );
      const recordingsResult = await Promise.all(recordingChecks);
      
      // Créer une map des enregistrements pour accès rapide
      const recordingMap: Record<number, boolean> = {};
      recordingsResult.forEach(({ callId, hasRecording }) => {
        recordingMap[callId] = hasRecording;
      });

      // Enrichir les appels avec les données commerciales et d'enregistrement
      const enriched: EnrichedCall[] = calls.map(call => {
        // Le backend retourne les données du commercial dans chaque appel
        const commercial = call.commercial;
        const commercialName = commercial
          ? `${commercial.first_name} ${commercial.last_name}`
          : `Commercial #${call.commercial_id}`;

        const hasRecording = recordingMap[call.id] || false;

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
  }, [isAuthenticated]);

  // Fetch only when authenticated, not on every render
  useEffect(() => {
    console.log('[useCallsWithDetails] isAuthenticated changed:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('[useCallsWithDetails] Not authenticated, skipping fetch');
      return;
    }
    console.log('[useCallsWithDetails] Authenticated, fetching data...');
    fetchAndEnrich();
  }, [isAuthenticated, fetchAndEnrich]);

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
