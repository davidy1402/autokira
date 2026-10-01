import { EvCalculationResult, UserInputs } from '../types/calculator';

export function formatRm(amount: number, options?: { showPlus?: boolean; decimals?: number }): string {
  const decimals = options?.decimals ?? 2;
  const prefix = options?.showPlus && amount > 0 ? '+' : '';
  return `${prefix}RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

export function formatNumber(val: number, decimals: number = 1): string {
  return val.toLocaleString('en-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Generates formatted text for WhatsApp and executive summary in Chinese or English
 */
export function generateShareReport(
  inputs: UserInputs,
  result: EvCalculationResult,
  language: 'zh' | 'en' = 'zh'
): string {
  const isEn = language === 'en';
  const dateStr = new Date().toLocaleDateString(isEn ? 'en-MY' : 'zh-CN', {
    year: 'numeric',
    month: isEn ? 'short' : 'long',
    day: 'numeric'
  });

  const modelName = inputs.modelName.trim() || (isEn ? 'EV Model' : '电车');

  if (isEn) {
    return `[ ${modelName} Energy & TNB Cost Evaluation Report ]
Date: ${dateStr}

1. Vehicle & Mileage Baseline
• Energy Consumption: ${inputs.consumptionKwhPer100Km} kWh/100 km (Grid: ${(inputs.consumptionKwhPer100Km * 1.10).toFixed(1)} kWh/100km)
• Estimated Mileage: ${inputs.monthlyMileageKm.toLocaleString()} km / month
• Monthly Grid Charging: ${formatNumber(result.evMonthlyGrossKwh)} kWh (${inputs.chargingMode === 'home_only' ? '100% Home' : '90% Home / 10% Public'})

2. Monthly Financial Impact
• Current Baseline Total: ${formatRm(result.oldTotalMonthlyEnergyExpense)} / mo
  - Home Electricity (${result.baselineBill.kwh} kWh): ${formatRm(result.baselineBill.totalAmount)}
  - Father's Petrol Budget: ${formatRm(result.petrolMonthlyCost)} (~${result.petrolEquivalentDistanceKm.toLocaleString()} km)
• New Total with EV: ${formatRm(result.newTotalMonthlyEnergyExpense)} / mo
  - TNB Adjusted Bill (${result.newCombinedBill.kwh} kWh): ${formatRm(result.newCombinedBill.totalAmount)} (+${formatRm(result.marginalHomeElectricityCost)})
  - Public DC Fast Charging: ${formatRm(result.publicChargingCost)}

3. Net Financial Savings
• Monthly Net Savings: ${formatRm(result.monthlyNetSavings)}
• 1-Year Cumulative Savings: ${formatRm(result.yearlyNetSavings)}
• 5-Year Cumulative Savings (incl. 2026 Road Tax): ${formatRm(result.fiveYearTcoWithRoadTaxSavings)}

4. 100km Energy Cost Comparison
• Petrol Car (14 km/L @ RM 1.99/L): ${formatRm(result.petrolCostPer100Km)} / 100km
• Electric Vehicle: ${formatRm(result.evCostPer100Km)} / 100km (${result.savingsRatioPerKm}% savings)

${result.crossed600Threshold ? `[TNB Threshold Notice]: Household consumption reaches ${result.newCombinedBill.kwh} kWh, crossing the 600 kWh threshold. Net savings remain positive at ${formatRm(result.monthlyNetSavings)}/month.` : `[TNB Status]: Usage remains within the 600 kWh threshold.`}

Generated via AutoKira`;
  }

  return `【${modelName} 试驾电费与燃油成本测算报告】
日期：${dateStr}

一、 车辆能耗与行驶基准
• 标称电耗：${inputs.consumptionKwhPer100Km} kWh/100 km (电网取电: ${(inputs.consumptionKwhPer100Km * 1.10).toFixed(1)} kWh/100km)
• 预估月行驶里程：${inputs.monthlyMileageKm.toLocaleString()} km
• 电车月充电量：${formatNumber(result.evMonthlyGrossKwh)} kWh (${inputs.chargingMode === 'home_only' ? '100% 纯家充' : '90% 家充 + 10% 外充'})

二、 每月能源财务开支对比
• 现状总支出：${formatRm(result.oldTotalMonthlyEnergyExpense)} /月
  - 家庭电费 (${result.baselineBill.kwh} kWh)：${formatRm(result.baselineBill.totalAmount)}
  - 爸爸燃油费：${formatRm(result.petrolMonthlyCost)} (折合 ${result.petrolEquivalentDistanceKm.toLocaleString()} km)
• 换开电车后总支出：${formatRm(result.newTotalMonthlyEnergyExpense)} /月
  - 调整后 TNB 电费 (${result.newCombinedBill.kwh} kWh)：${formatRm(result.newCombinedBill.totalAmount)} (增加 ${formatRm(result.marginalHomeElectricityCost)})
  - 公共快充费：${formatRm(result.publicChargingCost)}

三、 净收益测算结论
• 每月净省：${formatRm(result.monthlyNetSavings)} /月
• 1 年累计节省：${formatRm(result.yearlyNetSavings)}
• 5 年累计节省 (含 2026 新路税)：${formatRm(result.fiveYearTcoWithRoadTaxSavings)}

四、 每 100 公里能耗成本对比
• 燃油车 (14 km/L @ RM 1.99/L)：${formatRm(result.petrolCostPer100Km)} / 100km
• 电动车：${formatRm(result.evCostPer100Km)} / 100km (节省 ${result.savingsRatioPerKm}%)

${result.crossed600Threshold ? `[TNB 门槛提示]：计入电车后总用电量达 ${result.newCombinedBill.kwh} kWh，跨入 600 kWh 档位。家庭整体能源开支仍净省 ${formatRm(result.monthlyNetSavings)} / 月。` : `[TNB 状态]：用电量处于 600 kWh 优惠区间内。`}

数据基于马来西亚 TNB 2025/2026 官方阶梯及 MOT 2026 路税公式测算`;
}
