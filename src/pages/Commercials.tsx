import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommercialsTable } from '@/components/commercials/CommercialsTable';
import { User } from '@/types';
import { userService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { mapApiUsersToAppUsers } from '@/utils/userUtils';

const Commercials = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommercials = async () => {
      try {
        setIsLoading(true);
        console.log('Récupération des commerciaux...');
        const response = await userService.getCommercials();
        console.log('Réponse de l\'API (commerciaux):', response.data);
        
        // La réponse est directement le tableau des utilisateurs
        const usersData = Array.isArray(response.data) ? response.data : [];
        
        // Convertir les utilisateurs de l'API vers le format de l'application
        const appUsers = mapApiUsersToAppUsers(usersData);
        console.log('Utilisateurs convertis:', appUsers);
        
        setUsers(appUsers);
      } catch (error) {
        console.error('Erreur lors de la récupération des commerciaux:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des commerciaux',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommercials();
  }, []);

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return (
    <DashboardLayout
      title="Gestion des Commerciaux"
      subtitle="Gérez votre équipe commerciale"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CommercialsTable users={users} onUpdate={handleUpdateUsers} />
      )}
    </DashboardLayout>
  );
};

export default Commercials;
