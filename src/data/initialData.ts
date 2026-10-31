import { FilterStageType, Customer, MaintenanceTicket, Invoice, FilterSystemPreset } from '../types';
import { addDays, calculateDueDate, getTodayString } from '../utils/dateUtils';

export const DEFAULT_STAGE_DEFINITIONS: FilterStageType[] = [
  {
    id: 'stage-1',
    stageNumber: 1,
    name: 'Stage 1: PP Sediment (5 Micron)',
    nameAr: 'المرحلة 1: شمعة شوائب قطنية (5 ميكرون)',
    defaultIntervalDays: 90, // 3 months
    defaultCost: 5,
    defaultPrice: 15,
    description: 'Traps sand, silt, rust and particulate matter.',
    descriptionAr: 'حجز الشوائب والأتربة والرمال والصدأ العالق في المياه.',
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    name: 'Stage 2: GAC Granular Carbon',
    nameAr: 'المرحلة 2: شمعة كربون نشط حبيبي (GAC)',
    defaultIntervalDays: 180, // 6 months
    defaultCost: 8,
    defaultPrice: 20,
    description: 'Adsorbs chlorine, organic chemicals, bad odor, and color.',
    descriptionAr: 'امتصاص الكلور والشبه والمواد العضوية والطعم والرائحة.',
  },
  {
    id: 'stage-3',
    stageNumber: 3,
    name: 'Stage 3: CTO Carbon Block',
    nameAr: 'المرحلة 3: شمعة كربون مصمت (CTO)',
    defaultIntervalDays: 180, // 6 months
    defaultCost: 8,
    defaultPrice: 20,
    description: 'Ultra-fine carbon filtration preventing carbon leakage to membrane.',
    descriptionAr: 'ترشيح كربوني دقيق لتأكيد إزالة الكلور وحماية الممبرين.',
  },
  {
    id: 'stage-4',
    stageNumber: 4,
    name: 'Stage 4: RO Membrane (75 GPD)',
    nameAr: 'المرحلة 4: غشاء التناضح العكسي (الممبرين)',
    defaultIntervalDays: 720, // 24 months
    defaultCost: 25,
    defaultPrice: 65,
    description: 'Semi-permeable membrane removing heavy metals, salts, and microbes.',
    descriptionAr: 'فصل الأملاح الزائدة والمعادن الثقيلة والبكتيريا بنسبة تصل إلى 97%.',
  },
  {
    id: 'stage-5',
    stageNumber: 5,
    name: 'Stage 5: Post Carbon (Taste Refiner)',
    nameAr: 'المرحلة 5: شمعة بوست كربون (تحسين الطعم)',
    defaultIntervalDays: 360, // 12 months
    defaultCost: 9,
    defaultPrice: 22,
    description: 'Coconut shell carbon refining water taste straight before faucet.',
    descriptionAr: 'كربون قشور جوز الهند لتحسين طعم ورائحة المياه بعد الخزان.',
  },
  {
    id: 'stage-6',
    stageNumber: 6,
    name: 'Stage 6: Mineral / Bio-Ceramic',
    nameAr: 'المرحلة 6: شمعة معادن وبيوسيراميك',
    defaultIntervalDays: 360, // 12 months
    defaultCost: 11,
    defaultPrice: 25,
    description: 'Adds essential minerals (calcium, magnesium, potassium).',
    descriptionAr: 'إضافة الأملاح المعدنية الضرورية للجسم مثل الكالسيوم والماغنسيوم.',
  },
  {
    id: 'stage-7',
    stageNumber: 7,
    name: 'Stage 7: Alkaline / Infrared',
    nameAr: 'المرحلة 7: شمعة قلوية (ألكالاين / إنفراريد)',
    defaultIntervalDays: 360, // 12 months
    defaultCost: 12,
    defaultPrice: 28,
    description: 'Adjusts pH balance to healthy alkaline level (pH 7.5 - 8.5).',
    descriptionAr: 'ضبط الرقم الهيدروجيني pH لجعل المياه قلوية صحية ومضادة للأكسدة.',
  },
];

export const SYSTEM_PRESETS: FilterSystemPreset[] = [
  {
    id: '7-stage-ro',
    name: '7-Stage Reverse Osmosis (RO) System',
    nameAr: 'فلتر 7 مراحل تناضح عكسي (RO)',
    stagesCount: 7,
    stages: DEFAULT_STAGE_DEFINITIONS.map(s => ({
      stageNumber: s.stageNumber,
      name: s.name,
      nameAr: s.nameAr,
      intervalDays: s.defaultIntervalDays,
      price: s.defaultPrice,
      cost: s.defaultCost,
    })),
  },
  {
    id: '5-stage-standard',
    name: '5-Stage Standard RO System',
    nameAr: 'فلتر 5 مراحل قياسي (RO)',
    stagesCount: 5,
    stages: DEFAULT_STAGE_DEFINITIONS.slice(0, 5).map(s => ({
      stageNumber: s.stageNumber,
      name: s.name,
      nameAr: s.nameAr,
      intervalDays: s.defaultIntervalDays,
      price: s.defaultPrice,
      cost: s.defaultCost,
    })),
  },
  {
    id: '3-stage-compact',
    name: '3-Stage Kitchen Filtration System',
    nameAr: 'فلتر 3 مراحل منزلي بسيط',
    stagesCount: 3,
    stages: DEFAULT_STAGE_DEFINITIONS.slice(0, 3).map(s => ({
      stageNumber: s.stageNumber,
      name: s.name,
      nameAr: s.nameAr,
      intervalDays: s.defaultIntervalDays,
      price: s.defaultPrice,
      cost: s.defaultCost,
    })),
  },
];

const today = getTodayString();

// Seed initial customers with realistic timeline dates
// Customer 1: Added 180 days ago -> Stages 1, 2, and 3 are due ON THE EXACT SAME DAY TODAY!
const cust1InstallDate = addDays(today, -180);
// Customer 2: Added 95 days ago -> Stage 1 is 5 days OVERDUE!
const cust2InstallDate = addDays(today, -95);
// Customer 3: Added 88 days ago -> Stage 1 is due in 2 days!
const cust3InstallDate = addDays(today, -88);
// Customer 4: Postponed maintenance for 10 days
const cust4InstallDate = addDays(today, -90);

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-101',
    name: 'Ahmed Mansour (أحمد منصور)',
    phone: '+20 101 234 5678',
    secondaryPhone: '+20 122 987 6543',
    address: 'Bldg 14, 5th Settlement, New Cairo, Apt 4B',
    cityOrArea: 'New Cairo',
    dateAdded: cust1InstallDate,
    filterModel: '7-Stage Reverse Osmosis (RO) System',
    notes: 'Ground floor, direct water line from rooftop pump. Prefers technician visits between 4 PM - 7 PM.',
    balance: 0,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Stage 1: PP Sediment',
        intervalDays: 90,
        // Last serviced 90 days ago (first change was at 90 days), now cycle 2 is due today (-180 + 90 = -90 serviced, -90 + 90 = today)
        lastServicedDate: addDays(today, -90),
        currentDueDate: today,
        customPrice: 15,
      },
      {
        stageNumber: 2,
        stageName: 'Stage 2: GAC Granular Carbon',
        intervalDays: 180,
        lastServicedDate: cust1InstallDate,
        currentDueDate: today,
        customPrice: 20,
      },
      {
        stageNumber: 3,
        stageName: 'Stage 3: CTO Carbon Block',
        intervalDays: 180,
        lastServicedDate: cust1InstallDate,
        currentDueDate: today,
        customPrice: 20,
      },
      {
        stageNumber: 4,
        stageName: 'Stage 4: RO Membrane',
        intervalDays: 720,
        lastServicedDate: cust1InstallDate,
        currentDueDate: calculateDueDate(cust1InstallDate, 720),
        customPrice: 65,
      },
      {
        stageNumber: 5,
        stageName: 'Stage 5: Post Carbon',
        intervalDays: 360,
        lastServicedDate: cust1InstallDate,
        currentDueDate: calculateDueDate(cust1InstallDate, 360),
        customPrice: 22,
      },
      {
        stageNumber: 6,
        stageName: 'Stage 6: Mineral / Bio-Ceramic',
        intervalDays: 360,
        lastServicedDate: cust1InstallDate,
        currentDueDate: calculateDueDate(cust1InstallDate, 360),
        customPrice: 25,
      },
      {
        stageNumber: 7,
        stageName: 'Stage 7: Alkaline / Infrared',
        intervalDays: 360,
        lastServicedDate: cust1InstallDate,
        currentDueDate: calculateDueDate(cust1InstallDate, 360),
        customPrice: 28,
      },
    ],
  },
  {
    id: 'CUST-102',
    name: 'Sarah Al-Khatib (سارة الخطيب)',
    phone: '+20 114 555 8901',
    address: '42 Al-Nasr St, Maadi, Villa 8',
    cityOrArea: 'Maadi',
    dateAdded: cust2InstallDate,
    filterModel: '5-Stage Standard RO System',
    notes: 'High water pressure area, valve pressure reducer installed. Stage 1 needs urgent inspection.',
    balance: 20, // Has outstanding 20 from previous service
    stages: [
      {
        stageNumber: 1,
        stageName: 'Stage 1: PP Sediment',
        intervalDays: 90,
        lastServicedDate: cust2InstallDate,
        currentDueDate: addDays(today, -5), // 5 days OVERDUE
        customPrice: 15,
      },
      {
        stageNumber: 2,
        stageName: 'Stage 2: GAC Granular Carbon',
        intervalDays: 180,
        lastServicedDate: cust2InstallDate,
        currentDueDate: calculateDueDate(cust2InstallDate, 180),
        customPrice: 20,
      },
      {
        stageNumber: 3,
        stageName: 'Stage 3: CTO Carbon Block',
        intervalDays: 180,
        lastServicedDate: cust2InstallDate,
        currentDueDate: calculateDueDate(cust2InstallDate, 180),
        customPrice: 20,
      },
      {
        stageNumber: 4,
        stageName: 'Stage 4: RO Membrane',
        intervalDays: 720,
        lastServicedDate: cust2InstallDate,
        currentDueDate: calculateDueDate(cust2InstallDate, 720),
        customPrice: 65,
      },
      {
        stageNumber: 5,
        stageName: 'Stage 5: Post Carbon',
        intervalDays: 360,
        lastServicedDate: cust2InstallDate,
        currentDueDate: calculateDueDate(cust2InstallDate, 360),
        customPrice: 22,
      },
    ],
  },
  {
    id: 'CUST-103',
    name: 'Dr. Mahmoud El-Sayed (د. محمود السيد)',
    phone: '+20 100 888 2314',
    address: 'Tower 3, Abbasia Square, Clinic 202',
    cityOrArea: 'Nasr City',
    dateAdded: cust3InstallDate,
    filterModel: '7-Stage Reverse Osmosis (RO) System',
    notes: 'Dental clinic autoclave supply water. Strict schedule requested.',
    balance: 0,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Stage 1: PP Sediment',
        intervalDays: 90,
        lastServicedDate: cust3InstallDate,
        currentDueDate: addDays(today, 2), // Due in 2 days
        customPrice: 15,
      },
      {
        stageNumber: 2,
        stageName: 'Stage 2: GAC Granular Carbon',
        intervalDays: 180,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 180),
        customPrice: 20,
      },
      {
        stageNumber: 3,
        stageName: 'Stage 3: CTO Carbon Block',
        intervalDays: 180,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 180),
        customPrice: 20,
      },
      {
        stageNumber: 4,
        stageName: 'Stage 4: RO Membrane',
        intervalDays: 720,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 720),
        customPrice: 65,
      },
      {
        stageNumber: 5,
        stageName: 'Stage 5: Post Carbon',
        intervalDays: 360,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 360),
        customPrice: 22,
      },
      {
        stageNumber: 6,
        stageName: 'Stage 6: Mineral / Bio-Ceramic',
        intervalDays: 360,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 360),
        customPrice: 25,
      },
      {
        stageNumber: 7,
        stageName: 'Stage 7: Alkaline / Infrared',
        intervalDays: 360,
        lastServicedDate: cust3InstallDate,
        currentDueDate: calculateDueDate(cust3InstallDate, 360),
        customPrice: 28,
      },
    ],
  },
  {
    id: 'CUST-104',
    name: 'Tarek Ibrahim (طارق إبراهيم)',
    phone: '+20 120 777 4455',
    address: 'Block 18, Beverly Hills, Sheikh Zayed',
    cityOrArea: 'Sheikh Zayed',
    dateAdded: cust4InstallDate,
    filterModel: '3-Stage Kitchen Filtration System',
    notes: 'Customer postponed maintenance because of vacation until next Monday.',
    balance: 0,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Stage 1: PP Sediment',
        intervalDays: 90,
        lastServicedDate: cust4InstallDate,
        currentDueDate: addDays(today, 5), // Postponed to 5 days from today
        postponedUntil: addDays(today, 5),
        postponeReason: 'Client requested postponement due to travel',
        customPrice: 15,
      },
      {
        stageNumber: 2,
        stageName: 'Stage 2: GAC Granular Carbon',
        intervalDays: 180,
        lastServicedDate: cust4InstallDate,
        currentDueDate: calculateDueDate(cust4InstallDate, 180),
        customPrice: 20,
      },
      {
        stageNumber: 3,
        stageName: 'Stage 3: CTO Carbon Block',
        intervalDays: 180,
        lastServicedDate: cust4InstallDate,
        currentDueDate: calculateDueDate(cust4InstallDate, 180),
        customPrice: 20,
      },
    ],
  },
];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  // Completed maintenance ticket example
  {
    id: 'TICK-901',
    customerId: 'CUST-101',
    customerName: 'Ahmed Mansour (أحمد منصور)',
    customerPhone: '+20 101 234 5678',
    customerAddress: 'Bldg 14, 5th Settlement, New Cairo, Apt 4B',
    stageNumber: 1,
    stageName: 'Stage 1: PP Sediment',
    scheduledDueDate: addDays(today, -90),
    status: 'completed',
    completedDate: addDays(today, -90),
    costCharged: 15,
    cartridgeCost: 5,
    paymentStatus: 'paid',
    amountPaid: 15,
    technicianName: 'Eng. Karim Samir',
    completionNotes: 'Replaced Stage 1 cotton cartridge. Checked water pressure: 60 PSI (Optimal).',
    createdAt: addDays(today, -90),
  },
  // Postponed maintenance ticket example
  {
    id: 'TICK-902',
    customerId: 'CUST-104',
    customerName: 'Tarek Ibrahim (طارق إبراهيم)',
    customerPhone: '+20 120 777 4455',
    customerAddress: 'Block 18, Beverly Hills, Sheikh Zayed',
    stageNumber: 1,
    stageName: 'Stage 1: PP Sediment',
    scheduledDueDate: today,
    status: 'postponed',
    postponedUntil: addDays(today, 5),
    postponeDays: 5,
    postponeReason: 'Client requested postponement due to travel',
    postponedAt: addDays(today, -1),
    costCharged: 15,
    cartridgeCost: 5,
    createdAt: addDays(today, -90),
  },
  // Deleted maintenance ticket example
  {
    id: 'TICK-903',
    customerId: 'CUST-102',
    customerName: 'Sarah Al-Khatib (سارة الخطيب)',
    customerPhone: '+20 114 555 8901',
    customerAddress: '42 Al-Nasr St, Maadi, Villa 8',
    stageNumber: 3,
    stageName: 'Stage 3: CTO Carbon Block',
    scheduledDueDate: addDays(today, -20),
    status: 'deleted',
    deletedAt: addDays(today, -15),
    deletionReason: 'Customer bought replacement cartridge from external store and changed it themselves.',
    createdAt: addDays(today, -100),
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'INV-00101',
    customerId: 'CUST-101',
    customerName: 'Ahmed Mansour (أحمد منصور)',
    customerPhone: '+20 101 234 5678',
    customerAddress: 'Bldg 14, 5th Settlement, New Cairo, Apt 4B',
    date: addDays(today, -90),
    items: [
      {
        description: 'Replacement: Stage 1 PP Sediment (5 Micron)',
        stageNumber: 1,
        quantity: 1,
        unitPrice: 15,
        total: 15,
      },
    ],
    subtotal: 15,
    discount: 0,
    total: 15,
    amountPaid: 15,
    balanceDue: 0,
    paymentMethod: 'Cash',
    notes: 'Water TDS level tested at 45 ppm. System working perfectly.',
  },
];
