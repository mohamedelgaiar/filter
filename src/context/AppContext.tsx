import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, FilterStageType, FilterSystemPreset, Invoice, MaintenanceTicket } from '../types';
import {
  DEFAULT_STAGE_DEFINITIONS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_MAINTENANCE_TICKETS,
  SYSTEM_PRESETS,
} from '../data/initialData';
import { addDays, calculateDueDate, getTodayString } from '../utils/dateUtils';
import { Language, translations } from '../utils/translations';

interface CompleteDetails {
  completedDate: string;
  technicianName: string;
  costCharged: number;
  cartridgeCost: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  completionNotes: string;
}

interface AppContextType {
  customers: Customer[];
  stageDefinitions: FilterStageType[];
  systemPresets: FilterSystemPreset[];
  maintenanceTickets: MaintenanceTicket[];
  invoices: Invoice[];
  language: Language;
  currency: string;
  currencySymbol: string;
  t: typeof translations['ar'];
  setLanguage: (lang: Language) => void;
  setCurrency: (cur: string) => void;

  // Customer actions
  addCustomer: (cust: Omit<Customer, 'id'>) => string;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;

  // Maintenance operations
  completeMaintenance: (
    customerId: string,
    stageNumbers: number[],
    details: CompleteDetails
  ) => void;
  postponeMaintenance: (
    customerId: string,
    stageNumber: number,
    days: number,
    reason?: string
  ) => void;
  deleteMaintenance: (
    customerId: string,
    stageNumber: number,
    reason?: string
  ) => void;
  restoreMaintenance: (ticketId: string) => void;

  // Stages & Invoices
  updateStageDefinitions: (stages: FilterStageType[]) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CUSTOMERS = 'aquacare_customers_v1';
const LOCAL_STORAGE_KEY_TICKETS = 'aquacare_tickets_v1';
const LOCAL_STORAGE_KEY_INVOICES = 'aquacare_invoices_v1';
const LOCAL_STORAGE_KEY_STAGES = 'aquacare_stages_v1';
const LOCAL_STORAGE_KEY_LANG = 'aquacare_lang_v1';
const LOCAL_STORAGE_KEY_CURR = 'aquacare_curr_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [stageDefinitions, setStageDefinitions] = useState<FilterStageType[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STAGES);
      return saved ? JSON.parse(saved) : DEFAULT_STAGE_DEFINITIONS;
    } catch {
      return DEFAULT_STAGE_DEFINITIONS;
    }
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
    } catch {
      return INITIAL_MAINTENANCE_TICKETS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LANG);
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_CURR) || 'EGP';
    } catch {
      return 'EGP';
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TICKETS, JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STAGES, JSON.stringify(stageDefinitions));
  }, [stageDefinitions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CURR, currency);
  }, [currency]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (cur: string) => {
    setCurrencyState(cur);
  };

  const currencySymbol = currency === 'EGP' ? 'ج.م' : currency === 'SAR' ? 'ر.س' : currency === 'AED' ? 'د.إ' : '$';

  // --- CUSTOMER ACTIONS ---
  const addCustomer = (custData: Omit<Customer, 'id'>): string => {
    const newId = `CUST-${Date.now().toString().slice(-4)}`;
    
    // Ensure all stages have calculated currentDueDate based on dateAdded and intervalDays
    const formattedStages = custData.stages.map((st) => {
      const lastServiced = st.lastServicedDate || custData.dateAdded;
      const dueDate = st.currentDueDate || calculateDueDate(lastServiced, st.intervalDays);
      return {
        ...st,
        lastServicedDate: lastServiced,
        currentDueDate: dueDate,
      };
    });

    const newCustomer: Customer = {
      ...custData,
      id: newId,
      stages: formattedStages,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    return newId;
  };

  const updateCustomer = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // --- MAINTENANCE ACTIONS ---

  /**
   * Complete Maintenance for one or multiple stages:
   * Resets the stage count from completionDate (or today) and computes the next due date!
   */
  const completeMaintenance = (
    customerId: string,
    stageNumbers: number[],
    details: CompleteDetails
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const completedDate = details.completedDate || getTodayString();

    // 1. Update customer's stages: restart counting from completedDate
    const updatedStages = customer.stages.map((stage) => {
      if (stageNumbers.includes(stage.stageNumber)) {
        const nextDueDate = calculateDueDate(completedDate, stage.intervalDays);
        return {
          ...stage,
          lastServicedDate: completedDate,
          currentDueDate: nextDueDate,
          postponedUntil: undefined,
          postponeReason: undefined,
        };
      }
      return stage;
    });

    // 2. Adjust customer balance if needed
    const balanceDifference = (details.costCharged || 0) - (details.amountPaid || 0);
    const updatedBalance = customer.balance + balanceDifference;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, stages: updatedStages, balance: updatedBalance }
          : c
      )
    );

    // 3. Create completed maintenance tickets for records
    const newTickets: MaintenanceTicket[] = stageNumbers.map((sNum) => {
      const stageObj = customer.stages.find((s) => s.stageNumber === sNum);
      const stageName = stageObj ? stageObj.stageName : `Stage ${sNum}`;
      return {
        id: `TICK-${Date.now().toString().slice(-5)}-${sNum}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        stageNumber: sNum,
        stageName: stageName,
        scheduledDueDate: stageObj?.postponedUntil || stageObj?.currentDueDate || completedDate,
        status: 'completed',
        completedDate: completedDate,
        costCharged: details.costCharged / stageNumbers.length,
        cartridgeCost: details.cartridgeCost / stageNumbers.length,
        paymentStatus: details.paymentStatus,
        amountPaid: details.amountPaid / stageNumbers.length,
        technicianName: details.technicianName,
        completionNotes: details.completionNotes,
        createdAt: completedDate,
      };
    });

    setMaintenanceTickets((prev) => [...newTickets, ...prev]);

    // 4. Generate Invoice / Receipt
    if (details.costCharged > 0) {
      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber: `INV-${String(invoices.length + 1).padStart(5, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        date: completedDate,
        items: stageNumbers.map((sNum) => {
          const stageObj = customer.stages.find((s) => s.stageNumber === sNum);
          return {
            description: `Filter Cartridge Replacement - Stage ${sNum} (${stageObj?.stageName || ''})`,
            stageNumber: sNum,
            quantity: 1,
            unitPrice: details.costCharged / stageNumbers.length,
            total: details.costCharged / stageNumbers.length,
          };
        }),
        subtotal: details.costCharged,
        discount: 0,
        total: details.costCharged,
        amountPaid: details.amountPaid,
        balanceDue: Math.max(0, details.costCharged - details.amountPaid),
        paymentMethod: 'Cash',
        notes: `Technician: ${details.technicianName}. ${details.completionNotes}`,
      };

      setInvoices((prev) => [newInvoice, ...prev]);
    }
  };

  /**
   * Postpone Maintenance by a specified number of days
   */
  const postponeMaintenance = (
    customerId: string,
    stageNumber: number,
    days: number,
    reason?: string
  ) => {
    const today = getTodayString();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newTargetDate = addDays(today, days);

    // Update customer stage
    const updatedStages = customer.stages.map((stage) => {
      if (stage.stageNumber === stageNumber) {
        return {
          ...stage,
          postponedUntil: newTargetDate,
          postponeReason: reason || `Postponed by ${days} days`,
        };
      }
      return stage;
    });

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, stages: updatedStages } : c))
    );

    // Record ticket
    const stageObj = customer.stages.find((s) => s.stageNumber === stageNumber);
    const newTicket: MaintenanceTicket = {
      id: `TICK-POST-${Date.now().toString().slice(-4)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      stageNumber: stageNumber,
      stageName: stageObj?.stageName || `Stage ${stageNumber}`,
      scheduledDueDate: stageObj?.currentDueDate || today,
      status: 'postponed',
      postponedUntil: newTargetDate,
      postponeDays: days,
      postponeReason: reason || `Postponed by ${days} days`,
      postponedAt: today,
      createdAt: today,
    };

    // Remove any existing active postponed ticket for same customer & stage
    setMaintenanceTickets((prev) => [
      newTicket,
      ...prev.filter(
        (t) => !(t.customerId === customerId && t.stageNumber === stageNumber && t.status === 'postponed')
      ),
    ]);
  };

  /**
   * Delete / Soft-delete Maintenance
   */
  const deleteMaintenance = (
    customerId: string,
    stageNumber: number,
    reason?: string
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const stageObj = customer.stages.find((s) => s.stageNumber === stageNumber);
    const today = getTodayString();

    const newTicket: MaintenanceTicket = {
      id: `TICK-DEL-${Date.now().toString().slice(-4)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      stageNumber: stageNumber,
      stageName: stageObj?.stageName || `Stage ${stageNumber}`,
      scheduledDueDate: stageObj?.postponedUntil || stageObj?.currentDueDate || today,
      status: 'deleted',
      deletedAt: today,
      deletionReason: reason || 'Deleted by user',
      createdAt: today,
    };

    setMaintenanceTickets((prev) => [newTicket, ...prev]);

    // Push stage's due date forward by 1 cycle so it clears from the active screen,
    // or keep track that this cycle was marked deleted
    const updatedStages = customer.stages.map((stage) => {
      if (stage.stageNumber === stageNumber) {
        return {
          ...stage,
          lastServicedDate: today,
          currentDueDate: calculateDueDate(today, stage.intervalDays),
          postponedUntil: undefined,
          postponeReason: undefined,
        };
      }
      return stage;
    });

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, stages: updatedStages } : c))
    );
  };

  const restoreMaintenance = (ticketId: string) => {
    const ticket = maintenanceTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    // Restore customer's stage due date back to the ticket's scheduledDueDate
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === ticket.customerId) {
          const updatedStages = c.stages.map((st) => {
            if (st.stageNumber === ticket.stageNumber) {
              return {
                ...st,
                currentDueDate: ticket.scheduledDueDate,
                postponedUntil: undefined,
                postponeReason: undefined,
              };
            }
            return st;
          });
          return { ...c, stages: updatedStages };
        }
        return c;
      })
    );

    // Remove from deleted tickets
    setMaintenanceTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const updateStageDefinitions = (stages: FilterStageType[]) => {
    setStageDefinitions(stages);
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `INV-${Date.now()}`,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setInvoices(INITIAL_INVOICES);
    setStageDefinitions(DEFAULT_STAGE_DEFINITIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOMERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TICKETS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_INVOICES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_STAGES);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        customers,
        stageDefinitions,
        systemPresets: SYSTEM_PRESETS,
        maintenanceTickets,
        invoices,
        language,
        currency,
        currencySymbol,
        t,
        setLanguage,
        setCurrency,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        completeMaintenance,
        postponeMaintenance,
        deleteMaintenance,
        restoreMaintenance,
        updateStageDefinitions,
        addInvoice,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
