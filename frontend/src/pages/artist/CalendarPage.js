import React from 'react';
import { PageContainer } from '../../components/common/Layout';
import { CalendarTab } from '../../components/artist';

const CalendarPage = () => {
  return (
    <PageContainer
      title="Mi Calendario"
      subtitle="Gestiona tus citas y disponibilidad"
      maxWidth="full"
    >
      <CalendarTab />
    </PageContainer>
  );
};

export default CalendarPage;