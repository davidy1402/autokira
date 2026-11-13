export interface EvVehiclePreset {
  id: string;
  name: string;
  brand: string;
  consumption: number; // kWh / 100 km (WLTP combined reference)
  motorKw: number;
  batteryKwh: number;
  range: number; // km
  price: number; // RM
  tag?: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export const PRESETS: EvVehiclePreset[] = [
  // --- Proton e.MAS ---
  {
    id: 'emas7',
    name: 'Proton e.MAS 7 Prime',
    brand: 'Proton',
    consumption: 14.5,
    motorKw: 160,
    batteryKwh: 49.52,
    range: 345,
    price: 120000,
    tag: 'National EV SUV',
    sourceUrl: 'https://protonemas.com',
    sourceLabel: 'Pro-Net Malaysia, 345 km WLTP'
  },
  {
    id: 'emas7prem',
    name: 'Proton e.MAS 7 Premium',
    brand: 'Proton',
    consumption: 14.7,
    motorKw: 160,
    batteryKwh: 60.22,
    range: 410,
    price: 130000,
    tag: 'National EV SUV Long Range',
    sourceUrl: 'https://protonemas.com',
    sourceLabel: 'Pro-Net Malaysia, 410 km WLTP'
  },
  {
    id: 'emas5',
    name: 'Proton e.MAS 5',
    brand: 'Proton',
    consumption: 12.8,
    motorKw: 85,
    batteryKwh: 40.16,
    range: 325,
    price: 80000,
    tag: 'Budget EV City Car',
    sourceUrl: 'https://protonemas.com',
    sourceLabel: 'Pro-Net Malaysia estimate'
  },

  // --- BYD ---
  {
    id: 'dolphinsr',
    name: 'BYD Dolphin Dynamic Standard Range',
    brand: 'BYD',
    consumption: 13.2,
    motorKw: 70,
    batteryKwh: 44.90,
    range: 340,
    price: 100530,
    tag: 'Accessible EV Hatch',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 340 km WLTP'
  },
  {
    id: 'dolphin',
    name: 'BYD Dolphin Premium Extended Range',
    brand: 'BYD',
    consumption: 15.2,
    motorKw: 150,
    batteryKwh: 60.48,
    range: 427,
    price: 124900,
    tag: 'Popular EV Hatch',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 427 km WLTP'
  },
  {
    id: 'atto3',
    name: 'BYD Atto 3 Standard Range',
    brand: 'BYD',
    consumption: 15.6,
    motorKw: 150,
    batteryKwh: 49.92,
    range: 345,
    price: 149800,
    tag: 'Best-Selling EV SUV',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 345 km WLTP'
  },
  {
    id: 'atto3er',
    name: 'BYD Atto 3 Extended Range',
    brand: 'BYD',
    consumption: 16.0,
    motorKw: 150,
    batteryKwh: 60.48,
    range: 420,
    price: 167800,
    tag: 'Family EV SUV',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 420 km WLTP'
  },
  {
    id: 'sealdynamic',
    name: 'BYD Seal Dynamic RWD',
    brand: 'BYD',
    consumption: 14.6,
    motorKw: 150,
    batteryKwh: 61.44,
    range: 460,
    price: 163800,
    tag: 'Sport EV Sedan',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 460 km WLTP'
  },
  {
    id: 'seal',
    name: 'BYD Seal Premium RWD',
    brand: 'BYD',
    consumption: 15.2,
    motorKw: 230,
    batteryKwh: 82.56,
    range: 570,
    price: 179800,
    tag: '570km Long Range',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 570 km WLTP'
  },
  {
    id: 'sealperf',
    name: 'BYD Seal Performance AWD',
    brand: 'BYD',
    consumption: 18.2,
    motorKw: 390,
    batteryKwh: 82.56,
    range: 520,
    price: 199800,
    tag: '3.8s 0-100km/h Dual Motor',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 520 km WLTP'
  },
  {
    id: 'sealion7',
    name: 'BYD Sealion 7 Premium RWD',
    brand: 'BYD',
    consumption: 17.2,
    motorKw: 230,
    batteryKwh: 82.56,
    range: 567,
    price: 183800,
    tag: 'Fastback EV SUV',
    sourceUrl: 'https://byd.simedarbybuyers.com.my',
    sourceLabel: 'Sime Darby Motors, 567 km WLTP'
  },

  // --- Tesla ---
  {
    id: 'm3rwd',
    name: 'Tesla Model 3 RWD (Highland)',
    brand: 'Tesla',
    consumption: 13.2,
    motorKw: 208,
    batteryKwh: 57.5,
    range: 513,
    price: 189000,
    tag: 'Ultra-High Efficiency',
    sourceUrl: 'https://www.tesla.com/en_my/model3',
    sourceLabel: 'Tesla Malaysia, 513 km WLTP'
  },
  {
    id: 'm3lr',
    name: 'Tesla Model 3 Long Range AWD (Highland)',
    brand: 'Tesla',
    consumption: 14.0,
    motorKw: 331,
    batteryKwh: 75.0,
    range: 629,
    price: 218000,
    tag: '629km Range AWD',
    sourceUrl: 'https://www.tesla.com/en_my/model3',
    sourceLabel: 'Tesla Malaysia, 629 km WLTP'
  },
  {
    id: 'modely',
    name: 'Tesla Model Y RWD',
    brand: 'Tesla',
    consumption: 15.7,
    motorKw: 220,
    batteryKwh: 60.0,
    range: 455,
    price: 199000,
    tag: 'Popular Global EV SUV',
    sourceUrl: 'https://www.tesla.com/en_my/modely',
    sourceLabel: 'Tesla Malaysia, 455 km WLTP'
  },
  {
    id: 'modelylr',
    name: 'Tesla Model Y Long Range AWD',
    brand: 'Tesla',
    consumption: 16.9,
    motorKw: 378,
    batteryKwh: 75.0,
    range: 533,
    price: 246000,
    tag: 'Dual Motor EV SUV',
    sourceUrl: 'https://www.tesla.com/en_my/modely',
    sourceLabel: 'Tesla Malaysia, 533 km WLTP'
  },

  // --- XPeng ---
  {
    id: 'xpengg6sr',
    name: 'XPeng G6 580 Pro Standard Range',
    brand: 'XPeng',
    consumption: 16.5,
    motorKw: 190,
    batteryKwh: 66.0,
    range: 435,
    price: 165820,
    tag: '800V Ultra-Fast Charging',
    sourceUrl: 'https://xpeng.my',
    sourceLabel: 'Bermaz Auto Malaysia, 435 km WLTP'
  },
  {
    id: 'xpengg6lr',
    name: 'XPeng G6 755 Pro Long Range',
    brand: 'XPeng',
    consumption: 16.9,
    motorKw: 210,
    batteryKwh: 87.5,
    range: 570,
    price: 185820,
    tag: '800V 570km Long Range',
    sourceUrl: 'https://xpeng.my',
    sourceLabel: 'Bermaz Auto Malaysia, 570 km WLTP'
  },

  // --- Zeekr ---
  {
    id: 'zeekrx',
    name: 'Zeekr X RWD',
    brand: 'Zeekr',
    consumption: 16.5,
    motorKw: 200,
    batteryKwh: 66.0,
    range: 440,
    price: 180000,
    tag: 'Premium Compact SUV',
    sourceUrl: 'https://zeekr.my',
    sourceLabel: 'Zeekr Malaysia, 440 km WLTP'
  },
  {
    id: 'zeekr7x',
    name: 'Zeekr 7X RWD',
    brand: 'Zeekr',
    consumption: 17.5,
    motorKw: 310,
    batteryKwh: 75.0,
    range: 605,
    price: 185000,
    tag: 'Midsize Luxury EV SUV',
    sourceUrl: 'https://zeekr.my',
    sourceLabel: 'Zeekr Malaysia, 605 km WLTP'
  },

  // --- Chery & Omoda ---
  {
    id: 'omoda',
    name: 'Chery Omoda E5',
    brand: 'Chery',
    consumption: 15.5,
    motorKw: 150,
    batteryKwh: 61.0,
    range: 430,
    price: 146800,
    tag: 'Futuristic EV Crossover',
    sourceUrl: 'https://www.chery.my',
    sourceLabel: 'Chery Malaysia, 430 km WLTP'
  },

  // --- Smart ---
  {
    id: 'smart1pro',
    name: 'Smart #1 Pro',
    brand: 'Smart',
    consumption: 16.8,
    motorKw: 200,
    batteryKwh: 49.0,
    range: 315,
    price: 189000,
    tag: 'Mercedes-Geely Design',
    sourceUrl: 'https://my.smart.com',
    sourceLabel: 'Pro-Net Malaysia, 315 km WLTP'
  },
  {
    id: 'smart1',
    name: 'Smart #1 Premium',
    brand: 'Smart',
    consumption: 16.7,
    motorKw: 200,
    batteryKwh: 66.0,
    range: 440,
    price: 219000,
    tag: '440km WLTP Premium',
    sourceUrl: 'https://my.smart.com',
    sourceLabel: 'Pro-Net Malaysia, 440 km WLTP'
  },

  // --- GWM Ora ---
  {
    id: 'oragoodcat400',
    name: 'GWM Ora Good Cat 400 Pro',
    brand: 'GWM',
    consumption: 16.0,
    motorKw: 105,
    batteryKwh: 47.78,
    range: 310,
    price: 139800,
    tag: 'Retro EV Hatch',
    sourceUrl: 'https://www.gwm.com.my',
    sourceLabel: 'GWM Malaysia, 310 km WLTP'
  },
  {
    id: 'ora',
    name: 'GWM Ora Good Cat 500 Ultra',
    brand: 'GWM',
    consumption: 16.7,
    motorKw: 105,
    batteryKwh: 63.14,
    range: 400,
    price: 169800,
    tag: '500km NEDC / 400km WLTP',
    sourceUrl: 'https://www.gwm.com.my',
    sourceLabel: 'GWM Malaysia, 400 km WLTP'
  },

  // --- MG ---
  {
    id: 'mg4std',
    name: 'MG4 Standard',
    brand: 'MG',
    consumption: 17.0,
    motorKw: 125,
    batteryKwh: 51.0,
    range: 350,
    price: 103999,
    tag: 'Affordable RWD Hatch',
    sourceUrl: 'https://www.mgmotor.com.my',
    sourceLabel: 'SAIC Motor Malaysia, 350 km WLTP'
  },
  {
    id: 'mg4lux',
    name: 'MG4 Lux',
    brand: 'MG',
    consumption: 16.6,
    motorKw: 150,
    batteryKwh: 64.0,
    range: 435,
    price: 128999,
    tag: '435km WLTP Hatch',
    sourceUrl: 'https://www.mgmotor.com.my',
    sourceLabel: 'SAIC Motor Malaysia, 435 km WLTP'
  },
  {
    id: 'mg4',
    name: 'MG4 XPOWER AWD',
    brand: 'MG',
    consumption: 18.7,
    motorKw: 320,
    batteryKwh: 64.0,
    range: 385,
    price: 158999,
    tag: '3.8s AWD Hot Hatch',
    sourceUrl: 'https://www.mgmotor.com.my',
    sourceLabel: 'SAIC Motor Malaysia, 385 km WLTP'
  },

  // --- BMW, Volvo, Hyundai, Neta ---
  {
    id: 'bmwix1',
    name: 'BMW iX1 eDrive20 M Sport',
    brand: 'BMW',
    consumption: 16.8,
    motorKw: 150,
    batteryKwh: 64.7,
    range: 475,
    price: 249800,
    tag: 'Luxury EV SAV',
    sourceUrl: 'https://www.bmw.com.my',
    sourceLabel: 'BMW Malaysia, 475 km WLTP'
  },
  {
    id: 'volvoex30',
    name: 'Volvo EX30 Plus / Ultra',
    brand: 'Volvo',
    consumption: 15.7,
    motorKw: 200,
    batteryKwh: 69.0,
    range: 476,
    price: 188888,
    tag: 'Scandinavian Luxury EV',
    sourceUrl: 'https://www.volvocars.com/my',
    sourceLabel: 'Volvo Car Malaysia, 476 km WLTP'
  },
  {
    id: 'netav',
    name: 'Neta V',
    brand: 'Neta',
    consumption: 14.0,
    motorKw: 70,
    batteryKwh: 38.5,
    range: 290,
    price: 75900,
    tag: 'Lowest Price EV City Car',
    sourceUrl: 'https://neta.my',
    sourceLabel: 'Neta Auto Malaysia, 380 km NEDC'
  },
  {
    id: 'ioniq5',
    name: 'Hyundai Ioniq 5 Max RWD',
    brand: 'Hyundai',
    consumption: 16.8,
    motorKw: 225,
    batteryKwh: 72.6,
    range: 430,
    price: 270888,
    tag: '800V Ultra-Fast Charging',
    sourceUrl: 'https://www.hyundai.com.my',
    sourceLabel: 'Hyundai Malaysia, 430 km WLTP'
  },
  {
    id: 'ioniq6',
    name: 'Hyundai Ioniq 6 Max RWD',
    brand: 'Hyundai',
    consumption: 14.3,
    motorKw: 168,
    batteryKwh: 77.4,
    range: 614,
    price: 289888,
    tag: '614km Range Aerodynamic Sedan',
    sourceUrl: 'https://www.hyundai.com.my',
    sourceLabel: 'Hyundai Malaysia, 614 km WLTP'
  }
];
