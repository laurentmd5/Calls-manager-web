import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import type { EnrichedCall } from '@/hooks/useCallsWithDetails';

interface TopPerformersProps {
  enrichedCalls: EnrichedCall[];
}

export const TopPerformers = ({ enrichedCalls }: TopPerformersProps) => {
  // Calculer les performances par commercial à partir des données enrichies
  const topPerformers = useMemo(() => {
    if (!enrichedCalls || enrichedCalls.length === 0) {
      return [];
    }

    const commercialStats: Record<string, {
      name: string;
      answeredCalls: number;
      totalCalls: number;
      totalDuration: number;
    }> = {};

    enrichedCalls.forEach(call => {
      if (!commercialStats[call.commercialName]) {
        commercialStats[call.commercialName] = {
          name: call.commercialName,
          answeredCalls: 0,
          totalCalls: 0,
          totalDuration: 0,
        };
      }

      commercialStats[call.commercialName].totalCalls += 1;
      commercialStats[call.commercialName].totalDuration += call.duration || 0;
      
      if (call.status?.toUpperCase() === 'ANSWERED') {
        commercialStats[call.commercialName].answeredCalls += 1;
      }
    });

    // Convertir en tableau et calculer les ratings
    const performers = Object.values(commercialStats)
      .map(stat => ({
        ...stat,
        rating: stat.totalCalls > 0 ? (stat.answeredCalls / stat.totalCalls) * 5 : 0,
      }))
      .sort((a, b) => b.answeredCalls - a.answeredCalls)
      .slice(0, 5);

    return performers;
  }, [enrichedCalls]);

  const sortedUsers = topPerformers;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Performeurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedUsers.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                index === 0 && 'bg-yellow-500 text-yellow-950',
                index === 1 && 'bg-gray-400 text-gray-950',
                index === 2 && 'bg-amber-600 text-amber-950',
                index > 2 && 'bg-muted text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.answeredCalls}/{user.totalCalls} appels répondus
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{user.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(user.totalDuration)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
