import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User } from '@/types';
import { userService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { mapApiUsersToAppUsers } from '@/utils/userUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserCheck, UserX, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const Commercials = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

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
    // Mettre à jour l'état local avec les utilisateurs mis à jour
    setUsers(prevUsers => {
      // Créer une map des utilisateurs mis à jour pour un accès rapide
      const updatedUsersMap = new Map(updatedUsers.map(user => [user.id, user]));
      
      // Fusionner les utilisateurs existants avec les mises à jour
      return prevUsers.map(user => updatedUsersMap.get(user.id) || user);
    });
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
    });
    setCreateError(null);
    setShowPassword(false);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateCommercial = async () => {
    setCreateError(null);

    // Validation des champs obligatoires
    if (!formData.firstName.trim()) {
      setCreateError('Le prénom est obligatoire');
      return;
    }
    if (!formData.lastName.trim()) {
      setCreateError('Le nom est obligatoire');
      return;
    }
    if (!formData.email.trim()) {
      setCreateError('L\'email est obligatoire');
      return;
    }
    if (!validateEmail(formData.email)) {
      setCreateError('Veuillez entrer une adresse email valide');
      return;
    }
    if (!formData.password) {
      setCreateError('Le mot de passe est obligatoire');
      return;
    }
    if (formData.password.length < 6) {
      setCreateError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);

    try {
      // Récupérer le token automatiquement depuis localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCreateError('Erreur d\'authentification: token manquant');
        setIsSubmitting(false);
        return;
      }

      // Créer la requête POST avec les données du formulaire
      const response = await fetch('http://127.0.0.1:8000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber || null,
          role: 'COMMERCIAL',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Une erreur est survenue lors de la création du commercial';
        setCreateError(errorMessage);
        return;
      }

      const createdUser = await response.json();
      console.log('Commercial créé:', createdUser);

      // Ajouter l'utilisateur créé à la liste
      const newUser: User = {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.first_name,
        lastName: createdUser.last_name,
        phoneNumber: createdUser.phone_number,
        role: 'commercial',
        isActive: createdUser.is_active || true,
        createdAt: createdUser.created_at || new Date().toISOString(),
      };

      setUsers(prevUsers => [newUser, ...prevUsers]);

      // Fermer le modal et afficher un message de succès
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: 'Commercial créé',
        description: `${formData.firstName} ${formData.lastName} a été ajouté avec succès.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la création du commercial:', error);
      setCreateError('Une erreur est survenue lors de la création du commercial. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  return (
    <DashboardLayout
      title={showInactive ? "Utilisateurs Inactifs" : "Gestion des Commerciaux"}
      subtitle={showInactive ? "Gérez les comptes utilisateurs inactifs" : "Gérez votre équipe commerciale"}
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <Button 
          variant={showInactive ? "default" : "outline"}
          onClick={handleToggleInactive}
          className="flex items-center gap-2 w-full sm:w-auto"
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

        {!showInactive && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nouveau commercial
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {showInactive 
                      ? 'Aucun utilisateur inactif trouvé' 
                      : 'Aucun commercial trouvé'}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{user.firstName}</TableCell>
                    <TableCell className="font-medium">{user.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phoneNumber || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        Actif
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Commercial Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau commercial</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte commercial. Tous les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {createError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">
                {createError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                placeholder="+221XXXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe * (min. 6 caractères)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateCommercial}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Commercials;
