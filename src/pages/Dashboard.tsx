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
import { useMemo } from 'react';
import { useCallsWithDetails } from '@/hooks/useCallsWithDetails';

const Dashboard = () => {
  const { enrichedCalls } = useCallsWithDetails();

  /**
   * Formate la durée totale en format lisible
   */
  const formatDuration = (seconds: number) => {
    if (seconds === 0 || isNaN(seconds) || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  /**
   * Formate la durée moyenne en format lisible
   */
  const formatAverageDuration = (seconds: number) => {
    if (seconds === 0 || isNaN(seconds) || seconds < 0) return '0s';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    if (mins === 0) {
      return `${secs}s`;
    }
    if (secs === 0) {
      return `${mins}m`;
    }
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
      {/* Stats Grid - Responsive: 1col mobile → 2cols tablet → 3cols desktop → 6cols très large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
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

      {/* Charts & Top Performers - Stack on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2">
          <CallsChart enrichedCalls={enrichedCalls} />
        </div>
        <TopPerformers enrichedCalls={enrichedCalls} />
      </div>

      {/* Recent Calls */}
      <div className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
          <h2 className="text-base md:text-lg font-semibold text-slate-800">Appels récents</h2>
        </div>
        <div className="p-4 md:p-6">
          <CallsTable />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;