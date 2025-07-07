import React from 'react';
import { PageContainer } from '../../components/common/Layout';
import { ProposalsTab } from '../../components/artist';

const ProposalsPage = () => {
  return (
    <PageContainer
      title="Mis Propuestas"
      subtitle="Gestiona las propuestas enviadas a clientes"
      maxWidth="full"
    >
      <ProposalsTab />
    </PageContainer>
  );
};

export default ProposalsPage;