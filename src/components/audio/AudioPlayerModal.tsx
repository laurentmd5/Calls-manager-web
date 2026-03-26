import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, Loader2 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId: number;
  commercialName?: string;
  phoneNumber?: string;
  callDate?: Date;
  decision?: string | null;
  notes?: string | null;
}

export const AudioPlayerModal = ({
  isOpen,
  onClose,
  callId,
  commercialName,
  phoneNumber,
  callDate,
  decision,
  notes,
}: AudioPlayerModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Load audio blob when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadAudio = async () => {
      setIsLoadingAudio(true);
      setAudioError(null);

      try {
        // Fetch audio blob via Axios (with Authorization header)
        const response = await api.get<Blob>(
          `/api/v1/recordings/by-call/${callId}/play`,
          { responseType: 'blob' }
        );

        // Create blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        const blobUrl = URL.createObjectURL(response.data);
        blobUrlRef.current = blobUrl;

        // Set audio src
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = blobUrl;
        audioRef.current.load();
      } catch (err) {
        console.error(`Erreur lors du chargement de l'audio pour l'appel ${callId}:`, err);
        setAudioError('Impossible de charger l\'enregistrement audio');
        setIsPlaying(false);
      } finally {
        setIsLoadingAudio(false);
      }
    };

    loadAudio();
  }, [isOpen, callId]);

  // Setup audio element listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      console.error('Erreur de lecture audio');
      setAudioError('Erreur lors de la lecture du fichier audio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Cleanup blob URL on unmount or modal close
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Erreur lors de la lecture audio:', error);
        setAudioError('Impossible de lire l\'enregistrement');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
  };

  const formatTime = (time: number) => {
    return formatDuration(Math.floor(time));
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle>Écoute & Coaching</DialogTitle>
          <DialogDescription className="sr-only">
            Lecteur audio avec contexte d'appel et notes du commercial
          </DialogDescription>
          <div className="flex justify-between items-center">
            <span />
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 md:space-y-4">
          {/* Call Context Card - TOP SECTION */}
          {(commercialName || callDate || decision) && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl p-3 md:p-4 space-y-2">
              <div>
                <p className="font-semibold text-xs md:text-sm">
                  Appel de <span className="font-bold">{commercialName}</span>
                </p>
              </div>
              <div className="text-xs md:text-sm text-white/80 space-y-1">
                {phoneNumber && <p>{phoneNumber}</p>}
                {callDate && (
                  <p>
                    {callDate.toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              {decision && (
                <div className="pt-2">
                  <Badge
                    className={cn(
                      'inline-block bg-white/20 text-white border border-white/30 text-xs',
                      {
                        'bg-emerald-500/30 text-white border border-emerald-400': decision === 'INTERESTED',
                        'bg-indigo-500/30 text-white border border-indigo-400': decision === 'CALL_BACK',
                        'bg-slate-500/30 text-white border border-slate-400': decision === 'NOT_INTERESTED',
                        'bg-amber-500/30 text-white border border-amber-400': decision === 'NO_ANSWER',
                        'bg-red-500/30 text-white border border-red-400': decision === 'WRONG_NUMBER',
                      }
                    )}
                  >
                    {decision === 'INTERESTED' && 'Intéressé'}
                    {decision === 'CALL_BACK' && 'À rappeler'}
                    {decision === 'NOT_INTERESTED' && 'Pas intéressé'}
                    {decision === 'NO_ANSWER' && 'Pas de réponse'}
                    {decision === 'WRONG_NUMBER' && 'Mauvais numéro'}
                    {!['INTERESTED', 'CALL_BACK', 'NOT_INTERESTED', 'NO_ANSWER', 'WRONG_NUMBER'].includes(decision) && decision}
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* MIDDLE SECTION - Audio player */}
          <div className="bg-slate-50 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
            {isLoadingAudio && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-sm text-slate-600">Chargement de l'enregistrement...</span>
              </div>
            )}
            
            {audioError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {audioError}
              </div>
            )}
            
            {!isLoadingAudio && !audioError && (
              <>
                <div className="flex items-center justify-center space-x-2 md:space-x-4">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" onClick={skipBackward}>
                    <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <Play className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" onClick={skipForward}>
                    <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1 md:space-x-2">
                  <span className="text-xs text-slate-500 w-8 md:w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    max={duration || 0}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-500 w-8 md:w-10">
                    {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" onClick={toggleMute}>
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleVolumeChange(value)}
                    className="w-24"
                  />
                </div>
              </>
            )}
          </div>

          {/* BOTTOM SECTION - Notes panel */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200 space-y-2">
            <p className="text-xs md:text-sm font-semibold text-slate-800">Notes du commercial</p>
            {notes && notes.trim() ? (
              <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 text-xs md:text-sm max-h-[120px] overflow-y-auto whitespace-pre-wrap text-slate-700 leading-relaxed">
                {notes}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 text-xs md:text-sm text-slate-400 italic">
                Ce commercial n'a pas laissé de notes
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};