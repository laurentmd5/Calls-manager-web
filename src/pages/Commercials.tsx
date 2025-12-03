import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CommercialsTable } from '@/components/commercials/CommercialsTable';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types';

const Commercials = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  return (
    <DashboardLayout
      title="Gestion des Commerciaux"
      subtitle="Gérez votre équipe commerciale"
    >
      <CommercialsTable users={users} onUpdate={setUsers} />
    </DashboardLayout>
  );
};

export default Commercials;
