/**
 * Official Malaysia JPJ Electric Vehicle (EV) Road Tax Formula (Effective 1 January 2026)
 * Source: Ministry of Transport Malaysia (MOT) Gazette
 * Based on total maximum electric motor power output in kilowatts (kW).
 */
export function calculateEvRoadTax(powerKw: number): {
  roadTaxRm: number;
  powerBand: string;
  rateDescription: string;
} {
  if (powerKw <= 0) {
    return {
      roadTaxRm: 0,
      powerBand: '0 kW',
      rateDescription: 'RM 0.00'
    };
  }

  const kw = Math.round(powerKw * 10) / 10;

  // Band 1: <= 50 kW -> Flat RM 20
  if (kw <= 50) {
    return {
      roadTaxRm: 20,
      powerBand: '≤ 50 kW',
      rateDescription: 'Flat RM 20 / year'
    };
  }

  // Band 2: 50.1 - 100 kW -> Base RM 20 + RM 10 per 10 kW block
  if (kw <= 100) {
    const excess = kw - 50;
    const blocks = Math.ceil(excess / 10);
    const tax = 20 + blocks * 10;
    return {
      roadTaxRm: tax,
      powerBand: '50.1 - 100 kW',
      rateDescription: `Base RM 20 + ${blocks} × RM 10`
    };
  }

  // Band 3: 100.1 - 210 kW -> Base RM 80 + RM 20 per 10 kW block
  if (kw <= 210) {
    const excess = kw - 100;
    const blocks = Math.ceil(excess / 10);
    const tax = 80 + (blocks - 1) * 20; // 100.1-110 = RM 80, 110.1-120 = RM 100, ..., 150.1-160 = RM 180
    return {
      roadTaxRm: tax,
      powerBand: '100.1 - 210 kW',
      rateDescription: `Base RM 80 + ${blocks - 1} × RM 20`
    };
  }

  // Band 4: 210.1 - 310 kW -> Base RM 305 + RM 30 per 10 kW block
  if (kw <= 310) {
    const excess = kw - 210;
    const blocks = Math.ceil(excess / 10);
    const tax = 305 + (blocks - 1) * 30;
    return {
      roadTaxRm: tax,
      powerBand: '210.1 - 310 kW',
      rateDescription: `Base RM 305 + ${blocks - 1} × RM 30`
    };
  }

  // Band 5: 310.1 - 410 kW -> Base RM 615 + RM 50 per 10 kW block
  if (kw <= 410) {
    const excess = kw - 310;
    const blocks = Math.ceil(excess / 10);
    const tax = 615 + (blocks - 1) * 50;
    return {
      roadTaxRm: tax,
      powerBand: '310.1 - 410 kW',
      rateDescription: `Base RM 615 + ${blocks - 1} × RM 50`
    };
  }

  // Band 6: 410.1 - 510 kW -> Base RM 1,140 + RM 100 per 10 kW block
  if (kw <= 510) {
    const excess = kw - 410;
    const blocks = Math.ceil(excess / 10);
    const tax = 1140 + (blocks - 1) * 100;
    return {
      roadTaxRm: tax,
      powerBand: '410.1 - 510 kW',
      rateDescription: `Base RM 1,140 + ${blocks - 1} × RM 100`
    };
  }

  // Band 7: > 510 kW -> Base RM 2,160 + RM 200 per 10 kW block
  const excess = kw - 510;
  const blocks = Math.ceil(excess / 10);
  const tax = 2160 + (blocks - 1) * 200;
  return {
    roadTaxRm: tax,
    powerBand: '> 510 kW',
    rateDescription: `Base RM 2,160 + ${blocks - 1} × RM 200`
  };
}

/**
 * Standard Malaysia Peninsular Petrol (ICE) Road Tax for Private Saloon / Hatch / SUV
 */
export function calculatePetrolRoadTax(engineCc: number): {
  roadTaxRm: number;
  engineBand: string;
} {
  if (engineCc <= 1000) return { roadTaxRm: 20, engineBand: '≤ 1,000 cc' };
  if (engineCc <= 1200) return { roadTaxRm: 55, engineBand: '1,001 - 1,200 cc' };
  if (engineCc <= 1400) return { roadTaxRm: 70, engineBand: '1,201 - 1,400 cc' };
  if (engineCc <= 1600) return { roadTaxRm: 90, engineBand: '1,401 - 1,600 cc (1.5L / 1.6L)' };
  if (engineCc <= 1800) {
    const excess = engineCc - 1600;
    return { roadTaxRm: Math.round(200 + excess * 0.40), engineBand: '1,601 - 1,800 cc (1.8L)' };
  }
  if (engineCc <= 2000) {
    const excess = engineCc - 1800;
    return { roadTaxRm: Math.round(280 + excess * 0.50), engineBand: '1,801 - 2,000 cc (2.0L)' };
  }
  if (engineCc <= 2500) {
    const excess = engineCc - 2000;
    return { roadTaxRm: Math.round(380 + excess * 1.00), engineBand: '2,001 - 2,500 cc (2.5L)' };
  }
  const excess = engineCc - 2500;
  return { roadTaxRm: Math.round(880 + excess * 2.50), engineBand: '> 2,500 cc (3.0L+)' };
}
