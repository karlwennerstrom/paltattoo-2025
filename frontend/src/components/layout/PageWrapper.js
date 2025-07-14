import React from 'react';

const PageWrapper = ({ children, fullScreen = false }) => {
  return (
    <div className={fullScreen ? '' : 'pt-16'}>
      {children}
    </div>
  );
};

export default PageWrapper;