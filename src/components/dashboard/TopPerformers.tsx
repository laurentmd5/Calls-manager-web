import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp } from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface TopPerformersProps {
  users: User[];
}

export const TopPerformers = ({ users }: TopPerformersProps) => {
  const sortedUsers = [...users]
    .filter(u => u.isActive)
    .sort((a, b) => (b.answeredCalls || 0) - (a.answeredCalls || 0))
    .slice(0, 5);

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
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.answeredCalls} appels répondus
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{user.rating?.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(user.totalDuration || 0)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
