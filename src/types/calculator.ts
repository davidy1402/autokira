export interface SavedVehicle {
  id: string;
  name: string;
  consumptionKwhPer100Km: number;
  motorPowerKw?: number;
  batteryCapacityKwh?: number;
  savedAt: number;
}

export interface VehiclePreset {
  id: string;
  name: string;
  brand: string;
  consumptionKwhPer100Km: number;
  batteryCapacityKwh: number;
  motorPowerKw: number;
  claimedRangeWltpKm: number;
  priceEstimateRm: string;
  tag?: string;
}

export interface UserInputs {
  modelName: string;
  consumptionKwhPer100Km: number;
  motorPowerKw: number; // e.g. 160 kW for Proton e.MAS 7
  monthlyMileageKm: number;
  baselineHomeKwh: number; // 默认 501 kWh（David 家最新 TNB 真实账单）
  baselineHomeBillRm: number; // 对应计算出的账单金额（如 RM 172.70）
  fatherPetrolCostRm: number; // 爸爸每月固定油费 RM 210
  petrolEngineCc: number; // 默认 1500 cc (1.5L ICE)

  // 充电模式切换: 'mixed' (90%家充+10%外充) vs 'home_only' (100%全家充) vs 'public_only' (100%快充)
  chargingMode: 'mixed' | 'home_only' | 'public_only';

  // 核心参数
  petrolPricePerLiter: number; // RM 1.99 / L
  petrolFuelEfficiencyKmPerL: number; // 14.0 km/L (~7.14 L/100km)
  chargingEfficiency: number; // 0.90 (10% AC 充电与线损)
  homeChargingRatio: number; // 0.90 for mixed, 1.0 for home_only
  publicDcPricePerKwh: number; // RM 1.40 / kWh
  afaRateSen: number; // 3.80 sen / kWh
  isTouEnabled: boolean; // Time of Use
  touOffPeakRateSen: number; // 28.00 sen / kWh
  batteryCapacityKwh: number;
}

export interface TnbBillBreakdown {
  kwh: number;
  baseGeneration: number;
  baseCapacity: number;
  baseNetwork: number;
  baseEnergySubtotal: number;
  eeiRebateSen: number; // sen/kWh rebate
  eeiRebateAmount: number; // RM
  netBaseEnergy: number; // Base - EEI
  retailCharge: number;
  isRetailChargeWaived: boolean;
  afaSurcharge: number;
  isAfaWaived: boolean;
  kwtbbFund: number; // 1.6% (if kWh > 300)
  sstTax: number; // 8% (on units > 600 kWh)
  totalAmount: number;
  isOver600Threshold: boolean;
  isOver1500Threshold: boolean;
  effectiveRatePerKwh: number;
}

export interface EvCalculationResult {
  // Energy consumption
  monthlyDistanceKm: number;
  evMonthlyNetKwh: number; // 车端标称消耗 (kWh)
  evMonthlyGrossKwh: number; // 电网端实际消耗含 10% 损耗 (kWh)
  evHomeChargingKwh: number; // 家充消耗 (kWh)
  evPublicChargingKwh: number; // 外充消耗 (kWh)

  // Bill breakdowns
  baselineBill: TnbBillBreakdown;
  newCombinedBill: TnbBillBreakdown;
  marginalHomeElectricityCost: number; // newCombinedBill.total - baselineBill.total
  publicChargingCost: number;
  totalEvChargingCost: number; // marginalHomeElectricityCost + publicChargingCost

  // True Marginal electricity rate per kWh for EV
  marginalEffectiveRatePerKwh: number;

  // Single full charge cost based on marginal rate
  singleFullChargeMarginalCost: number;

  // Petrol comparison
  petrolEquivalentDistanceKm: number;
  petrolMonthlyCost: number;
  petrolCostPer100Km: number;

  // Comparison metrics
  oldTotalMonthlyEnergyExpense: number; // baselineBill + petrol
  newTotalMonthlyEnergyExpense: number; // newCombinedBill + publicCharging
  monthlyNetSavings: number;
  yearlyNetSavings: number;
  fiveYearNetSavings: number;

  // Per 100km metrics
  evCostPer100Km: number;
  savingsRatioPerKm: number; // percentage cheaper than petrol

  // Road Tax Metrics (2026 Malaysia JPJ Official Structure)
  evRoadTaxAnnualRm: number;
  petrolRoadTaxAnnualRm: number;
  annualRoadTaxDifferenceRm: number;
  fiveYearTcoWithRoadTaxSavings: number;

  // Threshold alerts
  crossed600Threshold: boolean;
  thresholdJumpPenaltyRm: number;
}

export type { IceVehiclePreset } from '../data/icePresets';
export type { IceCalculationResult } from '../utils/iceCostCalculator';

