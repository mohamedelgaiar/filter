import * as XLSX from 'xlsx';
import { MaintenanceTicket, Customer, Invoice } from '../types';
import { getDaysDifferenceFromToday, getTodayString } from './dateUtils';

export function exportMaintenanceToExcel(
  tickets: {
    customer: Customer;
    stageNumber: number;
    stageName: string;
    dueDate: string;
    status: string;
    intervalDays: number;
    postponedUntil?: string;
    postponeReason?: string;
    customPrice?: number;
  }[],
  fileNamePrefix: string = 'water_filter_maintenance'
) {
  const rows = tickets.map((item, idx) => {
    const diff = getDaysDifferenceFromToday(item.postponedUntil || item.dueDate);
    let timingLabel = '';
    if (diff < 0) timingLabel = `Overdue by ${Math.abs(diff)} days`;
    else if (diff === 0) timingLabel = 'Due Today';
    else timingLabel = `Due in ${diff} days`;

    return {
      '#': idx + 1,
      'Customer ID': item.customer.id,
      'Customer Name': item.customer.name,
      'Phone Number': item.customer.phone,
      'Address': item.customer.address,
      'Area / City': item.customer.cityOrArea,
      'Filter Model': item.customer.filterModel,
      'Stage Number': item.stageNumber,
      'Stage Name': item.stageName,
      'Interval (Days)': item.intervalDays,
      'Scheduled Due Date': item.dueDate,
      'Postponed Date': item.postponedUntil || '-',
      'Postpone Reason': item.postponeReason || '-',
      'Current Timing': timingLabel,
      'Status': item.status.toUpperCase(),
      'Stage Price ($)': item.customPrice || 0,
      'Customer Notes': item.customer.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = [
    { wch: 4 },  // #
    { wch: 12 }, // ID
    { wch: 25 }, // Name
    { wch: 18 }, // Phone
    { wch: 32 }, // Address
    { wch: 16 }, // City
    { wch: 28 }, // Filter Model
    { wch: 10 }, // Stage Number
    { wch: 26 }, // Stage Name
    { wch: 14 }, // Interval
    { wch: 16 }, // Scheduled Due Date
    { wch: 16 }, // Postponed Date
    { wch: 25 }, // Postpone Reason
    { wch: 20 }, // Timing
    { wch: 14 }, // Status
    { wch: 14 }, // Price
    { wch: 30 }, // Notes
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Schedule');

  const dateStr = getTodayString();
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportCompletedMaintenanceToExcel(
  completedTickets: MaintenanceTicket[],
  fileNamePrefix: string = 'completed_maintenance_report'
) {
  const rows = completedTickets.map((t, idx) => ({
    '#': idx + 1,
    'Ticket ID': t.id,
    'Completion Date': t.completedDate || '-',
    'Customer Name': t.customerName,
    'Phone': t.customerPhone,
    'Address': t.customerAddress,
    'Stage Replaced': `Stage ${t.stageNumber}: ${t.stageName}`,
    'Technician': t.technicianName || '-',
    'Cartridge Cost ($)': t.cartridgeCost || 0,
    'Charged to Customer ($)': t.costCharged || 0,
    'Gross Profit ($)': (t.costCharged || 0) - (t.cartridgeCost || 0),
    'Amount Paid ($)': t.amountPaid || 0,
    'Payment Status': (t.paymentStatus || 'paid').toUpperCase(),
    'Notes': t.completionNotes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 4 },
    { wch: 14 },
    { wch: 16 },
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 25 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Jobs');

  const dateStr = getTodayString();
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportCustomersToExcel(customers: Customer[], fileNamePrefix: string = 'customers_list') {
  const rows = customers.map((c, idx) => ({
    '#': idx + 1,
    'Customer ID': c.id,
    'Customer Name': c.name,
    'Phone': c.phone,
    'Secondary Phone': c.secondaryPhone || '-',
    'Address': c.address,
    'City / Area': c.cityOrArea,
    'Date Added': c.dateAdded,
    'Filter System': c.filterModel,
    'Total Stages': c.stages.length,
    'Outstanding Balance ($)': c.balance,
    'Notes': c.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 4 },
    { wch: 14 },
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 32 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 12 },
    { wch: 22 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  const dateStr = getTodayString();
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportInvoicesToExcel(invoices: Invoice[], fileNamePrefix: string = 'financial_invoices_report') {
  const rows = invoices.map((inv, idx) => ({
    '#': idx + 1,
    'Invoice #': inv.invoiceNumber,
    'Date': inv.date,
    'Customer Name': inv.customerName,
    'Phone': inv.customerPhone,
    'Address': inv.customerAddress || '-',
    'Description': inv.items.map((i) => i.description).join(' + '),
    'Total Amount ($)': inv.total,
    'Amount Paid ($)': inv.amountPaid,
    'Balance Due ($)': inv.balanceDue,
    'Payment Method': inv.paymentMethod,
    'Notes': inv.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 4 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 35 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

  const dateStr = getTodayString();
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}
