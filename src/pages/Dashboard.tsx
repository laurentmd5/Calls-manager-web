import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { CallsChart } from '@/components/dashboard/CallsChart';
import {
  Phone,
  PhoneCall,
  Disc3,
  Clock,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { CallsTable } from '@/components/calls/CallsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { useCallsWithDetails } from '@/hooks/useCallsWithDetails';

const Dashboard = () => {
  const { enrichedCalls } = useCallsWithDetails();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatAverageDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculer les stats à partir des vraies données enrichies avec useMemo
  const stats = useMemo(() => {
    const totalCalls = enrichedCalls.length;
    const callsWithRecordings = enrichedCalls.filter(c => c.hasRecording).length;
    const answeredCalls = enrichedCalls.filter(c => c.status?.toUpperCase() === 'ANSWERED').length;
    const totalDuration = enrichedCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const responseRate = totalCalls > 0 ? ((answeredCalls / totalCalls) * 100) : 0;

    return {
      totalCalls,
      callsWithRecordings,
      answeredCalls,
      totalDuration,
      averageDuration,
      responseRate,
    };
  }, [enrichedCalls]);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Vue d'ensemble de l'activité commerciale"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total appels"
          value={stats.totalCalls.toLocaleString()}
          icon={Phone}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Appels répondus"
          value={stats.answeredCalls.toLocaleString()}
          icon={PhoneCall}
          trend={{ value: 8.2, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Appels avec enregistrement"
          value={stats.callsWithRecordings.toLocaleString()}
          icon={Disc3}
          trend={{ value: 5.3, isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Durée totale"
          value={formatDuration(stats.totalDuration)}
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Durée moyenne"
          value={formatAverageDuration(stats.averageDuration)}
          icon={Timer}
          variant="default"
        />
        <StatCard
          title="Taux de réponse"
          value={`${stats.responseRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ value: 2.4, isPositive: true }}
          variant="primary"
        />
      </div>

      {/* Charts & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CallsChart enrichedCalls={enrichedCalls} />
        </div>
        <TopPerformers enrichedCalls={enrichedCalls} />
      </div>

      {/* Recent Calls */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Appels récents</CardTitle>
        </CardHeader>
        <CardContent>
          <CallsTable />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
