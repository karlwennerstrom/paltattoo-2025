import React from 'react';

function AppTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1>Test App - Funcionando!</h1>
      <p>Si ves este mensaje, React está funcionando correctamente.</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/admin/dashboard" style={{ color: '#22c55e' }}>Ir al Panel Admin</a>
      </div>
    </div>
  );
}

export default AppTest;