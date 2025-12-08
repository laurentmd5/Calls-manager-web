import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/utils';

interface AudioDurationProps {
  audioUrl: string;
  fallbackDuration?: number;
}

export const AudioDuration = ({ audioUrl, fallbackDuration }: AudioDurationProps) => {
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false);
      return;
    }

    const audio = new Audio();
    let isMounted = true;

    const handleLoadedMetadata = () => {
      if (isMounted) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };

    const handleError = () => {
      if (isMounted) {
        setError('Erreur de chargement');
        setIsLoading(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    
    // Ajouter un token d'authentification si nécessaire
    const urlWithToken = `${audioUrl}${audioUrl.includes('?') ? '&' : '?'}token=${localStorage.getItem('access_token')}`;
    audio.src = urlWithToken;
    audio.load();

    return () => {
      isMounted = false;
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [audioUrl]);

  if (isLoading) {
    return <span className="text-muted-foreground text-sm">Chargement...</span>;
  }

  if (error || !duration) {
    return fallbackDuration !== undefined ? (
      <span>{formatDuration(fallbackDuration)}</span>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  }

  return <span>{formatDuration(duration)}</span>;
};
