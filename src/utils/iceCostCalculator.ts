export interface IceCalculationResult {
  // Fuel Metrics
  consumptionLPer100Km: number;
  consumptionKmPerL: number;
  fuelCostSenPerKm: number; // sen/km e.g. 11.28
  fuelCostPer100KmRm: number; // RM e.g. 11.28
  
  // Tank Info
  tankCapacityLiters: number;
  fullTankCostRm: number;
  fullTankEstimatedRangeKm: number;
  
  // Periodic Costs
  monthlyFuelCostRm: number;
  annualFuelCostRm: number;
  annualRoadTaxRm: number;
  annualMaintenanceRm: number;
  annualTotalRunningCostRm: number; // Fuel + RoadTax + Maintenance
  
  // 5-Year Ownership Metrics (TCO)
  carPurchasePriceRm: number;
  fiveYearFuelCostRm: number;
  fiveYearRoadTaxRm: number;
  fiveYearMaintenanceRm: number;
  fiveYearRunningCostRm: number; // Fuel + RoadTax + Maintenance
  fiveYearTotalCostRm: number; // Purchase Price + 5 Year Running Costs
}

/**
 * Calculates official Peninsular Malaysia Road Tax for private ICE vehicles based on engine cc
 */
export function calculateIceRoadTax(cc: number): number {
  if (cc <= 1000) return 20;
  if (cc <= 1200) return 55;
  if (cc <= 1400) return 70;
  if (cc <= 1600) return 90;
  if (cc <= 1800) {
    // Base 200 + 0.40 per cc over 1600
    return 200 + (cc - 1600) * 0.40;
  }
  if (cc <= 2000) {
    // Base 280 + 0.50 per cc over 1800
    return 280 + (cc - 1800) * 0.50;
  }
  if (cc <= 2500) {
    // Base 380 + 1.00 per cc over 2000
    return 380 + (cc - 2000) * 1.00;
  }
  // CC > 2500
  return 880 + (cc - 2500) * 2.50;
}

/**
 * Calculates complete ICE running & 5-year ownership costs
 */
export function calculateIceMetrics(params: {
  consumptionLPer100Km: number;
  fuelPricePerLiter: number;
  monthlyMileageKm: number;
  engineCc: number;
  carPriceRm: number;
  tankLiters?: number;
  annualMaintenanceRm?: number;
}): IceCalculationResult {
  const {
    consumptionLPer100Km,
    fuelPricePerLiter,
    monthlyMileageKm,
    engineCc,
    carPriceRm,
    tankLiters = 40,
    annualMaintenanceRm = 1200
  } = params;

  const validConsumption = Math.max(1, consumptionLPer100Km);
  const consumptionKmPerL = 100 / validConsumption;
  
  // Fuel cost per km = (L/100km * fuelPrice) / 100
  const fuelCostPerKmRm = (validConsumption * fuelPricePerLiter) / 100;
  const fuelCostSenPerKm = fuelCostPerKmRm * 100;
  const fuelCostPer100KmRm = validConsumption * fuelPricePerLiter;

  // Tank calculations
  const fullTankCostRm = tankLiters * fuelPricePerLiter;
  const fullTankEstimatedRangeKm = (tankLiters / validConsumption) * 100;

  // Monthly & Annual Fuel
  const monthlyFuelCostRm = (monthlyMileageKm * validConsumption / 100) * fuelPricePerLiter;
  const annualFuelCostRm = monthlyFuelCostRm * 12;

  // Road Tax
  const annualRoadTaxRm = Math.round(calculateIceRoadTax(engineCc));

  // Running costs
  const annualRunningCostRm = annualFuelCostRm + annualRoadTaxRm + annualMaintenanceRm;

  // 5-Year Ownership
  const fiveYearFuelCostRm = annualFuelCostRm * 5;
  const fiveYearRoadTaxRm = annualRoadTaxRm * 5;
  const fiveYearMaintenanceRm = annualMaintenanceRm * 5;
  const fiveYearRunningCostRm = fiveYearFuelCostRm + fiveYearRoadTaxRm + fiveYearMaintenanceRm;
  const fiveYearTotalCostRm = carPriceRm + fiveYearRunningCostRm;

  return {
    consumptionLPer100Km: validConsumption,
    consumptionKmPerL,
    fuelCostSenPerKm,
    fuelCostPer100KmRm,
    tankCapacityLiters: tankLiters,
    fullTankCostRm,
    fullTankEstimatedRangeKm,
    monthlyFuelCostRm,
    annualFuelCostRm,
    annualRoadTaxRm,
    annualMaintenanceRm,
    annualTotalRunningCostRm: annualRunningCostRm,
    carPurchasePriceRm: carPriceRm,
    fiveYearFuelCostRm,
    fiveYearRoadTaxRm,
    fiveYearMaintenanceRm,
    fiveYearRunningCostRm,
    fiveYearTotalCostRm
  };
}
