import { useState, useMemo } from 'react';
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
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  MicOff,
  Search,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCallsWithDetails } from '@/hooks/useCallsWithDetails'
import { AudioPlayerModal } from '@/components/audio/AudioPlayerModal'
import type { EnrichedCall } from '@/hooks/useCallsWithDetails'

// Decision badge color mapping
const decisionColorConfig: Record<string, string> = {
  INTERESTED: 'bg-emerald-100 text-emerald-700 font-medium border border-emerald-200',
  CALL_BACK: 'bg-indigo-100 text-indigo-700 font-medium border border-indigo-200',
  NOT_INTERESTED: 'bg-slate-100 text-slate-600 font-medium border border-slate-200',
  WRONG_NUMBER: 'bg-red-100 text-red-700 font-medium border border-red-200',
  NO_ANSWER: 'bg-amber-100 text-amber-700 font-medium border border-amber-200',
}

const decisionLabelConfig: Record<string, string> = {
  INTERESTED: 'Intéressé',
  CALL_BACK: 'Rappeler',
  NOT_INTERESTED: 'Non intéressé',
  WRONG_NUMBER: 'Mauvais numéro',
  NO_ANSWER: 'Sans réponse',
}

export const CallsTable = () => {
  const { enrichedCalls, isLoading, error, refetch } = useCallsWithDetails()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [decisionFilter, setDecisionFilter] = useState('all')
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<EnrichedCall | null>(null)

  // Filtering and sorting with useMemo
  const processedCalls = useMemo(() => {
    let filtered = enrichedCalls

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        call => call.status?.toUpperCase() === statusFilter.toUpperCase()
      )
    }

    // Decision filter
    if (decisionFilter !== 'all') {
      filtered = filtered.filter(
        call => call.decision?.toUpperCase() === decisionFilter.toUpperCase()
      )
    }

    // Search filter (commercial name or phone number)
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        call =>
          call.commercialName.toLowerCase().includes(searchLower) ||
          call.phoneNumber.toLowerCase().includes(searchLower)
      )
    }

    // Sort by callDate descending (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime()
    )
  }, [enrichedCalls, search, statusFilter, decisionFilter])

  const handlePlayClick = (call: EnrichedCall) => {
    if (!call.hasRecording) return
    setSelectedCall(call)
    setAudioModalOpen(true)
  }

  const handleCloseModal = () => {
    setAudioModalOpen(false)
    setSelectedCall(null)
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(
    new Set(enrichedCalls.map(c => c.status?.toUpperCase()).filter(Boolean))
  ).sort()

  // Get unique decisions for filter dropdown
  const uniqueDecisions = Array.from(
    new Set(enrichedCalls.map(c => c.decision?.toUpperCase()).filter(Boolean))
  ).sort()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search filter */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par commercial ou numéro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {uniqueStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Decision filter */}
        <Select value={decisionFilter} onValueChange={setDecisionFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Décision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les décisions</SelectItem>
            {uniqueDecisions.map(decision => (
              <SelectItem key={decision} value={decision}>
                {decisionLabelConfig[decision] || decision}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[180px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Commercial</TableHead>
                <TableHead className="w-[130px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Client</TableHead>
                <TableHead className="w-[160px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Date & Heure</TableHead>
                <TableHead className="w-[80px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Durée</TableHead>
                <TableHead className="w-[100px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Décision</TableHead>
                <TableHead className="flex-1 min-w-[200px] text-slate-500 text-xs font-semibold uppercase tracking-wider">Notes</TableHead>
                <TableHead className="w-[80px] text-center text-slate-500 text-xs font-semibold uppercase tracking-wider">Écoute</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading placeholders
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : processedCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-muted-foreground">
                        {enrichedCalls.length === 0
                          ? 'Aucun appel trouvé'
                          : 'Aucun appel ne correspond aux filtres'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {processedCalls.map((call, idx) => (
                    <TooltipProvider key={call.id}>
                      {/* Main row */}
                      <TableRow className={cn(
                        'hover:bg-slate-50 transition-colors duration-150',
                        idx % 2 === 1 && 'even:bg-slate-50/50'
                      )}>
                        {/* Commercial column */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${call.commercialName}`}
                              />
                              <AvatarFallback>
                                {call.commercialName
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{call.commercialName}</span>
                          </div>
                        </TableCell>

                        {/* Client number with icon */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{call.phoneNumber}</span>
                          </div>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="text-sm">
                          {format(new Date(call.callDate), 'dd MMM yyyy à HH:mm', {
                            locale: fr,
                          })}
                        </TableCell>

                        {/* Duration */}
                        <TableCell className="text-sm">
                          {call.duration
                            ? `${Math.floor(call.duration / 60)}:${(call.duration % 60)
                                .toString()
                                .padStart(2, '0')}`
                            : '-'}
                        </TableCell>

                        {/* Decision */}
                        <TableCell>
                          {call.decision ? (
                            <Badge
                              className={cn(
                                'border',
                                decisionColorConfig[call.decision] ||
                                  'bg-gray-100 text-gray-800 border-gray-300'
                              )}
                            >
                              {decisionLabelConfig[call.decision] || call.decision}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              -
                            </Badge>
                          )}
                        </TableCell>

                        {/* Notes (truncated) */}
                        <TableCell className="text-sm">
                          {call.notes ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left truncate max-w-xs hover:underline">
                                {call.notes.substring(0, 60)}
                                {call.notes.length > 60 ? '...' : ''}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="whitespace-pre-wrap break-words">{call.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Pas de notes
                            </span>
                          )}
                        </TableCell>

                        {/* Listen/Play button */}
                        <TableCell className="text-center">
                          {call.hasRecording ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  onClick={() => handlePlayClick(call)}
                                  className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm hover:shadow transition-all duration-150"
                                >
                                  <Play className="h-4 w-4 fill-current" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Écouter l'enregistrement</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex justify-center">
                                  <MicOff className="h-4 w-4 text-slate-300" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Pas d'enregistrement disponible
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>

                        {/* Expand button */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setExpandedRowId(
                                expandedRowId === call.id ? null : call.id
                              )
                            }
                            className="h-8 w-8"
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                expandedRowId === call.id ? 'rotate-180' : ''
                              )}
                            />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expandable row for full notes and coaching button */}
                      {expandedRowId === call.id && (
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={8} className="py-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">
                                  Notes complètes :
                                </h4>
                                <div className="bg-white dark:bg-slate-950 p-3 rounded border text-sm italic">
                                  {call.notes ? (
                                    <p className="whitespace-pre-wrap break-words">
                                      {call.notes}
                                    </p>
                                  ) : (
                                    <p className="text-muted-foreground">
                                      Ce commercial n'a pas laissé de notes
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-accent hover:bg-accent/90"
                                  onClick={() => handlePlayClick(call)}
                                  disabled={!call.hasRecording}
                                >
                                  <Play className="h-3 w-3 mr-1 fill-current" />
                                  Écouter l'appel
                                </Button>
                                <Button size="sm" variant="outline">
                                  Marquer pour coaching
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TooltipProvider>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Results summary */}
      <p className="text-sm text-muted-foreground">
        {processedCalls.length} appel(s) affiché(s) sur {enrichedCalls.length} au total
      </p>

      {/* Audio Player Modal */}
      {selectedCall && (
        <AudioPlayerModal
          isOpen={audioModalOpen}
          onClose={handleCloseModal}
          audioSrc={selectedCall.audioUrl}
          commercialName={selectedCall.commercialName}
          callDate={selectedCall.callDate}
          decision={selectedCall.decision}
          notes={selectedCall.notes}
          duration={selectedCall.duration}
        />
      )}
    </div>
  )
}
