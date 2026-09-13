import { create } from 'zustand';
import { PRESETS } from '../data/presets';
import { ICE_PRESETS } from '../data/icePresets';

export interface CalculatorState {
  // Mode Switch
  vehicleType: 'ev' | 'ice';
  setVehicleType: (vt: 'ev' | 'ice') => void;

  // EV State
  selectedPresetId: string;
  modelName: string;
  consumption: number;
  motorKw: number;
  batteryKwh: number;
  mileage: number;
  baselineKwh: number;
  petrolRm: number;
  petrolEngineCc: number;
  mode: 'landed' | 'condo';

  // ICE State
  selectedIcePresetId: string;
  iceModelName: string;
  iceConsumptionL: number;
  iceEngineCc: number;
  icePriceRm: number;
  iceTankLiters: number;
  iceAnnualMaintenanceRm: number;
  iceFuelType: 'ron95' | 'ron95_unsub' | 'ron97' | 'diesel';
  iceCustomFuelPrice: number;
  selectedIceCompareId: string;

  // Global UI
  language: 'en' | 'zh';
  theme: 'dark' | 'light';
  advanced: {
    petrolPrice: number;
    fuelEconomy: number;
    chargingLoss: number;
    publicDcRate: number;
    touEnabled: boolean;
  };

  // Actions
  setPreset: (presetId: string) => void;
  setModelName: (name: string) => void;
  setConsumption: (c: number) => void;
  setMileage: (m: number) => void;
  setBaselineKwh: (k: number) => void;
  setPetrolRm: (p: number) => void;
  setPetrolEngineCc: (cc: number) => void;
  setMode: (m: 'landed' | 'condo') => void;

  // ICE Actions
  setIcePreset: (presetId: string) => void;
  setIceModelName: (name: string) => void;
  setIceConsumptionL: (c: number) => void;
  setIceEngineCc: (cc: number) => void;
  setIcePriceRm: (price: number) => void;
  setIceTankLiters: (tank: number) => void;
  setIceAnnualMaintenanceRm: (m: number) => void;
  setIceFuelType: (f: 'ron95' | 'ron95_unsub' | 'ron97' | 'diesel') => void;
  setIceCompareId: (id: string) => void;

  setLanguage: (l: 'en' | 'zh') => void;
  setTheme: (t: 'dark' | 'light') => void;
  updateAdvanced: (updates: Partial<CalculatorState['advanced']>) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
  }
  return 'dark';
};

const getInitialVehicleType = (): 'ev' | 'ice' => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('vehicleType');
      if (saved === 'ev' || saved === 'ice') return saved;
    } catch {}
  }
  return 'ev';
};

const getInitialLanguage = (): 'en' | 'zh' => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'zh') return saved;
    } catch {}
  }
  return 'en';
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  // Mode Switch
  vehicleType: getInitialVehicleType(),
  setVehicleType: (vt) => {
    try {
      localStorage.setItem('vehicleType', vt);
    } catch {}
    set({ vehicleType: vt });
  },

  // EV State
  selectedPresetId: 'emas7',
  modelName: 'Proton e.MAS 7',
  consumption: 14.5,
  motorKw: 160,
  batteryKwh: 49.52,
  mileage: 1477,
  baselineKwh: 501,
  petrolRm: 210,
  petrolEngineCc: 1500,
  mode: 'landed',

  // ICE State
  selectedIcePresetId: 'myvi15',
  iceModelName: 'Perodua Myvi 1.5 H/AV',
  iceConsumptionL: 5.5,
  iceEngineCc: 1496,
  icePriceRm: 54000,
  iceTankLiters: 36,
  iceAnnualMaintenanceRm: 1200,
  iceFuelType: 'ron95',
  iceCustomFuelPrice: 2.05,
  selectedIceCompareId: 'bezza13',

  // Global UI
  language: getInitialLanguage(),
  theme: getInitialTheme(),
  advanced: {
    petrolPrice: 1.99,
    fuelEconomy: 14,
    chargingLoss: 0.1, // 10%
    publicDcRate: 1.4,
    touEnabled: false,
  },

  // EV Setters
  setPreset: (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({
        selectedPresetId: preset.id,
        modelName: preset.name,
        consumption: preset.consumption,
        motorKw: preset.motorKw,
        batteryKwh: preset.batteryKwh
      });
    }
  },
  setModelName: (name) => set({ modelName: name }),
  setConsumption: (c) => set({ consumption: c }),
  setMileage: (m) => set({ mileage: m }),
  setBaselineKwh: (k) => set({ baselineKwh: k }),
  setPetrolRm: (p) => set({ petrolRm: p }),
  setPetrolEngineCc: (cc) => set({ petrolEngineCc: cc }),
  setMode: (m) => set({ mode: m }),

  // ICE Setters
  setIcePreset: (presetId: string) => {
    const preset = ICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({
        selectedIcePresetId: preset.id,
        iceModelName: preset.name,
        iceConsumptionL: preset.consumptionLPer100Km,
        iceEngineCc: preset.engineCc,
        icePriceRm: preset.priceRm,
        iceTankLiters: preset.fuelTankLiters,
        iceAnnualMaintenanceRm: preset.annualMaintenanceEstRm
      });
    }
  },
  setIceModelName: (name) => set({ iceModelName: name }),
  setIceConsumptionL: (c) => set({ iceConsumptionL: c }),
  setIceEngineCc: (cc) => set({ iceEngineCc: cc }),
  setIcePriceRm: (price) => set({ icePriceRm: price }),
  setIceTankLiters: (tank) => set({ iceTankLiters: tank }),
  setIceAnnualMaintenanceRm: (m) => set({ iceAnnualMaintenanceRm: m }),
  setIceFuelType: (f) => set({ iceFuelType: f }),
  setIceCompareId: (id) => set({ selectedIceCompareId: id }),

  setLanguage: (l) => {
    try {
      localStorage.setItem('language', l);
    } catch {}
    set({ language: l });
  },
  setTheme: (t) => {
    try {
      localStorage.setItem('theme', t);
    } catch {}
    set({ theme: t });
  },
  updateAdvanced: (updates) =>
    set((state) => ({ advanced: { ...state.advanced, ...updates } })),
}));

