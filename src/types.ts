export interface SalaryItem {
  id: string;
  name: string;
  amount: number;
}

export interface TaxRule {
  id: string;
  name: string;
  type: 'percentage' | 'slab' | 'fixed' | 'formula';
  rate?: number;
  minAmount?: number;
  maxAmount?: number;
  baseOn: 'gross' | 'basic' | 'taxable' | 'net' | 'tax';
  slabs?: TaxSlab[];
  formula?: string;
  isDeduction: boolean;
  isStatutory: boolean;
  description?: string;
  appliesTo: 'all' | 'monthly' | 'annual';
}

export interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
  fixedAmount?: number;
}

export interface TaxConfig {
  id: string;
  name: string;
  country: string;
  currency: string;
  locale: string;
  taxYear: number;
  rules: TaxRule[];
  standardDeductions?: StandardDeduction[];
  isCustom: boolean;
}

export interface StandardDeduction {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  baseOn?: 'gross' | 'basic';
}

export interface TaxCalculation {
  taxableIncome: number;
  totalTax: number;
  breakdown: TaxBreakdownItem[];
  effectiveRate: number;
  afterTaxIncome: number;
}

export interface TaxBreakdownItem {
  ruleId: string;
  ruleName: string;
  baseAmount: number;
  calculatedAmount: number;
  rate?: number;
  isDeduction: boolean;
}

export interface CompanyDetails {
  name: string;
  address: string;
  logo: string | null;
}

export interface EmployeeDetails {
  name: string;
  id: string;
  designation: string;
  department: string;
  doj: string;
  email?: string;
  panNumber?: string;
  bankAccount?: string;
  bankName?: string;
  ifscCode?: string;
}

export interface SalaryDetails {
  month: string;
  year: string;
  paidDays: number;
  lopDays: number;
  basicSalary?: number;
  taxConfigId?: string;
  taxCalculation?: TaxCalculation;
}

export interface SalaryData {
  company: CompanyDetails;
  employee: EmployeeDetails;
  salary: SalaryDetails;
  earnings: SalaryItem[];
  deductions: SalaryItem[];
  signatures?: Record<string, unknown>;
}

export interface BulkEmployeeData {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  doj: string;
  email?: string;
  panNumber?: string;
  bankAccount?: string;
  bankName?: string;
  ifscCode?: string;
  basicSalary: number;
  hra?: number;
  specialAllowance?: number;
  otherEarnings?: number;
  paidDays?: number;
  lopDays?: number;
  errors?: string[];
}

export interface BulkUploadResult {
  valid: BulkEmployeeData[];
  invalid: BulkEmployeeData[];
  totalCount: number;
}
