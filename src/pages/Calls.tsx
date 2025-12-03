import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CallsTable } from '@/components/calls/CallsTable';
import { mockCalls } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';

const Calls = () => {
  return (
    <DashboardLayout
      title="Appels"
      subtitle="Historique et gestion des appels"
    >
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <CallsTable calls={mockCalls} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Calls;
