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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Download,
  Search,
} from 'lucide-react';
import { Call, CallStatus } from '@/types';
import { mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CallsTableProps {
  calls: Call[];
}

const statusConfig: Record<CallStatus, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  answered: { label: 'Répondu', variant: 'default' },
  missed: { label: 'Manqué', variant: 'destructive' },
  rejected: { label: 'Rejeté', variant: 'secondary' },
  no_answer: { label: 'Sans réponse', variant: 'outline' },
};

export const CallsTable = ({ calls }: CallsTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCommercialName = (id: number) => {
    const user = mockUsers.find(u => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'Inconnu';
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch =
      call.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
      getCommercialName(call.commercialId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesType = typeFilter === 'all' || call.callType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const togglePlay = (id: number) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou commercial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="answered">Répondus</SelectItem>
            <SelectItem value="missed">Manqués</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
            <SelectItem value="no_answer">Sans réponse</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="incoming">Entrants</SelectItem>
            <SelectItem value="outgoing">Sortants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Type</TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Commercial</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Enregistrement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.map((call) => (
              <TableRow key={call.id} className="hover:bg-muted/30">
                <TableCell>
                  {call.callType === 'incoming' ? (
                    <PhoneIncoming className="h-4 w-4 text-primary" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-accent-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{call.phoneNumber}</TableCell>
                <TableCell>{getCommercialName(call.commercialId)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(call.callDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                </TableCell>
                <TableCell>
                  {call.duration > 0 ? formatDuration(call.duration) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[call.status].variant}>
                    {statusConfig[call.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {call.recording ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePlay(call.id)}
                      >
                        {playingId === call.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredCalls.length} appel(s) trouvé(s)
      </p>
    </div>
  );
};
