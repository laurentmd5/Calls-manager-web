import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/performance/RatingStars';
import {
  Phone,
  PhoneCall,
  Clock,
  TrendingUp,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import performanceService, { PerformanceResponse } from '@/services/performanceService';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole, CommercialPerformance } from '../types/user';

const Performance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commercials, setCommercials] = useState<CommercialPerformance[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceResponse | null>(null);

  // Charger la liste des commerciaux ou les données d'un commercial spécifique
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!id || id === 'undefined') {
          // Charger la liste des commerciaux
          const data = await performanceService.getAllCommercialsPerformance();
          setCommercials(data);
        } else {
          // Vérifier que l'ID est valide avant de faire l'appel
          if (id && id !== 'undefined') {
            const data = await performanceService.getCommercialPerformance(id);
            setPerformanceData(data);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de performance:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données de performance.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Si pas d'ID, afficher la liste des commerciaux
  if (!id) {
    return (
      <DashboardLayout
        title="Performances"
        subtitle="Évaluation détaillée des commerciaux"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commercials.map((commercial) => {
              const responseRate = commercial.stats.total_calls > 0
                ? performanceService.calculateResponseRate(
                    commercial.stats.answered_calls,
                    commercial.stats.total_calls
                  )
                : 0;

              return (
                <Card
                  key={commercial.id}
                  className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1"
                  onClick={() => navigate(`/performance/${commercial.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                          {commercial.first_name?.[0]}{commercial.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-foreground">
                          {commercial.first_name} {commercial.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{commercial.email}</p>
                        <div className="mt-2">
                          <RatingStars 
                            rating={commercial.stats.rating || 0} 
                            size="sm" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">
                          {commercial.stats.total_calls}
                        </p>
                        <p className="text-xs text-muted-foreground">appels</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">
                          {responseRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Taux réponse</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">
                          {commercial.stats.rating?.toFixed(1) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">Note</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Vue détaillée d'un commercial
  if (loading) {
    return (
      <DashboardLayout title="Chargement..." subtitle="Récupération des données en cours">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des données du commercial...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!performanceData) {
    return (
      <DashboardLayout title="Erreur" subtitle="Impossible de charger les données du commercial">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            Impossible de charger les données du commercial demandé.
          </p>
          <Button variant="outline" onClick={() => navigate('/performance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, weekly_stats, monthly_stats } = performanceData;
  const responseRate = stats.total_calls > 0 
    ? performanceService.calculateResponseRate(stats.answered_calls, stats.total_calls) 
    : 0;

  // Préparer les données pour les graphiques
  const weeklyData = weekly_stats.map(week => ({
    day: week.week_start.split('-').reverse().join('/'),
    calls: week.calls,
    answered: week.answered,
  }));

  const monthlyData = monthly_stats.map(month => ({
    month: month.month,
    calls: month.calls,
  }));

  // Récupérer les informations de l'utilisateur actuel ou du commercial sélectionné
  const user = currentUser?.id === parseInt(id as string) ? currentUser : commercials.find(c => c.id === parseInt(id as string));
  
  if (!user) {
    return (
      <DashboardLayout title="Commercial non trouvé">
        <Button variant="ghost" onClick={() => navigate('/performance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </DashboardLayout>
    );
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une note.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Ici, vous devrez ajouter la logique pour enregistrer la note dans votre backend
      // Par exemple :
      // await api.post(`/api/v1/ratings`, {
      //   commercial_id: id,
      //   rating,
      //   comment,
      //   rater_id: currentUser?.id
      // });
      
      toast({
        title: 'Évaluation enregistrée',
        description: `Note de ${rating}/5 attribuée à ${user.firstName} ${user.lastName}.`,
      });
      
      // Recharger les données pour afficher la nouvelle note
      const data = await performanceService.getCommercialPerformance(id!);
      setPerformanceData(data);
      
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'évaluation:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement de l\'évaluation.',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0h 00m';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  return (
    <DashboardLayout
      title={`${user.first_name} ${user.last_name}`}
      subtitle="Fiche de performance détaillée"
    >
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/performance')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        
        {currentUser?.role === UserRole.ADMIN && (
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {new Date().toLocaleString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
{user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">
{user.first_name} {user.last_name}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge variant={user?.is_active ? 'default' : 'secondary'}>
                  {user?.is_active ? 'Actif' : 'Inactif'}
                </Badge>
                {user?.role === UserRole.ADMIN && (
                  <Badge variant="outline" className="ml-2">
                    Administrateur
                  </Badge>
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <RatingStars rating={stats.rating || 0} size="lg" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Note actuelle: {stats.rating ? stats.rating.toFixed(1) : 'N/A'}/5
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-primary/10">
            <CardContent className="pt-6 text-center">
              <Phone className="h-8 w-8 mx-auto text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.total_calls}</p>
              <p className="text-sm text-muted-foreground">Total appels</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-success/10">
            <CardContent className="pt-6 text-center">
              <PhoneCall className="h-8 w-8 mx-auto text-success" />
              <p className="mt-2 text-2xl font-bold">{stats.answered_calls}</p>
              <p className="text-sm text-muted-foreground">Répondus</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-accent">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-accent-foreground" />
              <p className="mt-2 text-2xl font-bold">{responseRate}%</p>
              <p className="text-sm text-muted-foreground">Taux réponse</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold">{formatDuration(stats.total_duration)}</p>
              <p className="text-sm text-muted-foreground">Durée totale</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Activité hebdomadaire</CardTitle>
              <span className="text-sm text-muted-foreground">
                {weeklyData.length > 0 ? 
                  `${weeklyData[0].day} - ${weeklyData[weeklyData.length - 1].day}` : 
                  'Aucune donnée disponible'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="calls" name="Total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="answered" name="Répondus" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Évolution mensuelle</CardTitle>
              <span className="text-sm text-muted-foreground">
                {monthlyData.length > 0 ? 
                  `${monthlyData.length} mois` : 
                  'Aucune donnée disponible'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    name="Appels"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Form */}
      <Card className="border-0 shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Attribuer une note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Sélectionnez une note :</p>
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onChange={setRating}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Commentaire (optionnel) :</p>
              <Textarea
                placeholder="Ajoutez un commentaire sur les performances..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSubmitRating}>
              <Send className="h-4 w-4 mr-2" />
              Enregistrer l'évaluation
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Performance;
