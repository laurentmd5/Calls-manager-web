import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Download,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CallStatus } from '@/types';
import { Call } from '@/types/api';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import useCalls from '@/hooks/useCalls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const statusConfig: Record<CallStatus, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  answered: { label: 'Répondu', variant: 'default' },
  missed: { label: 'Manqué', variant: 'destructive' },
  rejected: { label: 'Rejeté', variant: 'secondary' },
  no_answer: { label: 'Sans réponse', variant: 'outline' },
};

type DecisionType = 'interested' | 'not_interested' | 'call_back';
type DecisionWithUndefined = DecisionType | 'undefined';

const decisionConfig = {
  interested: { label: 'Intéressé', variant: 'default' as const },
  not_interested: { label: 'Non intéressé', variant: 'destructive' as const },
  call_back: { label: 'Rappeler', variant: 'secondary' as const },
  undefined: { label: 'Non défini', variant: 'outline' as const },
};

export const CallsTable = () => {
  const { toast } = useToast();
  const { calls, loading, error, fetchCalls, updateCall } = useCalls();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [updatingCalls, setUpdatingCalls] = useState<Record<number, boolean>>({});
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCommercialName = (id: number) => {
    // Pour l'instant, on retourne juste l'ID du commercial
    // Vous pourrez améliorer cela en récupérant les informations du commercial depuis l'API
    return `Commercial #${id}`;
  };

  const handleDecisionChange = async (callId: number, decision: DecisionType | null | 'undefined') => {
    // Convertir 'undefined' en null pour l'API
    const decisionForApi = decision === 'undefined' ? null : decision;
    try {
      setUpdatingCalls(prev => ({ ...prev, [callId]: true }));
      await updateCall(callId, { decision: decisionForApi as DecisionType | null });
      
      toast({
        title: 'Succès',
        description: 'La décision a été mise à jour avec succès.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating call decision:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de la décision.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingCalls(prev => ({ ...prev, [callId]: false }));
    }
  };

  // Afficher les données brutes pour le débogage
  useEffect(() => {
    console.log('Appels chargés:', calls);
    console.log('Filtres actuels:', { search, statusFilter });
  }, [calls, search, statusFilter]);

  const filteredCalls = calls.filter(call => {
    try {
      // Vérifier si call.phone_number existe avant d'appeler toLowerCase()
      const phoneNumber = call.phone_number || '';
      const searchTerm = search.toLowerCase();
      const matchesSearch = phoneNumber.toString().toLowerCase().includes(searchTerm);
      
      // Normaliser le statut pour la comparaison
      const callStatus = call.status?.toLowerCase() || '';
      const matchesStatus = statusFilter === 'all' || callStatus === statusFilter.toLowerCase();
      
      // Log de débogage détaillé
      const debugInfo = {
        callId: call.id,
        phoneNumber,
        callStatus,
        statusFilter,
        matchesSearch,
        matchesStatus,
        searchTerm
      };
      
      console.log('Filtrage - Détails:', debugInfo);
      
      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error('Erreur lors du filtrage des appels:', error, call);
      return false;
    }
  });
  
  // Afficher un message si aucun appel ne correspond aux filtres
  useEffect(() => {
    if (calls.length > 0 && filteredCalls.length === 0 && !loading) {
      console.log('Aucun appel ne correspond aux critères de recherche.');
    }
  }, [calls, filteredCalls, loading]);

  const togglePlay = async (call: Call) => {
    try {
      if (playingId === call.id) {
        // Arrêter la lecture
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          setAudio(null);
          setAudioSrc(null);
        }
        setPlayingId(null);
        return;
      }

      // Arrêter toute lecture en cours
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Si l'appel a un enregistrement, le lire
      if (call.has_recording) {
        // Construire l'URL de l'API pour récupérer l'enregistrement
        const audioUrl = `http://127.0.0.1:8000/api/v1/recordings/${call.id}?token=${localStorage.getItem('access_token')}`;
        
        // Créer un nouvel élément audio
        const newAudio = new Audio(audioUrl);
        newAudio.preload = 'metadata';
        
        newAudio.onplay = () => {
          setPlayingId(call.id);
        };
        
        newAudio.onended = () => {
          setPlayingId(null);
          setAudio(null);
          setAudioSrc(null);
        };
        
        newAudio.onerror = () => {
          console.error('Erreur lors de la lecture de l\'enregistrement');
          toast({
            title: 'Erreur',
            description: 'Impossible de lire l\'enregistrement audio',
            variant: 'destructive',
          });
          setPlayingId(null);
          setAudio(null);
          setAudioSrc(null);
        };
        
        setAudio(newAudio);
        setAudioSrc(audioUrl);
        await newAudio.play();
      } else {
        toast({
          title: 'Information',
          description: 'Aucun enregistrement disponible pour cet appel',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la lecture de l\'enregistrement',
        variant: 'destructive',
      });
      setPlayingId(null);
      setAudio(null);
      setAudioSrc(null);
    }
  };

  const handleDownload = async (call: Call) => {
    if (!call.has_recording) {
      toast({
        title: 'Information',
        description: 'Aucun enregistrement disponible pour cet appel',
        variant: 'default',
      });
      return;
    }
    
    try {
      // Télécharger l'enregistrement
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/recordings/${call.id}/download?token=${localStorage.getItem('access_token')}`,
        {
          headers: {
            'Accept': 'audio/*',
          },
        }
      );
      
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enregistrement-${call.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: 'Téléchargement réussi',
        description: 'L\'enregistrement a été téléchargé avec succès',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du téléchargement de l\'enregistrement',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="answered">Répondus</SelectItem>
            <SelectItem value="missed">Manqués</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
            <SelectItem value="no_answer">Sans réponse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Type</TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Commercial</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Décision</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !calls.length ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Chargement des appels...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Aucun appel trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => (
                <TableRow key={call.id} className="hover:bg-muted/30">
                  <TableCell>
                    <PhoneOutgoing className="h-4 w-4 text-accent-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{call.phone_number}</TableCell>
                  <TableCell>{getCommercialName(call.commercial_id)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(call.call_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {formatDuration(call.duration)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[call.status]?.variant || 'outline'}>
                      {statusConfig[call.status]?.label || call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {call.decision ? (
                      <Badge 
                        variant={decisionConfig[call.decision as DecisionType]?.variant || 'outline'}
                        className={cn({
                          'bg-green-500 hover:bg-green-600': call.decision === 'interested',
                          'bg-red-500 hover:bg-red-600': call.decision === 'not_interested',
                          'bg-blue-500 hover:bg-blue-600': call.decision === 'call_back',
                        })}
                      >
                        {decisionConfig[call.decision as DecisionType]?.label || call.decision}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Non défini</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {call.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePlay(call)}
                        disabled={!call.has_recording}
                        aria-label={playingId === call.id ? 'Arrêter la lecture' : 'Lire l\'enregistrement'}
                      >
                        {playingId === call.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDownload(call)}
                        disabled={!call.has_recording}
                        aria-label="Télécharger l'enregistrement"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredCalls.length} appel(s) trouvé(s) sur {calls.length} au total
      </p>
    </div>
  );
};
