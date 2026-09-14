export interface AppTranslations {
  appTitle: string;
  langToggle: string;
  modeEv: string;
  modeIce: string;

  // Cockpit
  evJourneyTitle: string;
  consumptionLabel: string;
  monthlyMileageTitle: string;
  mileageUnit: string;
  homeElectricityTitle: string;
  chargingSetupTitle: string;
  setupLanded: string;
  setupCondo: string;
  kwhUnit: string;
  kwhRmToggle: string;
  monthlyPetrolTitle: string;
  currencyUnit: string;
  calculateBtn: string;

  // ICE Cockpit
  iceJourneyTitle: string;
  iceConsumptionLabel: string;
  iceFuelPriceLabel: string;
  iceCarPriceLabel: string;
  iceCalculateBtn: string;
  fuelBudiMadani: string;
  fuelRon95: string;
  fuelRon95Unsub: string;
  fuelRon97: string;
  fuelDiesel: string;
  senPerKmUnit: string;
  kmPerLUnit: string;
  lPer100KmUnit: string;

  // Results
  verdictTitle: string;
  monthlyNetSavings: string;
  oneYear: string;
  fiveYear: string;
  tco: string;
  inclRoadTax: string;


  // Waterfall
  oldPetrolSpend: string;
  marginalHomeElec: string;
  publicDcCost: string;
  totalEvCharging: string;

  // Anchors
  seeComparator: string;
  seeTnbAudit: string;

  // Comparator
  comparatorTitle: string;
  comparatorSub: string;
  currentIceCar: string;
  baselineTag: string;
  carA: string;
  activeInputs: string;
  motorKw: string;
  batteryKwh: string;
  cost100km: string;
  monthlyEvCost: string;
  fiveYearEnergySavings: string;
  fiveYearTotalCost: string;
  winnerTag: string;
  tieTag: string;

  // Road Tax & TCO
  roadTaxSectionTitle: string;
  roadTaxSub: string;
  roadTaxEvLabel: string;
  roadTaxIceLabel: string;
  roadTaxIceCcSelect: string;
  annualDiff: string;
  fiveYearTcoAdvantage: string;
  perYearUnit: string;
  perMonthUnit: string;

  // TNB Audit
  tnbAuditTitle: string;
  thresholdWarning: string;
  tableItem: string;
  tableBaseline: string;
  tableNew: string;
  tableDelta: string;
  baseGen: string;
  sstTax: string;
  kwtbb: string;
  totalRm: string;

  // Advanced Drawer
  advancedSettings: string;
  petrolPriceLabel: string;
  fuelEconomyLabel: string;
  chargingLossLabel: string;
  publicDcRateLabel: string;
  shareReportTitle: string;
  copyReport: string;
  copied: string;
  shareWhatsApp: string;
  reportSummary: string;
}

export const evCalcTranslations: Record<'en' | 'zh', AppTranslations> = {
  en: {
    appTitle: 'MY Car Cost Calc',
    langToggle: 'ZH',
    modeEv: 'EV',
    modeIce: 'Petrol',

    // Cockpit
    evJourneyTitle: 'EV & Commute',
    consumptionLabel: 'Energy Consumption (kWh/100km)',
    monthlyMileageTitle: 'Monthly Distance',
    mileageUnit: 'km',
    homeElectricityTitle: 'Home Electricity',
    chargingSetupTitle: 'Charging Setup',
    setupLanded: 'Landed (90% Home AC)',
    setupCondo: 'Condo (100% Public DC)',
    kwhUnit: 'kWh',
    kwhRmToggle: 'kWh ↔ RM',
    monthlyPetrolTitle: 'Current Monthly Petrol Spend',
    currencyUnit: 'RM',
    calculateBtn: 'Calculate Savings',

    // ICE Cockpit
    iceJourneyTitle: 'Petrol Car & Fuel',
    iceConsumptionLabel: 'Fuel Consumption',
    iceFuelPriceLabel: 'Fuel Grade & Subsidy',
    iceCarPriceLabel: 'Car On-The-Road Price',
    iceCalculateBtn: 'Compare Petrol Cars',
    fuelBudiMadani: 'BUDI MADANI (RM 1.99 / L)',
    fuelRon95: 'RON95 (Subsidised RM 2.05 / L)',
    fuelRon95Unsub: 'RON95 (Floating est. RM 2.60 / L)',
    fuelRon97: 'RON97 (RM 3.19 / L)',
    fuelDiesel: 'Diesel Euro 5 (RM 2.95 / L)',
    senPerKmUnit: 'sen / km',
    kmPerLUnit: 'km / L',
    lPer100KmUnit: 'L / 100km',


    // Results
    verdictTitle: 'Cost Analysis',
    monthlyNetSavings: 'Monthly Net Savings',
    oneYear: '1-Year Net',
    fiveYear: '5-Year Fuel',
    tco: '5-Year Total',
    inclRoadTax: 'incl. road tax',

    // Waterfall
    oldPetrolSpend: 'Current Petrol Spend',
    marginalHomeElec: '- Added Home Electricity (TNB)',
    publicDcCost: '- Public DC Fast Charging',
    totalEvCharging: '= Total EV Monthly Spend',

    // Anchors
    seeComparator: 'Compare Cars ↓',
    seeTnbAudit: 'TNB Bill Breakdown ↓',

    // Comparator
    comparatorTitle: '3-Way Comparison',
    comparatorSub: 'Current Petrol Car vs Selected EV vs Alternative EV (5-Year Horizon)',
    currentIceCar: 'Current Petrol',
    baselineTag: 'Baseline',
    carA: 'Selected EV',
    activeInputs: 'Selected',
    motorKw: 'Power / Engine',
    batteryKwh: 'Battery / Fuel',
    cost100km: 'Cost / 100km',
    monthlyEvCost: 'Monthly Energy',
    fiveYearEnergySavings: '5-Yr vs Petrol',
    fiveYearTotalCost: '5-Yr Total Spend',
    winnerTag: '{car} saves RM {amount} more (5-yr)',
    tieTag: 'Equal 5-year cost',

    // Road Tax & TCO
    roadTaxSectionTitle: '2026 Malaysia Road Tax',
    roadTaxSub: 'From 2026, EV road tax is rated by motor output (kW). Compare below with standard ICE displacement.',
    roadTaxEvLabel: '2026 EV Road Tax',
    roadTaxIceLabel: 'Petrol Road Tax',
    roadTaxIceCcSelect: 'Compare with petrol displacement',
    annualDiff: 'Annual Road Tax Difference',
    fiveYearTcoAdvantage: '5-Year Total (Fuel + Road Tax)',
    perYearUnit: '/ yr',
    perMonthUnit: '/ mo',

    // TNB Audit
    tnbAuditTitle: 'TNB Bill Breakdown',
    thresholdWarning: 'Monthly usage crosses 600 kWh threshold. Higher TNB tier and 8% SST apply.',
    tableItem: 'Item',
    tableBaseline: 'Before EV',
    tableNew: 'With EV',
    tableDelta: 'Difference',
    baseGen: 'Base Energy & Network',
    sstTax: 'Service Tax SST (8%)',
    kwtbb: 'Renewable Fund (KWTBB 1.6%)',
    totalRm: 'Total Monthly Bill (RM)',

    // Advanced Drawer
    advancedSettings: 'Advanced Parameters',
    petrolPriceLabel: 'Petrol price per litre',
    fuelEconomyLabel: 'Current fuel economy (km/L)',
    chargingLossLabel: 'Home charging loss (%)',
    publicDcRateLabel: 'Public DC rate (RM/kWh)',
    shareReportTitle: 'Share Breakdown',
    copyReport: 'Copy Summary',
    copied: 'Copied to clipboard!',
    shareWhatsApp: 'Send via WhatsApp',
    reportSummary: 'EV Calc MY Summary\n\nVehicle: {model}\nConsumption: {consumption} kWh/100km\nMileage: {mileage} km/mo\nPetrol: RM {petrol}/mo\n\nMonthly Net Savings: RM {savings}\nMonthly EV Charging: RM {evCost}\n5-Yr Total Savings (incl. 2026 Road Tax): RM {tcoSavings}'
  },
  zh: {
    appTitle: '大马用车成本精算',
    langToggle: 'EN',
    modeEv: '纯电精算',
    modeIce: '燃油精算',

    // Cockpit
    evJourneyTitle: '电车能耗与行程',
    consumptionLabel: '百公里电耗 (kWh/100km)',
    monthlyMileageTitle: '每月行驶里程',
    mileageUnit: 'km',
    homeElectricityTitle: '家里每月用电',
    chargingSetupTitle: '充电条件',
    setupLanded: '排屋有家充 (90% 家充)',
    setupCondo: '公寓无家充 (全靠公共快充)',
    kwhUnit: 'kWh',
    kwhRmToggle: 'kWh ↔ RM',
    monthlyPetrolTitle: '目前每月油费',
    currencyUnit: 'RM',
    calculateBtn: '开始测算',

    // ICE Cockpit
    iceJourneyTitle: '油车油耗与通勤',
    iceConsumptionLabel: '综合油耗',
    iceFuelPriceLabel: '燃油补贴与等级',
    iceCarPriceLabel: '新车落地总价',
    iceCalculateBtn: '查看对比结果',
    fuelBudiMadani: 'BUDI MADANI 补贴 (RM 1.99 / L)',
    fuelRon95: 'RON95 官方统定价 (RM 2.05 / L)',
    fuelRon95Unsub: 'RON95 取消补贴预估 (RM 2.60 / L)',
    fuelRon97: 'RON97 无补贴市价 (RM 3.19 / L)',
    fuelDiesel: 'Euro 5 柴油 (RM 2.95 / L)',
    senPerKmUnit: 'sen / km',
    kmPerLUnit: 'km / L',
    lPer100KmUnit: 'L / 100km',


    // Results
    verdictTitle: '测算结果',
    monthlyNetSavings: '每月净省',
    oneYear: '1 年累计',
    fiveYear: '5 年油电差',
    tco: '5 年综合净省',
    inclRoadTax: '含路税差额',

    // Waterfall
    oldPetrolSpend: '目前每月油费',
    marginalHomeElec: '− 家充新增电费 (TNB)',
    publicDcCost: '− 公共快充费用',
    totalEvCharging: '＝ 电车每月总花费',

    // Anchors
    seeComparator: '对比其他车型 ↓',
    seeTnbAudit: 'TNB 电费明细 ↓',

    // Comparator
    comparatorTitle: '三车横向对比',
    comparatorSub: '现款油车 vs 已选电车 vs 候选电车（5 年开销全景对照）',
    currentIceCar: '目前油车',
    baselineTag: '基准参照',
    carA: '已选电车',
    activeInputs: '当前测算',
    motorKw: '动力规格',
    batteryKwh: '电池容量',
    cost100km: '百公里花费',
    monthlyEvCost: '每月能源花费',
    fiveYearEnergySavings: '5 年相比油车',
    fiveYearTotalCost: '5 年总开销 (油电+税)',
    winnerTag: '{car} 5年多省 RM {amount}',
    tieTag: '两车5年开销相当',

    // Road Tax & TCO
    roadTaxSectionTitle: '2026 大马路税明细',
    roadTaxSub: '2026 年起纯电按电机输出（kW）分档计税；下方对比常见汽油车排量税率。',
    roadTaxEvLabel: '2026 纯电路税',
    roadTaxIceLabel: '参考油车路税',
    roadTaxIceCcSelect: '对比汽油车排量',
    annualDiff: '每年路税差额',
    fiveYearTcoAdvantage: '5年综合总省 (含路税)',
    perYearUnit: '/ 年',
    perMonthUnit: '/ 月',

    // TNB Audit
    tnbAuditTitle: 'TNB 真实账单拆解',
    thresholdWarning: '全屋月用电超过 600 kWh 门槛，进入更高费率档位并加征 8% SST 服务税。',
    tableItem: '账单项目',
    tableBaseline: '购车前',
    tableNew: '购车后',
    tableDelta: '增量',
    baseGen: '基础电费与电网费',
    sstTax: '服务税 SST (8%)',
    kwtbb: '绿色能源基金 (1.6%)',
    totalRm: '实付电费总额 (RM)',

    // Advanced Drawer
    advancedSettings: '高级参数设置',
    petrolPriceLabel: '汽油单价 (RM/L)',
    fuelEconomyLabel: '原车油耗 (km/L)',
    chargingLossLabel: '家充损耗率 (%)',
    publicDcRateLabel: '公共快充单价 (RM/kWh)',
    shareReportTitle: '分享测算结果',
    copyReport: '复制摘要',
    copied: '已复制到剪贴板！',
    shareWhatsApp: 'WhatsApp 发送',
    reportSummary: 'EV Calc MY 测算摘要\n\n车型: {model}\n百公里电耗: {consumption} kWh/100km\n每月里程: {mileage} km\n原车油费: RM {petrol}/月\n\n每月净省: RM {savings}\n电车月充电费: RM {evCost}\n5年综合总省 (含2026路税): RM {tcoSavings}'
  }
};
