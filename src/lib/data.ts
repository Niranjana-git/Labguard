

export const overviewStats = [
  {
    title: "Total Machines",
    value: "4",
    change: "+4 this month",
    icon: "Wrench",
  },
  {
    title: "Active Alerts",
    value: "2",
    change: "1 new alert today",
    icon: "AlertTriangle",
  },
  {
    title: "Safe Machines",
    value: "3",
    change: "75% of total",
    icon: "ShieldCheck",
  },
  {
    title: "Pending Maintenance",
    value: "1",
    change: "1 overdue",
    icon: "CalendarClock",
  },
  {
    title: "Total Technicians",
    value: "5",
    change: "+1 this week",
    icon: "Users",
  },
];

export const realtimeChartData = {
  vibration: Array.from({ length: 30 }, (_, i) => ({
    time: `T-${29 - i}`,
    value: Math.random() * 5 + (i > 25 ? Math.random() * 10 + 5 : 0), // spike at the end
  })),
  temperature: Array.from({ length: 30 }, (_, i) => ({
    time: `T-${29 - i}`,
    value: Math.random() * 10 + 60,
  })),
  voltage: Array.from({ length: 30 }, (_, i) => ({
    time: `T-${29 - i}`,
    value: 220 + (Math.random() - 0.5) * 10,
  })),
  current: Array.from({ length: 30 }, (_, i) => ({
    time: `T-${29 - i}`,
    value: 1.5 + (Math.random() - 0.5) * 0.5,
  })),
};

export const clusterDistributionData = [
  { name: "CSE", value: 1, fill: "hsl(var(--chart-1))" }, // blue
  { name: "ECE", value: 1, fill: "hsl(var(--destructive))" }, // red
  { name: "EEE", value: 1, fill: "hsl(var(--chart-5))" }, // orange
  { name: "MECH", value: 1, fill: "hsl(140 80% 40%)" }, // green
];

export const clusterOverviewData = [
    {
        name: "MECH",
        description: "Mechanical",
        machineCount: 1,
        faults: 1,
        status: "yellow",
        defaultMachine: "Lathe"
    },
    {
        name: "ECE",
        description: "Electronics & Comm.",
        machineCount: 1,
        faults: 0,
        status: "green",
        defaultMachine: "Spectrometer"
    },
    {
        name: "EEE",
        description: "Electrical & Electronics",
        machineCount: 1,
        faults: 1,
        status: "red",
        defaultMachine: "UV Lamp"
    },
    {
        name: "CSE",
        description: "Computer Science",
        machineCount: 1,
        faults: 0,
        status: "green",
        defaultMachine: "PC & Cloud Server"
    }
]

export const alertsData = [
  {
    id: "AL-001",
    machineName: "Lathe",
    machineId: "lathe-01",
    clusterId: "mech",
    severity: "High",
    message: "Vibration levels exceed threshold (15.2 mm/s). Immediate inspection required.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    isResolved: false,
  },
  {
    id: "AL-002",
    machineName: "Spectrometer",
    machineId: "spectrometer-01",
    clusterId: "ece",
    severity: "Medium",
    message: "Extruder temperature fluctuating.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    isResolved: false,
  },
  {
    id: "AL-003",
    machineName: "UV Lamp",
    machineId: "uv-lamp-01",
    clusterId: "eee",
    severity: "Low",
    message: "Coolant level at 20%.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isResolved: true,
  },
    {
    id: "AL-004",
    machineName: "PC & Cloud Server",
    machineId: "server-01",
    clusterId: "cse",
    severity: "High",
    message: "Earth line check failed. Machine unsafe to use.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isResolved: false,
  },
];


export const defaultMachinesData = {
  mech: [{ id: 'lathe-01', name: 'Lathe', brand: 'MechBrand', model: 'M-100', status: 'Safe', technician: 'Tech One', location: 'Workshop A', earthLine: true, clusterId: 'mech' }],
  ece: [{ id: 'spectrometer-01', name: 'Spectrometer', brand: 'ECE-Brand', model: 'S-200', status: 'Safe', technician: 'Tech Two', location: 'Lab B', earthLine: true, clusterId: 'ece' }],
  eee: [{ id: 'uv-lamp-01', name: 'UV Lamp', brand: 'EEE-Brand', model: 'UV-300', status: 'Unsafe', technician: 'Tech Three', location: 'Clean Room', earthLine: false, clusterId: 'eee' }],
  cse: [{ id: 'server-01', name: 'PC & Cloud Server', brand: 'CSE-Brand', model: 'CS-400', status: 'Maintenance', technician: 'Tech Four', location: 'Data Center', earthLine: true, clusterId: 'cse' }],
}
