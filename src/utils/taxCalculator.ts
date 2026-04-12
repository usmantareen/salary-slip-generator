import { TaxConfig, TaxCalculation, TaxBreakdownItem, TaxRule, TaxSlab, SalaryData } from '../types';

export const defaultTaxConfigs: TaxConfig[] = [
  {
    id: 'india-old',
    name: 'India - Old Regime',
    country: 'India',
    currency: 'INR',
    locale: 'en-IN',
    taxYear: 2026,
    isCustom: false,
    standardDeductions: [
      { id: 'sd-1', name: 'Standard Deduction', amount: 50000, type: 'fixed' }
    ],
    rules: [
      {
        id: 'pf',
        name: 'Employee Provident Fund (EPF)',
        type: 'percentage',
        rate: 12,
        baseOn: 'basic',
        isDeduction: true,
        isStatutory: true,
        description: '12% of Basic Salary',
        appliesTo: 'monthly'
      },
      {
        id: 'esi',
        name: 'Employee State Insurance (ESI)',
        type: 'percentage',
        rate: 0.75,
        minAmount: 0,
        maxAmount: 21000,
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: '0.75% of Gross Salary (if <= ₹21,000)',
        appliesTo: 'monthly'
      },
      {
        id: 'pt',
        name: 'Professional Tax',
        type: 'slab',
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: 'Varies by state (Maharashtra shown)',
        appliesTo: 'monthly',
        slabs: [
          { min: 0, max: 7500, rate: 0, fixedAmount: 0 },
          { min: 7501, max: 10000, rate: 0, fixedAmount: 175 },
          { min: 10001, max: null, rate: 0, fixedAmount: 200 }
        ]
      },
      {
        id: 'income-tax',
        name: 'Income Tax (TDS)',
        type: 'slab',
        baseOn: 'taxable',
        isDeduction: true,
        isStatutory: true,
        description: 'Monthly TDS as per old tax regime',
        appliesTo: 'annual',
        slabs: [
          { min: 0, max: 250000, rate: 0, fixedAmount: 0 },
          { min: 250001, max: 500000, rate: 5, fixedAmount: 0 },
          { min: 500001, max: 1000000, rate: 20, fixedAmount: 12500 },
          { min: 1000001, max: null, rate: 30, fixedAmount: 112500 }
        ]
      },
      {
        id: 'cess',
        name: 'Health & Education Cess',
        type: 'percentage',
        rate: 4,
        baseOn: 'tax',
        isDeduction: true,
        isStatutory: true,
        description: '4% of Income Tax',
        appliesTo: 'monthly'
      }
    ]
  },
  {
    id: 'india-new',
    name: 'India - New Regime',
    country: 'India',
    currency: 'INR',
    locale: 'en-IN',
    taxYear: 2026,
    isCustom: false,
    rules: [
      {
        id: 'pf',
        name: 'Employee Provident Fund (EPF)',
        type: 'percentage',
        rate: 12,
        baseOn: 'basic',
        isDeduction: true,
        isStatutory: true,
        description: '12% of Basic Salary',
        appliesTo: 'monthly'
      },
      {
        id: 'esi',
        name: 'Employee State Insurance (ESI)',
        type: 'percentage',
        rate: 0.75,
        minAmount: 0,
        maxAmount: 21000,
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: '0.75% of Gross Salary (if <= ₹21,000)',
        appliesTo: 'monthly'
      },
      {
        id: 'pt',
        name: 'Professional Tax',
        type: 'slab',
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: 'Varies by state (Maharashtra shown)',
        appliesTo: 'monthly',
        slabs: [
          { min: 0, max: 7500, rate: 0, fixedAmount: 0 },
          { min: 7501, max: 10000, rate: 0, fixedAmount: 175 },
          { min: 10001, max: null, rate: 0, fixedAmount: 200 }
        ]
      },
      {
        id: 'income-tax',
        name: 'Income Tax (TDS)',
        type: 'slab',
        baseOn: 'taxable',
        isDeduction: true,
        isStatutory: true,
        description: 'Monthly TDS as per new tax regime',
        appliesTo: 'annual',
        slabs: [
          { min: 0, max: 300000, rate: 0, fixedAmount: 0 },
          { min: 300001, max: 600000, rate: 5, fixedAmount: 0 },
          { min: 600001, max: 900000, rate: 10, fixedAmount: 15000 },
          { min: 900001, max: 1200000, rate: 15, fixedAmount: 45000 },
          { min: 1200001, max: 1500000, rate: 20, fixedAmount: 90000 },
          { min: 1500001, max: null, rate: 30, fixedAmount: 150000 }
        ]
      },
      {
        id: 'cess',
        name: 'Health & Education Cess',
        type: 'percentage',
        rate: 4,
        baseOn: 'tax',
        isDeduction: true,
        isStatutory: true,
        description: '4% of Income Tax',
        appliesTo: 'monthly'
      }
    ]
  },
  {
    id: 'usa',
    name: 'USA Federal',
    country: 'USA',
    currency: 'USD',
    locale: 'en-US',
    taxYear: 2026,
    isCustom: false,
    standardDeductions: [
      { id: 'sd-1', name: 'Standard Deduction (Single)', amount: 14600, type: 'fixed' }
    ],
    rules: [
      {
        id: 'social-security',
        name: 'Social Security',
        type: 'percentage',
        rate: 6.2,
        minAmount: 0,
        maxAmount: 160200,
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: '6.2% up to wage base limit',
        appliesTo: 'monthly'
      },
      {
        id: 'medicare',
        name: 'Medicare',
        type: 'percentage',
        rate: 1.45,
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: '1.45% of Gross Salary',
        appliesTo: 'monthly'
      },
      {
        id: 'federal-tax',
        name: 'Federal Income Tax',
        type: 'slab',
        baseOn: 'taxable',
        isDeduction: true,
        isStatutory: true,
        description: 'Federal income tax brackets',
        appliesTo: 'annual',
        slabs: [
          { min: 0, max: 11600, rate: 10, fixedAmount: 0 },
          { min: 11601, max: 47150, rate: 12, fixedAmount: 1160 },
          { min: 47151, max: 100525, rate: 22, fixedAmount: 5426 },
          { min: 100526, max: 191950, rate: 24, fixedAmount: 17168.50 },
          { min: 191951, max: 243725, rate: 32, fixedAmount: 39110.50 },
          { min: 243726, max: 609350, rate: 35, fixedAmount: 55678.50 },
          { min: 609351, max: null, rate: 37, fixedAmount: 183647.25 }
        ]
      }
    ]
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    country: 'UK',
    currency: 'GBP',
    locale: 'en-GB',
    taxYear: 2026,
    isCustom: false,
    rules: [
      {
        id: 'ni',
        name: 'National Insurance',
        type: 'slab',
        baseOn: 'gross',
        isDeduction: true,
        isStatutory: true,
        description: 'National Insurance contributions',
        appliesTo: 'monthly',
        slabs: [
          { min: 0, max: 1048, rate: 0, fixedAmount: 0 },
          { min: 1049, max: 4189, rate: 8, fixedAmount: 0 },
          { min: 4190, max: null, rate: 2, fixedAmount: 251.20 }
        ]
      },
      {
        id: 'income-tax',
        name: 'Income Tax',
        type: 'slab',
        baseOn: 'taxable',
        isDeduction: true,
        isStatutory: true,
        description: 'UK income tax rates',
        appliesTo: 'annual',
        slabs: [
          { min: 0, max: 12570, rate: 0, fixedAmount: 0 },
          { min: 12571, max: 50270, rate: 20, fixedAmount: 0 },
          { min: 50271, max: 125140, rate: 40, fixedAmount: 7540 },
          { min: 125141, max: null, rate: 45, fixedAmount: 25396 }
        ]
      }
    ]
  },
  {
    id: 'uae',
    name: 'UAE (No Tax)',
    country: 'UAE',
    currency: 'AED',
    locale: 'en-AE',
    taxYear: 2026,
    isCustom: false,
    rules: []
  },
  {
    id: 'custom',
    name: 'Custom Configuration',
    country: 'Custom',
    currency: 'USD',
    locale: 'en-US',
    taxYear: 2026,
    isCustom: true,
    rules: []
  }
];

export function calculateTax(
  data: SalaryData,
  config: TaxConfig,
  annualProjectedIncome?: number
): TaxCalculation {
  const grossEarnings = data.earnings.reduce((sum, item) => sum + item.amount, 0);
  const existingDeductions = data.deductions.reduce((sum, item) => sum + item.amount, 0);
  
  const basicSalary = data.earnings.find(e => 
    e.name.toLowerCase().includes('basic') || 
    e.name.toLowerCase().includes('base')
  )?.amount || grossEarnings * 0.5;

  const monthlyIncome = annualProjectedIncome ? annualProjectedIncome / 12 : grossEarnings;
  const projectedAnnual = annualProjectedIncome || grossEarnings * 12;

  let taxableIncome = grossEarnings;
  const breakdown: TaxBreakdownItem[] = [];
  let totalDeductions = existingDeductions;
  let incomeTaxAmount = 0;

  if (config.standardDeductions) {
    const annualStdDeduction = config.standardDeductions.reduce((sum, sd) => sum + sd.amount, 0);
    const monthlyStdDeduction = annualStdDeduction / 12;
    taxableIncome = Math.max(0, grossEarnings - monthlyStdDeduction);
  }

  for (const rule of config.rules) {
    let baseAmount = 0;
    
    switch (rule.baseOn) {
      case 'gross':
        baseAmount = grossEarnings;
        break;
      case 'basic':
        baseAmount = basicSalary;
        break;
      case 'taxable':
        baseAmount = taxableIncome;
        break;
      case 'net':
        baseAmount = grossEarnings - totalDeductions;
        break;
      case 'tax':
        baseAmount = incomeTaxAmount;
        break;
    }

    let calculatedAmount = 0;

    if (rule.type === 'percentage') {
      if (rule.minAmount !== undefined && baseAmount < rule.minAmount) {
        calculatedAmount = 0;
      } else if (rule.maxAmount !== undefined && baseAmount > rule.maxAmount) {
        calculatedAmount = (rule.maxAmount * (rule.rate || 0)) / 100;
      } else {
        calculatedAmount = (baseAmount * (rule.rate || 0)) / 100;
      }
    } else if (rule.type === 'slab' && rule.slabs) {
      const applicableSlabs = rule.appliesTo === 'annual' ? projectedAnnual : monthlyIncome;
      calculatedAmount = calculateSlabTax(applicableSlabs, rule.slabs, rule.appliesTo === 'annual' ? 12 : 1);
      
      if (rule.id === 'income-tax') {
        incomeTaxAmount = calculatedAmount;
      }
    } else if (rule.type === 'fixed' && rule.rate) {
      calculatedAmount = rule.rate;
    }

    if (calculatedAmount > 0) {
      const roundedAmount = Math.round(calculatedAmount * 100) / 100;
      breakdown.push({
        ruleId: rule.id,
        ruleName: rule.name,
        baseAmount,
        calculatedAmount: roundedAmount,
        rate: rule.rate,
        isDeduction: rule.isDeduction
      });

      if (rule.isDeduction) {
        totalDeductions += roundedAmount;
      }
    }
  }

  const afterTaxIncome = grossEarnings - totalDeductions;
  const effectiveRate = grossEarnings > 0 ? ((totalDeductions - existingDeductions) / grossEarnings) * 100 : 0;

  return {
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    totalTax: Math.round((totalDeductions - existingDeductions) * 100) / 100,
    breakdown,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    afterTaxIncome: Math.round(afterTaxIncome * 100) / 100
  };
}

function calculateSlabTax(amount: number, slabs: TaxSlab[], monthsInYear: number): number {
  for (const slab of slabs) {
    if (amount >= slab.min && (slab.max === null || amount <= slab.max)) {
      const rate = slab.rate / 100;
      const slabIncome = amount - slab.min;
      const taxOnSlab = slabIncome * rate;
      const totalTaxInSlab = (slab.fixedAmount || 0) + taxOnSlab;
      return monthsInYear === 12 ? totalTaxInSlab / 12 : totalTaxInSlab;
    }
  }
  return 0;
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function exportTaxConfig(config: TaxConfig): string {
  return JSON.stringify(config, null, 2);
}

export function importTaxConfig(jsonString: string): TaxConfig | null {
  try {
    const config = JSON.parse(jsonString);
    if (config.id && config.name && Array.isArray(config.rules)) {
      return { ...config, isCustom: true };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomTaxConfig(config: TaxConfig): void {
  const saved = localStorage.getItem('customTaxConfigs');
  const configs: TaxConfig[] = saved ? JSON.parse(saved) : [];
  const index = configs.findIndex(c => c.id === config.id);
  
  if (index >= 0) {
    configs[index] = config;
  } else {
    configs.push(config);
  }
  
  localStorage.setItem('customTaxConfigs', JSON.stringify(configs));
}

export function loadCustomTaxConfigs(): TaxConfig[] {
  const saved = localStorage.getItem('customTaxConfigs');
  return saved ? JSON.parse(saved) : [];
}

export function deleteCustomTaxConfig(id: string): void {
  const saved = localStorage.getItem('customTaxConfigs');
  if (saved) {
    const configs: TaxConfig[] = JSON.parse(saved);
    const filtered = configs.filter(c => c.id !== id);
    localStorage.setItem('customTaxConfigs', JSON.stringify(filtered));
  }
}

export function createEmptyTaxRule(): TaxRule {
  return {
    id: `rule-${Date.now()}`,
    name: '',
    type: 'percentage',
    rate: 0,
    baseOn: 'gross',
    isDeduction: true,
    isStatutory: false,
    appliesTo: 'monthly'
  };
}

export function createEmptySlab(): TaxSlab {
  return {
    min: 0,
    max: null,
    rate: 0,
    fixedAmount: 0
  };
}
