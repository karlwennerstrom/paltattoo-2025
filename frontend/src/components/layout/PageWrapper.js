import React from 'react';

const PageWrapper = ({ children, fullScreen = false }) => {
  return (
    <div className="">{/* Removed pt-16 spacing */}
      {children}
    </div>
  );
};

export default PageWrapper;