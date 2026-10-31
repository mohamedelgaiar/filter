/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardBanner } from './components/DashboardBanner';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { StagesConfigScreen } from './components/StagesConfigScreen';
import { AccountingScreen } from './components/AccountingScreen';
import { CustomerModal } from './components/CustomerModal';
import { OfflineIndicator } from './components/OfflineIndicator';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'maintenance' | 'customers' | 'stages' | 'accounting'>('maintenance');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Alert Banner */}
        <DashboardBanner
          onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
          onSelectTab={() => setCurrentTab('maintenance')}
        />

        {/* Tab Content */}
        {currentTab === 'maintenance' && <MaintenanceScreen />}
        {currentTab === 'customers' && <CustomersScreen />}
        {currentTab === 'stages' && <StagesConfigScreen />}
        {currentTab === 'accounting' && <AccountingScreen />}
      </main>

      {/* Quick Add Customer Modal */}
      {isAddCustomerOpen && (
        <CustomerModal
          isOpen={true}
          onClose={() => setIsAddCustomerOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 py-4 text-center text-xs text-slate-500 print:hidden">
        <p>
          FilterMaintenance © {new Date().getFullYear()} — Professional Water Filter Maintenance & Accounting Management System
        </p>
      </footer>

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
