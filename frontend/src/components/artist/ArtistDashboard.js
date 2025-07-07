import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PageContainer } from '../common/Layout';
import OverviewTab from './OverviewTab';
import ProfileTab from './ProfileTab';
import PortfolioTab from './PortfolioTab';
import ProposalsTab from './ProposalsTab';
import CalendarTab from './CalendarTab';
import ReviewsTab from './ReviewsTab';
import PaymentsTab from './PaymentsTab';

const ArtistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { 
      id: 'overview', 
      label: 'Resumen', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Mi Perfil', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'portfolio', 
      label: 'Portfolio', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: '24'
    },
    { 
      id: 'proposals', 
      label: 'Propuestas', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: '8',
      badgeColor: 'bg-accent-600'
    },
    { 
      id: 'calendar', 
      label: 'Calendario', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'reviews', 
      label: 'Reseñas', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      badge: '127'
    },
    { 
      id: 'payments', 
      label: 'Suscripción', 
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <ProfileTab />;
      case 'portfolio':
        return <PortfolioTab />;
      case 'proposals':
        return <ProposalsTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'payments':
        return <PaymentsTab />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Mi Dashboard"
      subtitle="Gestiona tu perfil y propuestas"
      maxWidth="full"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={twMerge(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-800 text-primary-300 hover:bg-primary-700 hover:text-primary-100'
                )}
              >
                <div className="flex items-center space-x-3">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={twMerge(
                    'px-2 py-1 text-xs rounded-full',
                    activeTab === tab.id 
                      ? 'bg-white bg-opacity-20 text-white'
                      : tab.badgeColor || 'bg-primary-700 text-primary-300'
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-primary-800 rounded-lg">
            <h3 className="text-sm font-semibold text-primary-100 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-accent-400 hover:text-accent-300 transition-colors">
                → Agregar trabajo al portfolio
              </button>
              <button className="w-full text-left text-sm text-accent-400 hover:text-accent-300 transition-colors">
                → Actualizar disponibilidad
              </button>
              <button className="w-full text-left text-sm text-accent-400 hover:text-accent-300 transition-colors">
                → Ver nuevas solicitudes
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="mt-6 p-4 bg-gradient-to-r from-accent-600 to-accent-700 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plan Premium</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-xs opacity-90 mb-3">
              Disfruta de todos los beneficios premium
            </p>
            <button className="text-xs underline hover:no-underline">
              Ver beneficios →
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </PageContainer>
  );
};

export default ArtistDashboard;