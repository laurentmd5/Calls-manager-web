import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import type { EnrichedCall } from '@/hooks/useCallsWithDetails';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CallsChartProps {
  enrichedCalls: EnrichedCall[];
}

export const CallsChart = ({ enrichedCalls }: CallsChartProps) => {
  // Générer les données de la semaine dernière à partir des appels réels
  const chartData = useMemo(() => {
    // Initialiser les données pour les 7 derniers jours
    const data: Array<{ day: string; date: Date; answered: number; missed: number }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      data.push({
        day: format(date, 'eee', { locale: fr }),
        date,
        answered: 0,
        missed: 0,
      });
    }

    // Remplir avec les données réelles
    if (enrichedCalls && enrichedCalls.length > 0) {
      enrichedCalls.forEach(call => {
        const callDate = startOfDay(new Date(call.callDate));
        const dayData = data.find(
          d => d.date.getTime() === callDate.getTime()
        );

        if (dayData) {
          if (call.status?.toUpperCase() === 'ANSWERED') {
            dayData.answered += 1;
          } else {
            dayData.missed += 1;
          }
        }
      });
    }

    return data.map(({ day, ...rest }) => ({ day, ...rest }));
  }, [enrichedCalls]);
  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 md:pb-3 border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
        <CardTitle className="text-base md:text-lg font-semibold text-slate-800">Activité de la semaine</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="h-[250px] sm:h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="day"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="answered"
                name="Répondus"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorAnswered)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="missed"
                name="Manqués"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorMissed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
