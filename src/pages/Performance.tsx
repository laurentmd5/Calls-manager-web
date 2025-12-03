import { useState } from 'react';
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
} from 'lucide-react';
import { mockUsers, mockCalls } from '@/data/mockData';
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

const Performance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // If no ID, show list view
  if (!id) {
    return (
      <DashboardLayout
        title="Performances"
        subtitle="Évaluation détaillée des commerciaux"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockUsers.filter(u => u.role === 'commercial').map((user) => {
            const responseRate = user.totalCalls
              ? Math.round((user.answeredCalls || 0) / user.totalCalls * 100)
              : 0;

            return (
              <Card
                key={user.id}
                className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/performance/${user.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-2">
                        <RatingStars rating={user.rating || 0} size="sm" />
                      </div>
                    </div>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{user.totalCalls}</p>
                      <p className="text-xs text-muted-foreground">Appels</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{responseRate}%</p>
                      <p className="text-xs text-muted-foreground">Taux réponse</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{user.rating?.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Note</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DashboardLayout>
    );
  }

  // Detail view
  const user = mockUsers.find(u => u.id === parseInt(id));
  
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

  const userCalls = mockCalls.filter(c => c.commercialId === user.id);
  const responseRate = user.totalCalls
    ? Math.round((user.answeredCalls || 0) / user.totalCalls * 100)
    : 0;

  const weeklyData = [
    { day: 'Lun', calls: 12, answered: 10 },
    { day: 'Mar', calls: 15, answered: 14 },
    { day: 'Mer', calls: 8, answered: 7 },
    { day: 'Jeu', calls: 18, answered: 16 },
    { day: 'Ven', calls: 14, answered: 12 },
  ];

  const monthlyData = [
    { week: 'S1', calls: 52 },
    { week: 'S2', calls: 68 },
    { week: 'S3', calls: 45 },
    { week: 'S4', calls: 80 },
  ];

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une note.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Évaluation enregistrée',
      description: `Note de ${rating}/5 attribuée à ${user.firstName} ${user.lastName}.`,
    });
    setRating(0);
    setComment('');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <DashboardLayout
      title={`${user.firstName} ${user.lastName}`}
      subtitle="Fiche de performance détaillée"
    >
      <Button
        variant="ghost"
        onClick={() => navigate('/performance')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la liste
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="mt-4 flex justify-center">
                <RatingStars rating={user.rating || 0} size="lg" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Note actuelle: {user.rating?.toFixed(1)}/5
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-primary/10">
            <CardContent className="pt-6 text-center">
              <Phone className="h-8 w-8 mx-auto text-primary" />
              <p className="mt-2 text-2xl font-bold">{user.totalCalls}</p>
              <p className="text-sm text-muted-foreground">Total appels</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-success/10">
            <CardContent className="pt-6 text-center">
              <PhoneCall className="h-8 w-8 mx-auto text-success" />
              <p className="mt-2 text-2xl font-bold">{user.answeredCalls}</p>
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
              <p className="mt-2 text-2xl font-bold">{formatDuration(user.totalDuration || 0)}</p>
              <p className="text-sm text-muted-foreground">Durée totale</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Activité hebdomadaire</CardTitle>
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
            <CardTitle className="text-lg">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
