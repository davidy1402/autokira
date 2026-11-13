import { create } from 'zustand';
import { PRESETS } from '../data/presets';
import { ICE_PRESETS } from '../data/icePresets';
import { estimateKwhFromTnbBill } from '../utils/tnbTariff';

export interface CalculatorState {
  // Mode Switch
  vehicleType: 'ev' | 'ice';
  setVehicleType: (vt: 'ev' | 'ice') => void;

  // EV State
  selectedPresetId: string;
  modelName: string;
  evEstimateBasis: string;
  consumption: number;
  motorKw: number;
  batteryKwh: number;
  mileage: number;
  baselineKwh: number;
  baselineBillRm: number | null;
  petrolRm: number;
  petrolEngineCc: number;
  mode: 'landed' | 'condo';

  // ICE State
  selectedIcePresetId: string;
  iceModelName: string;
  iceEstimateBasis: string;
  iceConsumptionL: number;
  iceEngineCc: number;
  icePriceRm: number;
  iceTankLiters: number;
  iceAnnualMaintenanceRm: number;
  iceFuelType: 'budi_madani' | 'ron95' | 'ron95_unsub' | 'ron97' | 'diesel';
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
  setEvEstimateBasis: (name: string) => void;
  setConsumption: (c: number) => void;
  setMileage: (m: number) => void;
  setBaselineKwh: (k: number) => void;
  setBaselineBillRm: (rm: number) => void;
  setPetrolRm: (p: number) => void;
  setPetrolEngineCc: (cc: number) => void;
  setMode: (m: 'landed' | 'condo') => void;

  // ICE Actions
  setIcePreset: (presetId: string) => void;
  setIceModelName: (name: string) => void;
  setIceEstimateBasis: (name: string) => void;
  setIceConsumptionL: (c: number) => void;
  setIceEngineCc: (cc: number) => void;
  setIcePriceRm: (price: number) => void;
  setIceTankLiters: (tank: number) => void;
  setIceAnnualMaintenanceRm: (m: number) => void;
  setIceFuelType: (f: 'budi_madani' | 'ron95' | 'ron95_unsub' | 'ron97' | 'diesel') => void;
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
  return 'light';
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

const initialEv = PRESETS[0];
const initialIce = ICE_PRESETS.find(p => p.id === 'myvi15') ?? ICE_PRESETS[0];

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
  selectedPresetId: initialEv.id,
  modelName: initialEv.name,
  evEstimateBasis: '',
  consumption: initialEv.consumption,
  motorKw: initialEv.motorKw,
  batteryKwh: initialEv.batteryKwh,
  mileage: 1477,
  baselineKwh: 501,
  baselineBillRm: null,
  petrolRm: 210,
  petrolEngineCc: 1500,
  mode: 'landed',

  // ICE State
  selectedIcePresetId: initialIce.id,
  iceModelName: initialIce.name,
  iceEstimateBasis: '',
  iceConsumptionL: initialIce.consumptionLPer100Km,
  iceEngineCc: initialIce.engineCc,
  icePriceRm: initialIce.priceRm,
  iceTankLiters: initialIce.fuelTankLiters,
  iceAnnualMaintenanceRm: initialIce.annualMaintenanceEstRm,
  iceFuelType: 'budi_madani',
  iceCustomFuelPrice: 1.99,
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
        evEstimateBasis: '',
        consumption: preset.consumption,
        motorKw: preset.motorKw,
        batteryKwh: preset.batteryKwh
      });
    }
  },
  setModelName: (name) => set({ modelName: name }),
  setEvEstimateBasis: (name) => set({ evEstimateBasis: name }),
  setConsumption: (c) => set({ consumption: c }),
  setMileage: (m) => set({ mileage: m }),
  setBaselineKwh: (k) => set({ baselineKwh: k, baselineBillRm: null }),
  setBaselineBillRm: (rm) => set({ baselineBillRm: rm, baselineKwh: estimateKwhFromTnbBill(rm) }),
  setPetrolRm: (p) => set({ petrolRm: p }),
  setPetrolEngineCc: (cc) => set({ petrolEngineCc: cc }),
  setMode: (m) => set({ mode: m }),

  // ICE Setters
  setIcePreset: (presetId: string) => {
    const preset = ICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set((state) => ({
        selectedIcePresetId: preset.id,
        iceModelName: preset.name,
        iceEstimateBasis: '',
        iceConsumptionL: preset.consumptionLPer100Km,
        iceEngineCc: preset.engineCc,
        icePriceRm: preset.priceRm,
        iceTankLiters: preset.fuelTankLiters,
        iceAnnualMaintenanceRm: preset.annualMaintenanceEstRm,
        iceFuelType: preset.fuelType === 'diesel' ? 'diesel' : (state.iceFuelType === 'diesel' ? 'budi_madani' : state.iceFuelType)
      }));
    }
  },
  setIceModelName: (name) => set({ iceModelName: name }),
  setIceEstimateBasis: (name) => set({ iceEstimateBasis: name }),
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

// Remember vehicle details on this device, including values the driver adjusted.
try {
  const raw = localStorage.getItem('autokira.vehicleDetails.v1');
  const saved: unknown = raw ? JSON.parse(raw) : null;
  if (saved && typeof saved === 'object' && 'ev' in saved && 'ice' in saved) {
    const validName = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 120;
    const validNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 100000000;
    const ev = saved.ev;
    if (ev && typeof ev === 'object' && 'id' in ev && 'name' in ev && 'consumption' in ev && 'motorKw' in ev && 'batteryKwh' in ev &&
      typeof ev.id === 'string' && PRESETS.some(p => p.id === ev.id) && validName(ev.name) && validNumber(ev.consumption) && ev.consumption > 0 && validNumber(ev.motorKw) && validNumber(ev.batteryKwh)) {
      useCalculatorStore.setState({ selectedPresetId: ev.id, modelName: ev.name, evEstimateBasis: 'estimateBasis' in ev && validName(ev.estimateBasis) ? ev.estimateBasis : '', consumption: ev.consumption, motorKw: ev.motorKw, batteryKwh: ev.batteryKwh });
    }
    const ice = saved.ice;
    if (ice && typeof ice === 'object' && 'id' in ice && 'name' in ice && 'consumption' in ice && 'engineCc' in ice && 'price' in ice && 'tank' in ice && 'maintenance' in ice &&
      typeof ice.id === 'string' && ICE_PRESETS.some(p => p.id === ice.id) && validName(ice.name) && validNumber(ice.consumption) && ice.consumption > 0 && validNumber(ice.engineCc) && validNumber(ice.price) && validNumber(ice.tank) && validNumber(ice.maintenance)) {
      useCalculatorStore.setState({ selectedIcePresetId: ice.id, iceModelName: ice.name, iceEstimateBasis: 'estimateBasis' in ice && validName(ice.estimateBasis) ? ice.estimateBasis : '', iceConsumptionL: ice.consumption, iceEngineCc: ice.engineCc, icePriceRm: ice.price, iceTankLiters: ice.tank, iceAnnualMaintenanceRm: ice.maintenance });
    }
  }
} catch { /* Storage may be unavailable or contain an older invalid record. */ }

useCalculatorStore.subscribe((state, previous) => {
  if (state.evEstimateBasis === previous.evEstimateBasis && state.iceEstimateBasis === previous.iceEstimateBasis && state.selectedPresetId === previous.selectedPresetId && state.modelName === previous.modelName && state.consumption === previous.consumption && state.motorKw === previous.motorKw && state.batteryKwh === previous.batteryKwh &&
      state.selectedIcePresetId === previous.selectedIcePresetId && state.iceModelName === previous.iceModelName && state.iceConsumptionL === previous.iceConsumptionL && state.iceEngineCc === previous.iceEngineCc && state.icePriceRm === previous.icePriceRm && state.iceTankLiters === previous.iceTankLiters && state.iceAnnualMaintenanceRm === previous.iceAnnualMaintenanceRm) return;
  try {
    localStorage.setItem('autokira.vehicleDetails.v1', JSON.stringify({
      ev: { id: state.selectedPresetId, name: state.modelName, estimateBasis: state.evEstimateBasis, consumption: state.consumption, motorKw: state.motorKw, batteryKwh: state.batteryKwh },
      ice: { id: state.selectedIcePresetId, name: state.iceModelName, estimateBasis: state.iceEstimateBasis, consumption: state.iceConsumptionL, engineCc: state.iceEngineCc, price: state.icePriceRm, tank: state.iceTankLiters, maintenance: state.iceAnnualMaintenanceRm },
    }));
  } catch { /* The calculator remains usable if storage is blocked or full. */ }
});
