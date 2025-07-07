import React from 'react';
import { PageContainer } from '../../components/common/Layout';
import { PortfolioTab } from '../../components/artist';

const PortfolioPage = () => {
  return (
    <PageContainer
      title="Mi Portfolio"
      subtitle="Gestiona tus trabajos y muestra tu arte"
      maxWidth="full"
    >
      <PortfolioTab />
    </PageContainer>
  );
};

export default PortfolioPage;