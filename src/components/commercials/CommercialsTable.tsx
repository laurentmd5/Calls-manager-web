import { useState } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User as UserIcon,
  Edit, 
  Trash2, 
  MoreVertical, 
  Check, 
  X, 
  Plus,
  MoreHorizontal,
  UserPlus,
  UserX,
  UserCheck,
  Eye,
  Star
} from 'lucide-react';
import { User } from '@/types';
import { RegisterRequest, UpdateUserRequest } from '@/types/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/services/api';
import { mapApiUserToAppUser } from '@/utils/userUtils';

interface NewUser extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalCalls' | 'answeredCalls' | 'totalDuration'> {
  password: string;
  confirmPassword: string;
}

interface CommercialsTableProps {
  users: User[];
  onUpdate: (users: User[]) => void;
}

export const CommercialsTable = ({ users, onUpdate }: CommercialsTableProps) => {
  const navigate = useNavigate();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'commercial',
    isActive: true,
    password: '',
    confirmPassword: '',
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = !user.isActive;
      
      // Mise à jour optimiste de l'interface
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, isActive: newStatus } : u
      );
      onUpdate(updatedUsers);
      
      // Mise à jour côté serveur
      await userService.update(userId.toString(), {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber || '',
        role: user.role.toLowerCase() as 'commercial' | 'admin' | 'manager',
        is_active: newStatus
      });
      
      toast({
        title: 'Statut mis à jour',
        description: `Le commercial est maintenant ${newStatus ? 'actif' : 'inactif'}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      
      // Annulation de la mise à jour optimiste en cas d'erreur
      onUpdate([...users]);
      
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du statut',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async () => {
    // Validation des champs obligatoires
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    // Vérification de la correspondance des mots de passe
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Préparation des données pour l'API selon le type RegisterRequest
      const userData: RegisterRequest = {
        email: newUser.email,
        first_name: newUser.firstName,    // snake_case pour correspondre au backend
        last_name: newUser.lastName,      // snake_case pour correspondre au backend
        phone_number: newUser.phoneNumber || '',  // snake_case pour correspondre au backend
        role: 'commercial' as const,       // Type littéral 'commercial'
        password: newUser.password,
      };

      // Appel à l'API pour créer l'utilisateur
      const response = await userService.create(userData);
      
      // Vérification de la réponse de l'API
      if (response && response.data) {
        // Si la réponse contient directement l'utilisateur créé
        const apiUser = response.data.data || response.data;
        
        if (apiUser) {
          // Vérification du type de la réponse
          if ('id' in apiUser && 'email' in apiUser) {
            const createdUser = mapApiUserToAppUser(apiUser);
            onUpdate([...users, createdUser]);
            
            // Réinitialisation du formulaire
            setNewUser({
              email: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              password: '',
              confirmPassword: '',
              role: 'commercial',
              isActive: true,
            });
            
            // Fermeture de la boîte de dialogue
            setIsAddDialogOpen(false);
            
            // Message de succès
            toast({
              title: 'Commercial ajouté',
              description: `${createdUser.firstName} ${createdUser.lastName} a été ajouté avec succès.`,
              variant: 'default',
            });
          } else {
            // Si la réponse ne contient pas les champs attendus, on recharge la liste
            onUpdate([...users]);
            throw new Error('Réponse de l\'API incomplète, veuillez recharger la page');
          }
        } else {
          throw new Error('Réponse de l\'API invalide: données utilisateur manquantes');
        }
      } else {
        throw new Error('Réponse de l\'API invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commercial:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du commercial',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = async () => {
    if (!editUser) return;

    try {
      // Préparation des données pour l'API
      const userData: UpdateUserRequest = {
        email: editUser.email,
        first_name: editUser.firstName,
        last_name: editUser.lastName,
        phone_number: editUser.phoneNumber || '',
        role: 'commercial',
        is_active: editUser.isActive || true,
      };

      // Appel à l'API pour mettre à jour l'utilisateur
      console.log('Envoi de la requête de mise à jour avec les données:', userData);
      const updateResponse = await userService.update(editUser.id.toString(), userData);
      console.log('Réponse de mise à jour reçue:', updateResponse);
      
      // Rechargement de la liste complète après la modification
      console.log('Récupération de la liste mise à jour des commerciaux...');
      const response = await userService.getCommercials();
      console.log('Réponse de getCommercials:', response);
      
      if (response && response.data) {
        // Extraction des données de la réponse
        const responseData = response.data;
        
        // La réponse peut être soit directement le tableau, soit dans une propriété data
        const usersData = (responseData as any).data || responseData;
        console.log('Données des commerciaux extraites:', usersData);
        
        // Vérification que les données sont bien un tableau
        const usersList = Array.isArray(usersData) ? usersData : [usersData];
        console.log('Liste des commerciaux après traitement:', usersList);
        
        // Mappage des utilisateurs
        const mappedUsers = usersList.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name || user.firstName,
          lastName: user.last_name || user.lastName,
          phoneNumber: user.phone_number || user.phoneNumber,
          role: user.role,
          isActive: user.is_active || user.isActive,
          createdAt: user.created_at || user.createdAt,
          updatedAt: user.updated_at || user.updatedAt,
          rating: user.rating || 0,
          totalCalls: user.total_calls || user.totalCalls || 0,
          answeredCalls: user.answered_calls || user.answeredCalls || 0,
          totalDuration: user.total_duration || user.totalDuration || 0,
        }));
        
        onUpdate(mappedUsers);
        
        setEditUser(null);
        
        toast({
          title: 'Succès',
          description: 'Les informations du commercial ont été mises à jour',
          variant: 'default',
        });
      } else {
        throw new Error('Réponse de l\'API invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commercial:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du commercial',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un commercial
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Commercial</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Appels</TableHead>
              <TableHead>Taux réponse</TableHead>
              <TableHead>Durée totale</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const responseRate = user.totalCalls
                ? Math.round((user.answeredCalls || 0) / user.totalCalls * 100)
                : 0;

              return (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.phoneNumber || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.totalCalls}</span>
                    <span className="text-muted-foreground text-sm ml-1">
                      ({user.answeredCalls} répondus)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={responseRate >= 80 ? 'default' : responseRate >= 60 ? 'secondary' : 'destructive'}>
                      {responseRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDuration(user.totalDuration || 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{user.rating?.toFixed(1) || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/performance/${user.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commercial</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouveau commercial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                placeholder="+221XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le commercial</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={editUser.phoneNumber || ''}
                  onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Annuler
            </Button>
            <Button onClick={handleEditUser}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
