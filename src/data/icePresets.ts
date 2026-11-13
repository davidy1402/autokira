export interface IceVehiclePreset {
  id: string;
  name: string;
  brand: string;
  consumptionLPer100Km: number; // e.g. 5.5
  engineCc: number; // e.g. 1496
  priceRm: number; // e.g. 54000
  fuelTankLiters: number; // e.g. 36
  annualRoadTaxRm: number; // e.g. 90
  annualMaintenanceEstRm: number; // e.g. 1200
  tag?: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export const ICE_PRESETS: IceVehiclePreset[] = [
  // Manufacturer fuel economy; servicing and purchase prices remain editable estimates.
  { id: 'alza15dcvt2022', name: 'Perodua Alza 1.5 X/H/AV D-CVT (2022 generation)', brand: 'Perodua', consumptionLPer100Km: 4.55, engineCc: 1496, priceRm: 68000, fuelTankLiters: 43, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1400, sourceUrl: 'https://www.perodua.com.my/files/Alza_Brochure.pdf', sourceLabel: 'Perodua, MDC 22.0 km/L with Eco Idle' },
  { id: 's7015td2026', name: 'Proton S70 1.5 Turbo DCT (2026)', brand: 'Proton', consumptionLPer100Km: 5.7, engineCc: 1499, priceRm: 73800, fuelTankLiters: 50, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1600, sourceUrl: 'https://www.proton.com/happenings/2026/february/proton-defines-malaysia-s-sporty-sedan-with-the-2026-proton-s70', sourceLabel: 'Proton, 5.7 L/100 km' },
  { id: 'hrv15s2025', name: 'Honda HR-V 1.5 S CVT (2025 update)', brand: 'Honda', consumptionLPer100Km: 5.9, engineCc: 1498, priceRm: 115900, fuelTankLiters: 40, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1800, sourceUrl: 'https://www.honda.com.my/asset/pixelvault/2025-07/cce1ed2b3285e10c0ac4d94ea819b32b31152e2185520.pdf', sourceLabel: 'Honda Malaysia, 5.9 L/100 km' },
  { id: 'hrv15turbo2025', name: 'Honda HR-V 1.5 Turbo E/V CVT (2025 update)', brand: 'Honda', consumptionLPer100Km: 6.5, engineCc: 1498, priceRm: 130000, fuelTankLiters: 40, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1800, sourceUrl: 'https://www.honda.com.my/asset/pixelvault/2025-07/cce1ed2b3285e10c0ac4d94ea819b32b31152e2185520.pdf', sourceLabel: 'Honda Malaysia, 6.5 L/100 km' },
  { id: 'hrv15hev2025', name: 'Honda HR-V 1.5 e:HEV RS Hybrid (2025 update)', brand: 'Honda', consumptionLPer100Km: 4.1, engineCc: 1498, priceRm: 145000, fuelTankLiters: 40, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1800, sourceUrl: 'https://www.honda.com.my/asset/pixelvault/2025-07/cce1ed2b3285e10c0ac4d94ea819b32b31152e2185520.pdf', sourceLabel: 'Honda Malaysia, 4.1 L/100 km' },
  { id: 'corollacrosshev2024', name: 'Toyota Corolla Cross 1.8 Hybrid (2024 update)', brand: 'Toyota', consumptionLPer100Km: 4.29, engineCc: 1798, priceRm: 140800, fuelTankLiters: 36, annualRoadTaxRm: 280, annualMaintenanceEstRm: 2000, sourceUrl: 'https://www.toyota.com.my/content/dam/malaysia/model-brochures/brochures/corolla-cross-hev/2024/corolla-cross-hev-brochure-v2.pdf', sourceLabel: 'Toyota Malaysia, 23.3 km/L' },
  { id: 'axia10gxdcvt', name: 'Perodua Axia 1.0 G/X D-CVT (2023 generation)', brand: 'Perodua', consumptionLPer100Km: 3.95, engineCc: 998, priceRm: 33900, fuelTankLiters: 36, annualRoadTaxRm: 20, annualMaintenanceEstRm: 900, sourceUrl: 'https://www.perodua.com.my/our-models/hatchback/axia', sourceLabel: 'Perodua, MDC 25.3 km/L' },
  { id: 'axia10seavdcvt', name: 'Perodua Axia 1.0 SE/AV D-CVT (2023 generation)', brand: 'Perodua', consumptionLPer100Km: 3.65, engineCc: 998, priceRm: 43000, fuelTankLiters: 36, annualRoadTaxRm: 20, annualMaintenanceEstRm: 900, sourceUrl: 'https://www.perodua.com.my/our-models/hatchback/axia', sourceLabel: 'Perodua, MDC 27.4 km/L' },
  { id: 'myvi15auto2017', name: 'Perodua Myvi 1.5 H/AV Automatic (2017 generation)', brand: 'Perodua', consumptionLPer100Km: 4.98, engineCc: 1496, priceRm: 50000, fuelTankLiters: 36, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1200, sourceUrl: 'https://www.perodua.com.my/files/brochure_myvi.pdf', sourceLabel: 'Perodua, eco-driving 20.1 km/L' },
  { id: 'myvi13dcvt', name: 'Perodua Myvi 1.3 G D-CVT (2021 generation)', brand: 'Perodua', consumptionLPer100Km: 4.5, engineCc: 1329, priceRm: 46500, fuelTankLiters: 36, annualRoadTaxRm: 70, annualMaintenanceEstRm: 1100, sourceUrl: 'https://www.perodua.com.my/files/Myvi_Brochure.pdf?v=1758163069', sourceLabel: 'Perodua, eco-driving 22.2 km/L' },
  { id: 'myvi15dcvt', name: 'Perodua Myvi 1.5 X/H/AV D-CVT (2021 generation)', brand: 'Perodua', consumptionLPer100Km: 4.74, engineCc: 1496, priceRm: 54000, fuelTankLiters: 36, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1200, sourceUrl: 'https://www.perodua.com.my/files/Myvi_Brochure.pdf?v=1758163069', sourceLabel: 'Perodua, eco-driving 21.1 km/L' },
  { id: 'bezza10auto', name: 'Perodua Bezza 1.0 G Automatic (2020 generation)', brand: 'Perodua', consumptionLPer100Km: 4.69, engineCc: 998, priceRm: 38000, fuelTankLiters: 36, annualRoadTaxRm: 20, annualMaintenanceEstRm: 1000, sourceUrl: 'https://www.perodua.com.my/files/brochure_bezza.pdf', sourceLabel: 'Perodua, eco-driving 21.3 km/L' },
  { id: 'bezza13x', name: 'Perodua Bezza 1.3 X Automatic (2020 generation)', brand: 'Perodua', consumptionLPer100Km: 4.76, engineCc: 1329, priceRm: 44000, fuelTankLiters: 36, annualRoadTaxRm: 70, annualMaintenanceEstRm: 1100, sourceUrl: 'https://www.perodua.com.my/files/brochure_bezza.pdf', sourceLabel: 'Perodua, eco-driving 21.0 km/L' },
  { id: 'bezza13av', name: 'Perodua Bezza 1.3 AV Automatic (2020 generation)', brand: 'Perodua', consumptionLPer100Km: 4.55, engineCc: 1329, priceRm: 50000, fuelTankLiters: 36, annualRoadTaxRm: 70, annualMaintenanceEstRm: 1100, sourceUrl: 'https://www.perodua.com.my/files/brochure_bezza.pdf', sourceLabel: 'Perodua, eco-driving 22.0 km/L' },
  { id: 'ativa10dcvt', name: 'Perodua Ativa 1.0 Turbo D-CVT', brand: 'Perodua', consumptionLPer100Km: 5.29, engineCc: 998, priceRm: 62500, fuelTankLiters: 36, annualRoadTaxRm: 20, annualMaintenanceEstRm: 1200, sourceUrl: 'https://www.perodua.com.my/files/Ativa_Brochure.pdf', sourceLabel: 'Perodua, eco-driving 18.9 km/L' },
  { id: 'aruz15auto', name: 'Perodua Aruz 1.5 X/AV Automatic', brand: 'Perodua', consumptionLPer100Km: 6.41, engineCc: 1496, priceRm: 68900, fuelTankLiters: 45, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1400, sourceUrl: 'https://www.perodua.com.my/files/Aruz_Brochure.pdf', sourceLabel: 'Perodua, eco-driving 15.6 km/L' },
  { id: 'saga15cvt2025', name: 'Proton Saga 1.5 Executive/Premium CVT (2025 generation)', brand: 'Proton', consumptionLPer100Km: 4.9, engineCc: 1499, priceRm: 44990, fuelTankLiters: 40, annualRoadTaxRm: 90, annualMaintenanceEstRm: 1200, sourceUrl: 'https://www.proton.com/happenings/2025/november/the-all-new-saga-is-here-malaysia-s-iconic-sedan-drives-nation-into-a-new-era', sourceLabel: 'Proton, Malaysia Driving Cycle' },
  {
    id: 'myvi15',
    name: 'Perodua Myvi 1.5 H/AV (year unspecified)',
    brand: 'Perodua',
    consumptionLPer100Km: 5.5,
    engineCc: 1496,
    priceRm: 54000,
    fuelTankLiters: 36,
    annualRoadTaxRm: 90,
    annualMaintenanceEstRm: 1200,
    tag: 'King of Highway'
  },
  {
    id: 'bezza13',
    name: 'Perodua Bezza 1.3 X/AV',
    brand: 'Perodua',
    consumptionLPer100Km: 4.8,
    engineCc: 1329,
    priceRm: 44000,
    fuelTankLiters: 36,
    annualRoadTaxRm: 70,
    annualMaintenanceEstRm: 1100,
    tag: 'Uber/Grab Favourite'
  },
  {
    id: 'axia10',
    name: 'Perodua Axia 1.0 G/X',
    brand: 'Perodua',
    consumptionLPer100Km: 4.5,
    engineCc: 998,
    priceRm: 38600,
    fuelTankLiters: 36,
    annualRoadTaxRm: 20,
    annualMaintenanceEstRm: 900,
    tag: 'Lowest TCO'
  },
  {
    id: 'saga13',
    name: 'Proton Saga 1.3 Standard/Premium (older model)',
    brand: 'Proton',
    consumptionLPer100Km: 6.7,
    engineCc: 1332,
    priceRm: 39800,
    fuelTankLiters: 40,
    annualRoadTaxRm: 70,
    annualMaintenanceEstRm: 1100,
    tag: 'Budget Sedan'
  },
  {
    id: 'vios15',
    name: 'Toyota Vios 1.5 E/G',
    brand: 'Toyota',
    consumptionLPer100Km: 5.2,
    engineCc: 1496,
    priceRm: 89600,
    fuelTankLiters: 40,
    annualRoadTaxRm: 90,
    annualMaintenanceEstRm: 1400,
    tag: 'Reliable B-Segment'
  },
  {
    id: 'city15',
    name: 'Honda City 1.5 E/V',
    brand: 'Honda',
    consumptionLPer100Km: 5.6,
    engineCc: 1498,
    priceRm: 84900,
    fuelTankLiters: 40,
    annualRoadTaxRm: 90,
    annualMaintenanceEstRm: 1500,
    tag: 'Comfort Sedan'
  },
  {
    id: 'x50',
    name: 'Proton X50 1.5T Executive/Premium',
    brand: 'Proton',
    consumptionLPer100Km: 6.8,
    engineCc: 1477,
    priceRm: 86300,
    fuelTankLiters: 45,
    annualRoadTaxRm: 90,
    annualMaintenanceEstRm: 1600,
    tag: 'Compact Turbo SUV'
  },
  {
    id: 'civic15',
    name: 'Honda Civic 1.5 VTEC Turbo',
    brand: 'Honda',
    consumptionLPer100Km: 6.3,
    engineCc: 1498,
    priceRm: 131900,
    fuelTankLiters: 47,
    annualRoadTaxRm: 90,
    annualMaintenanceEstRm: 1800,
    tag: 'C-Segment Turbo'
  },
  {
    id: 'mazda3',
    name: 'Mazda 3 Sedan 2.0 High Plus',
    brand: 'Mazda',
    consumptionLPer100Km: 6.3,
    engineCc: 1998,
    priceRm: 166000,
    fuelTankLiters: 51,
    annualRoadTaxRm: 380,
    annualMaintenanceEstRm: 2200,
    tag: 'Japanese Luxury'
  }
];
