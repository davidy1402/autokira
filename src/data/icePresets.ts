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
}

export const ICE_PRESETS: IceVehiclePreset[] = [
  {
    id: 'myvi15',
    name: 'Perodua Myvi 1.5 H/AV',
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
    name: 'Proton Saga 1.3 Standard/Premium',
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
