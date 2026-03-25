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
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 md:pb-3 border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg font-semibold text-slate-800">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
          Top Performeurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6">
        {sortedUsers.map((user, index) => (
          <div
            key={user.name}
            className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors duration-150"
          >
            <div
              className={cn(
                'flex h-7 md:h-8 w-7 md:w-8 items-center justify-center rounded-lg text-xs font-bold text-white flex-shrink-0',
                index === 0 && 'bg-amber-500',
                index === 1 && 'bg-slate-400',
                index === 2 && 'bg-amber-600',
                index > 2 && 'bg-slate-300 text-slate-600'
              )}
            >
              {index + 1}
            </div>
            <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-xs">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-xs md:text-sm truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">
                {user.answeredCalls}/{user.totalCalls} répondus
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm text-slate-900">{user.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-500">
                {formatDuration(user.totalDuration)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
