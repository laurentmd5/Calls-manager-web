import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { CallsChart } from '@/components/dashboard/CallsChart';
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  Clock,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { mockDashboardStats, mockUsers, mockCalls } from '@/data/mockData';
import { CallsTable } from '@/components/calls/CallsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
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

  const recentCalls = mockCalls.slice(0, 5);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Vue d'ensemble de l'activité commerciale"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total appels"
          value={mockDashboardStats.totalCalls.toLocaleString()}
          icon={Phone}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Appels répondus"
          value={mockDashboardStats.answeredCalls.toLocaleString()}
          icon={PhoneCall}
          trend={{ value: 8.2, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Appels manqués"
          value={mockDashboardStats.missedCalls.toLocaleString()}
          icon={PhoneMissed}
          trend={{ value: 3.1, isPositive: false }}
          variant="destructive"
        />
        <StatCard
          title="Durée totale"
          value={formatDuration(mockDashboardStats.totalDuration)}
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Durée moyenne"
          value={formatAverageDuration(mockDashboardStats.averageDuration)}
          icon={Timer}
          variant="default"
        />
        <StatCard
          title="Taux de réponse"
          value={`${mockDashboardStats.responseRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.4, isPositive: true }}
          variant="primary"
        />
      </div>

      {/* Charts & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CallsChart />
        </div>
        <TopPerformers users={mockUsers} />
      </div>

      {/* Recent Calls */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Appels récents</CardTitle>
        </CardHeader>
        <CardContent>
          <CallsTable calls={recentCalls} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
