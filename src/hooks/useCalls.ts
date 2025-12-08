import { useState, useEffect, useCallback } from 'react';
import { callService, recordingService } from '@/services/api';
import { Call, Recording } from '@/types/api';

export const useCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const checkRecording = async (callId: number): Promise<boolean> => {
    try {
      const response = await recordingService.getById(callId.toString());
      return response.data && response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'enregistrement pour l'appel ${callId}:`, error);
      return false;
    }
  };

  // Vérifie les enregistrements en arrière-plan
  const checkRecordingsInBackground = async (callsToCheck: Call[]) => {
    try {
      console.log('Vérification des enregistrements en arrière-plan...');
      
      // Vérifier chaque appel par lots
      const batchSize = 3;
      for (let i = 0; i < callsToCheck.length; i += batchSize) {
        const batch = callsToCheck.slice(i, i + batchSize);
        const batchPromises = batch.map(async (call) => {
          const hasRecording = await checkRecording(call.id);
          return { callId: call.id, hasRecording };
        });
        
        const results = await Promise.all(batchPromises);
        
        // Mettre à jour l'état avec les résultats
        setCalls(prevCalls => 
          prevCalls.map(call => {
            const result = results.find(r => r.callId === call.id);
            return result ? { ...call, has_recording: result.hasRecording } : call;
          })
        );
        
        // Petit délai entre les lots
        if (i + batchSize < callsToCheck.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des enregistrements:', error);
    }
  };

  const fetchCalls = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      console.log('Début du chargement des appels...');
      setLoading(true);
      setError(null);
      
      const skip = (page - 1) * limit;
      console.log(`Récupération des appels - skip: ${skip}, limit: ${limit}`);
      
      const callsResponse = await callService.getAll({ skip, limit });
      console.log('Réponse de l\'API (appels):', callsResponse);
      
      // Vérifier si la réponse contient des données valides
      if (callsResponse && callsResponse.data) {
        // Si l'API renvoie directement un tableau
        const callsData = Array.isArray(callsResponse.data) 
          ? callsResponse.data 
          : (callsResponse.data.data || []);
        
        console.log(`Reçu ${callsData.length} appels de l'API`);
        
        // Pour le moment, on ne vérifie pas les enregistrements pour accélérer le chargement
        const callsWithRecordings = callsData.map((call: any) => ({
          ...call,
          call_type: call.call_type || 'outgoing',
          has_recording: false // On mettra à jour plus tard si nécessaire
        }));
        
        console.log('Appels formatés:', callsWithRecordings);
        
        setCalls(callsWithRecordings);
        setPagination(prev => ({
          ...prev,
          page,
          limit,
          total: callsWithRecordings.length, // On utilise la longueur du tableau comme total par défaut
        }));
        
        // Vérifier les enregistrements en arrière-plan
        checkRecordingsInBackground(callsWithRecordings);
      } else {
        console.error('Format de réponse inattendu:', callsResponse);
        setError('Format de réponse inattendu de l\'API');
      }
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError('Une erreur est survenue lors du chargement des appels');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCalls = useCallback(() => {
    fetchCalls(pagination.page, pagination.limit);
  }, [fetchCalls, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCalls(1, 10);
  }, [fetchCalls]);

  const updateCall = async (id: number, updates: Partial<Call>) => {
    try {
      console.log(`Mise à jour de l'appel ${id} avec:`, updates);
      const response = await callService.update(id.toString(), updates);
      
      if (response.data && response.data.success) {
        console.log('Mise à jour réussie:', response.data);
        setCalls(prevCalls =>
          prevCalls.map(call =>
            call.id === id ? { ...call, ...updates } : call
          )
        );
      }
      return response.data;
    } catch (err) {
      console.error('Error updating call:', err);
      throw err;
    }
  };

  return {
    calls,
    loading,
    error,
    pagination,
    fetchCalls,
    refreshCalls,
    updateCall,
  };
};

export default useCalls;
