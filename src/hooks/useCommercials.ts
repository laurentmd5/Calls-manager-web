import { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { User } from '@/types/api';

export const useCommercials = () => {
  const [commercials, setCommercials] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommercials = async () => {
    try {
      setLoading(true);
      const response = await userService.getCommercials();
      if (response.data?.success && Array.isArray(response.data.data)) {
        const commercialMap = response.data.data.reduce((acc, commercial) => {
          acc[commercial.id] = commercial;
          return acc;
        }, {} as Record<number, User>);
        setCommercials(commercialMap);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commerciaux:', err);
      setError('Impossible de charger les informations des commerciaux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommercials();
  }, []);

  const getCommercialName = (id: number): string => {
    const commercial = commercials[id];
    return commercial 
      ? `${commercial.first_name} ${commercial.last_name}`
      : `Commercial #${id}`;
  };

  return { commercials, loading, error, getCommercialName, refresh: fetchCommercials };
};

export default useCommercials;
