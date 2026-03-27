import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useCallsWithDetails } from '@/hooks/useCallsWithDetails';
import { useMemo, useState, useEffect } from 'react';

// ✅ Libellés en français pour les statuts
const statusLabels: Record<string, string> = {
  ANSWERED: 'Répondus',
  NO_ANSWER: 'Sans réponse',
  MISSED: 'Manqués',
  REJECTED: 'Rejetés',
  UNKNOWN: 'Inconnu',
};

// ✅ Libellés en français pour les types d'appels
const callTypeLabels: Record<string, string> = {
  'Entrants (estimé)': 'Appels entrants',
  'Sortants (estimé)': 'Appels sortants',
};

// ✅ Style commun des tooltips pour tous les graphiques (amélioré pour meilleure visibilité)
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '13px',
  fontWeight: '500',
  padding: '10px 14px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

const tooltipLabelStyle = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: '400',
  marginBottom: '6px',
};

const tooltipItemStyle = {
  color: '#f1f5f9',
  fontSize: '13px',
  fontWeight: '500',
  padding: '2px 0',
};

const Statistics = () => {
  const { enrichedCalls, isLoading, error } = useCallsWithDetails();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#94A3B8'];

  // ✅ Calculer les statistiques à partir des appels réels
  const stats = useMemo(() => {
    if (!enrichedCalls.length) {
      return {
        callStatusDistribution: [],
        callTypeDistribution: [],
        monthlyTrendData: [],
        hourlyActivityData: [],
        weeklyCallsData: [],
      };
    }

    // Distribution par statut
    const statusMap = new Map<string, number>();
    enrichedCalls.forEach(call => {
      const status = call.status?.toUpperCase() || 'UNKNOWN';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const callStatusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

    // Distribution entrants vs sortants par préfixe du numéro
    const incomingEstimate = enrichedCalls.filter(call => {
      return call.phoneNumber.startsWith('+') || call.phoneNumber.startsWith('00');
    }).length;
    const outgoingEstimate = enrichedCalls.length - incomingEstimate;
    
    const callTypeDistribution = [
      { name: 'Entrants (estimé)', value: incomingEstimate },
      { name: 'Sortants (estimé)', value: outgoingEstimate },
    ];

    // Tendance mensuelle (agrégation par mois)
    const monthlyMap = new Map<string, number>();
    enrichedCalls.forEach(call => {
      const date = new Date(call.callDate);
      const month = date.toLocaleString('fr', { month: 'short' });
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });
    const monthlyTrendData = Array.from(monthlyMap.entries())
      .map(([month, calls]) => ({ month, calls }))
      .slice(-6);

    // Activité par heure
    const hourlyMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) hourlyMap.set(i, 0);
    enrichedCalls.forEach(call => {
      const hour = new Date(call.callDate).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });
    const hourlyActivityData = Array.from(hourlyMap.entries()).map(([hour, calls]) => ({
      hour: `${hour}h`,
      calls,
    }));

    // Comparaison hebdomadaire
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const weeklyMap = new Map<string, { total: number; answered: number; missed: number }>();
    days.forEach(day => weeklyMap.set(day, { total: 0, answered: 0, missed: 0 }));
    
    enrichedCalls.forEach(call => {
      const date = new Date(call.callDate);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
      const current = weeklyMap.get(dayName)!;
      current.total++;
      if (call.status?.toUpperCase() === 'ANSWERED') current.answered++;
      if (call.status?.toUpperCase() === 'MISSED') current.missed++;
    });
    
    const weeklyCallsData = days.map(day => ({
      day,
      total: weeklyMap.get(day)?.total || 0,
      answered: weeklyMap.get(day)?.answered || 0,
      missed: weeklyMap.get(day)?.missed || 0,
    }));

    return {
      callStatusDistribution,
      callTypeDistribution,
      monthlyTrendData,
      hourlyActivityData,
      weeklyCallsData,
    };
  }, [enrichedCalls]);

  // ✅ Calculer les dimensions responsive pour les pie charts
  const getPieDimensions = () => {
    if (typeof window === 'undefined') return { innerRadius: 40, outerRadius: 70 };
    const width = window.innerWidth;
    if (width < 640) return { innerRadius: 30, outerRadius: 55 };
    if (width < 768) return { innerRadius: 35, outerRadius: 65 };
    return { innerRadius: 45, outerRadius: 80 };
  };

  const pieDimensions = getPieDimensions();

  if (loading) {
    return (
      <DashboardLayout title="Statistiques" subtitle="Analyse détaillée de l'activité">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {[1, 2].map(i => (
            <Card key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-6">
                <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <CardHeader className="border-b border-slate-200">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-[250px] sm:h-[300px] md:h-[350px] w-full" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Statistiques" subtitle="Analyse détaillée de l'activité">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-8 text-center text-red-600">
            Erreur lors du chargement des données: {error}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Statistiques"
      subtitle="Analyse détaillée de l'activité"
    >
      {/* Top Charts - Grille responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        
        {/* Call Status Distribution - Version responsive */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
              Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4 md:pt-6">
            {stats.callStatusDistribution.length === 0 ? (
              <div className="h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-slate-400">
                Aucune donnée disponible
              </div>
            ) : (
              <>
                {/* ✅ Graphique avec dimensions responsives */}
                <div className="h-[200px] sm:h-[250px] md:h-[280px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.callStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={pieDimensions.innerRadius}
                        outerRadius={pieDimensions.outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                        label={false}
                      >
                        {stats.callStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      {/* ✅ Tooltip amélioré pour le pie chart */}
                      <Tooltip
                        formatter={(value, name) => [value, statusLabels[name as string] || name]}
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* ✅ Légende améliorée et responsive */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6">
                  {stats.callStatusDistribution.map((item, index) => {
                    const total = stats.callStatusDistribution.reduce((sum, i) => sum + i.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-xs sm:text-sm text-slate-600">
                          {statusLabels[item.name] || item.name}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          ({item.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Call Type Distribution - Version responsive */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
              Entrants vs Sortants
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4 md:pt-6">
            <div className="h-[200px] sm:h-[250px] md:h-[280px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.callTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieDimensions.innerRadius}
                    outerRadius={pieDimensions.outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                  >
                    {stats.callTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* ✅ Tooltip amélioré pour le pie chart */}
                  <Tooltip
                    formatter={(value, name) => [value, callTypeLabels[name as string] || name]}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-3 sm:mt-4 md:mt-6">
              {stats.callTypeDistribution.map((item, index) => {
                const total = stats.callTypeDistribution.reduce((sum, i) => sum + i.value, 0);
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                  <div key={item.name} className="text-center">
                    <div
                      className="h-4 w-4 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <p className="text-lg md:text-xl font-bold text-slate-900">{item.value}</p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {callTypeLabels[item.name] || item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {percentage}%
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-3 md:mt-4">
              ⚠️ Données estimées (basées sur le préfixe du numéro)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend - Pleine largeur */}
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
            Évolution mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          {stats.monthlyTrendData.length === 0 ? (
            <div className="h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-slate-400">
              Aucune donnée disponible
            </div>
          ) : (
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  {/* ✅ Tooltip amélioré pour l'area chart */}
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    name="Nombre d'appels"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Charts - Grille responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Hourly Activity */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
              Activité par heure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6">
            {stats.hourlyActivityData.every(h => h.calls === 0) ? (
              <div className="h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-slate-400">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourlyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#94A3B8" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    {/* ✅ Tooltip amélioré pour le bar chart */}
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                    />
                    <Bar
                      dataKey="calls"
                      name="Appels"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Comparison */}
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-base md:text-lg font-semibold text-slate-800">
              Comparaison hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6">
            {stats.weeklyCallsData.every(w => w.total === 0) ? (
              <div className="h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-slate-400">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyCallsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#94A3B8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    {/* ✅ Tooltip amélioré pour le line chart */}
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ fill: '#6366F1', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="answered"
                      name="Répondus"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="missed"
                      name="Manqués"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ fill: '#EF4444', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;