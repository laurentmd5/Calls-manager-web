import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommercialsTable } from '@/components/commercials/CommercialsTable';
import { User } from '@/types';
import { userService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { mapApiUsersToAppUsers } from '@/utils/userUtils';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX } from 'lucide-react';

const Commercials = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(false);

  const fetchUsers = async (showInactiveUsers: boolean) => {
    try {
      setIsLoading(true);
      console.log(`Récupération des utilisateurs ${showInactiveUsers ? 'inactifs' : 'actifs'}...`);
      
      const response = showInactiveUsers 
        ? await userService.getInactiveUsers() 
        : await userService.getCommercials();
      
      console.log('Réponse de l\'API:', response.data);
      
      // La réponse est directement le tableau des utilisateurs
      const usersData = Array.isArray(response.data) ? response.data : [];
      
      // Convertir les utilisateurs de l'API vers le format de l'application
      const appUsers = mapApiUsersToAppUsers(usersData);
      console.log('Utilisateurs convertis:', appUsers);
      
      setUsers(appUsers);
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs:`, error);
      toast({
        title: 'Erreur',
        description: `Impossible de charger la liste des utilisateurs ${showInactiveUsers ? 'inactifs' : 'actifs'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(showInactive);
  }, [showInactive]);

  const handleToggleInactive = () => {
    setShowInactive(!showInactive);
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    // Recharger la liste après une mise à jour pour s'assurer que les changements sont reflétés
    fetchUsers(showInactive);
  };

  return (
    <DashboardLayout
      title={showInactive ? "Utilisateurs Inactifs" : "Gestion des Commerciaux"}
      subtitle={showInactive ? "Gérez les comptes utilisateurs inactifs" : "Gérez votre équipe commerciale"}
    >
      <div className="mb-4 flex justify-between items-center">
        <Button 
          variant={showInactive ? "default" : "outline"}
          onClick={handleToggleInactive}
          className="flex items-center gap-2"
        >
          {showInactive ? (
            <>
              <UserCheck className="h-4 w-4" />
              Voir les commerciaux actifs
            </>
          ) : (
            <>
              <UserX className="h-4 w-4" />
              Voir les utilisateurs inactifs
            </>
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CommercialsTable 
          users={users} 
          onUpdate={handleUpdateUsers} 
          showInactive={showInactive}
        />
      )}
    </DashboardLayout>
  );
};

export default Commercials;
