import React, { useState, useRef } from 'react';
import { BulkEmployeeData, SalaryData, TaxConfig, TaxCalculation } from '../types';
import { calculateTax } from '../utils/taxCalculator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toWords } from 'number-to-words';
import { Package, Download, FileText, Check, Loader2, AlertCircle, ChevronRight, X } from 'lucide-react';

interface Props {
  employees: BulkEmployeeData[];
  company: SalaryData['company'];
  month: string;
  year: string;
  taxConfig: TaxConfig | null;

}

interface GenerationResult {
  success: boolean;
  employeeId: string;
  name: string;
  error?: string;
  pdfData?: string;
}

export function BulkGenerator({ employees, company, month, year, taxConfig }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const previewRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const generateSinglePayslip = async (employee: BulkEmployeeData): Promise<GenerationResult> => {
    try {
      const grossEarnings = employee.basicSalary + 
        (employee.hra || 0) + 
        (employee.specialAllowance || 0) + 
        (employee.otherEarnings || 0);

      const earnings = [
        { id: '1', name: 'Basic Salary', amount: employee.basicSalary },
        ...(employee.hra ? [{ id: '2', name: 'House Rent Allowance', amount: employee.hra }] : []),
        ...(employee.specialAllowance ? [{ id: '3', name: 'Special Allowance', amount: employee.specialAllowance }] : []),
        ...(employee.otherEarnings ? [{ id: '4', name: 'Other Earnings', amount: employee.otherEarnings }] : [])
      ];

      let deductions: { id: string; name: string; amount: number; }[] = [];
      let taxCalculation: TaxCalculation | undefined;

      if (taxConfig) {
        const tempData: SalaryData = {
          company,
          employee: {
            name: employee.name,
            id: employee.employeeId,
            designation: employee.designation,
            department: employee.department,
            doj: employee.doj,
            email: employee.email,
            panNumber: employee.panNumber,
            bankAccount: employee.bankAccount,
            bankName: employee.bankName,
            ifscCode: employee.ifscCode
          },
          salary: {
            month,
            year,
            paidDays: employee.paidDays || 30,
            lopDays: employee.lopDays || 0
          },
          earnings,
          deductions: [],
        };

        taxCalculation = calculateTax(tempData, taxConfig);
        
        if (taxCalculation && taxCalculation.breakdown.length > 0) {
          deductions = taxCalculation.breakdown
            .filter(b => b.isDeduction)
            .map((b, idx) => ({
              id: `tax-${idx}`,
              name: b.ruleName,
              amount: b.calculatedAmount
            }));
        }
      }

      const data: SalaryData = {
        company,
        employee: {
          name: employee.name,
          id: employee.employeeId,
          designation: employee.designation,
          department: employee.department,
          doj: employee.doj,
          email: employee.email,
          panNumber: employee.panNumber,
          bankAccount: employee.bankAccount,
          bankName: employee.bankName,
          ifscCode: employee.ifscCode
        },
        salary: {
          month,
          year,
          paidDays: employee.paidDays || 30,
          lopDays: employee.lopDays || 0,
          basicSalary: employee.basicSalary,
          taxConfigId: taxConfig?.id,
          taxCalculation
        },
        earnings,
        deductions,
      };

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm';
      document.body.appendChild(container);

      const canvas = await renderPayslipToCanvas(data, container);
      
      if (!canvas) {
        throw new Error('Failed to render payslip');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const pdfData = pdf.output('datauristring');

      document.body.removeChild(container);

      return {
        success: true,
        employeeId: employee.employeeId,
        name: employee.name,
        pdfData
      };
    } catch (error) {
      return {
        success: false,
        employeeId: employee.employeeId,
        name: employee.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const renderPayslipToCanvas = async (data: SalaryData, container: HTMLDivElement): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      const root = document.createElement('div');
      root.innerHTML = generatePayslipHTML(data);
      container.appendChild(root);

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(root, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123
          });
          resolve(canvas);
        } catch {
          resolve(null);
        }
      }, 100);
    });
  };

  const generatePayslipHTML = (data: SalaryData): string => {
    const totalEarnings = data.earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDeductions = data.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const netPay = totalEarnings - totalDeductions;

    const fmt = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const netPayWords = netPay > 0
      ? toWords(netPay).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) + ' Rupees Only'
      : 'Zero Rupees Only';

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '-';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const maxRows = Math.max(data.earnings.length, data.deductions.length, 5);

    return `
      <div style="
        width: 210mm;
        min-height: 297mm;
        padding: 18mm 20mm;
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #1a1a1a;
        font-size: 9pt;
        line-height: 1.6;
        background-color: #fff;
        display: flex;
        flex-direction: column;
      ">
        <!-- Header -->
        <div style="position: relative; border-bottom: 1.5px solid #000; padding-bottom: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              ${data.company.logo ? `
                <img src="${data.company.logo}" style="height: 48px; object-fit: contain; max-width: 200px; margin-bottom: 8px;" />
              ` : `
                <h1 style="font-size: 18pt; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000;">
                  ${data.company.name || 'Company Name'}
                </h1>
              `}
              <p style="font-size: 7.5pt; color: #4b5563; margin: 4px 0 0 0; max-width: 350px; white-space: pre-line; line-height: 1.5;">
                ${data.company.address || 'Company Address'}
              </p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 15pt; font-weight: 800; letter-spacing: 0.12em; margin: 0; color: #000;">
                PAYSLIP
              </h2>
              <p style="font-size: 9pt; color: #4b5563; margin: 4px 0 0 0; font-weight: 600;">
                ${data.salary.month} ${data.salary.year}
              </p>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 24px;">
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; background-color: #fafafa;">
            <p style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin: 0 0 10px 0;">
              Employee Details
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 90px;">Name</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${data.employee.name || '-'}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 90px;">Designation</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${data.employee.designation || '-'}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 90px;">Department</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${data.employee.department || '-'}</span>
              </div>
            </div>
          </div>
          <div style="flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; background-color: #fafafa;">
            <p style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin: 0 0 10px 0;">
              Employment Information
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 100px;">Employee ID</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${data.employee.id || '-'}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 100px;">Date of Joining</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${formatDate(data.employee.doj)}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="font-size: 8.5pt; color: #6b7280; width: 100px;">Paid Days / LOP</span>
                <span style="font-size: 8.5pt; font-weight: 600; color: #111827; flex: 1;">: ${data.salary.paidDays} / ${data.salary.lopDays}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Salary Table -->
        <div style="margin-bottom: 24px; border: 1px solid #000; border-radius: 4px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb; border-bottom: 1.5px solid #000;">
                <th style="padding: 10px 16px; text-align: left; font-size: 7.5pt; font-weight: 700; color: #374151; text-transform: uppercase; width: 30%;">Earnings</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 7.5pt; font-weight: 700; color: #374151; text-transform: uppercase; width: 20%;">Amount</th>
                <th style="padding: 10px 16px; text-align: left; font-size: 7.5pt; font-weight: 700; color: #374151; text-transform: uppercase; width: 30%; border-left: 1.5px solid #000;">Deductions</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 7.5pt; font-weight: 700; color: #374151; text-transform: uppercase; width: 20%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: maxRows }).map((_, idx) => {
                const e = data.earnings[idx];
                const d = data.deductions[idx];
                return `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 10px 16px; font-size: 9pt; color: #1f2937;">${e?.name || ''}</td>
                    <td style="padding: 10px 16px; text-align: right; font-size: 9pt; font-weight: 500; white-space: nowrap;">
                      ${e?.amount ? `Rs. ${fmt(e.amount)}` : ''}
                    </td>
                    <td style="padding: 10px 16px; font-size: 9pt; color: #1f2937; border-left: 1.5px solid #000;">${d?.name || ''}</td>
                    <td style="padding: 10px 16px; text-align: right; font-size: 9pt; font-weight: 500; white-space: nowrap;">
                      ${d?.amount ? `Rs. ${fmt(d.amount)}` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f9fafb; border-top: 1.5px solid #000;">
                <td style="padding: 12px 16px; font-size: 9pt; font-weight: 700;">Total Earnings</td>
                <td style="padding: 12px 16px; text-align: right; font-size: 9pt; font-weight: 700; white-space: nowrap;">
                  Rs. ${fmt(totalEarnings)}
                </td>
                <td style="padding: 12px 16px; font-size: 9pt; font-weight: 700; border-left: 1.5px solid #000;">
                  Total Deductions
                </td>
                <td style="padding: 12px 16px; text-align: right; font-size: 9pt; font-weight: 700; white-space: nowrap;">
                  Rs. ${fmt(totalDeductions)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 20px; margin-bottom: 24px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px; display: flex; flex-direction: column; justify-content: center;">
            <p style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin: 0 0 6px 0;">
              Net Pay (In Words)
            </p>
            <p style="font-size: 10pt; font-weight: 600; color: #111827; margin: 0; line-height: 1.5;">
              ${netPayWords}
            </p>
          </div>
          <div style="background-color: #111827; border-radius: 6px; padding: 14px 18px; display: flex; flex-direction: column; justify-content: center;">
            <p style="font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 4px 0;">
              Net Payable Amount
            </p>
            <p style="font-size: 18pt; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.01em;">
              Rs. ${fmt(netPay)}
            </p>
          </div>
        </div>

        <!-- Spacer -->
        <div style="flex: 1; min-height: 60px;"></div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
          <p style="font-size: 7pt; color: #6b7280; margin: 0; font-style: italic;">
            This is a computer-generated document and does not require a physical signature.
          </p>
          <p style="font-size: 6.5pt; color: #9ca3af; margin: 6px 0 0 0;">
            Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    `;
  };

  const generateAll = async () => {
    setIsGenerating(true);
    setResults([]);
    setProgress({ current: 0, total: employees.length });

    const generationResults: GenerationResult[] = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const result = await generateSinglePayslip(employee);
      generationResults.push(result);
      setProgress({ current: i + 1, total: employees.length });
    }

    setResults(generationResults);
    setIsGenerating(false);
    setShowDetails(true);
  };

  const downloadAllAsZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    const successful = results.filter(r => r.success && r.pdfData);
    
    successful.forEach(result => {
      if (result.pdfData) {
        const base64Data = result.pdfData.split(',')[1];
        zip.file(`${result.employeeId}_${result.name.replace(/\s+/g, '_')}.pdf`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslips_${month}_${year}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900">Bulk Payslip Generation</h3>
            </div>
            <span className="text-xs text-zinc-500">{employees.length} employees</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {isGenerating ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Generating payslips...</span>
                <span className="text-zinc-900 font-medium">{progress.current} / {progress.total}</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Check size={16} className="text-green-600" />
                    <span className="text-zinc-700">{successCount} successful</span>
                  </div>
                  {failureCount > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-zinc-700">{failureCount} failed</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                    <ChevronRight size={14} className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>
                  <button
                    onClick={generateAll}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <Loader2 size={14} className={isGenerating ? 'animate-spin' : ''} />
                    Regenerate
                  </button>
                </div>
              </div>

              {successCount > 0 && (
                <button
                  onClick={downloadAllAsZip}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={18} />
                  Download All as ZIP ({successCount} files)
                </button>
              )}

              {showDetails && (
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Employee</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-zinc-500">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {results.map((result, idx) => (
                        <tr key={idx} className={result.success ? 'bg-green-50/50' : 'bg-red-50/50'}>
                          <td className="px-4 py-2">
                            <div className="font-medium text-zinc-900">{result.name}</div>
                            <div className="text-xs text-zinc-500">{result.employeeId}</div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {result.success ? (
                              <Check size={16} className="text-green-600 mx-auto" />
                            ) : (
                              <X size={16} className="text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {result.success ? (
                              <span className="text-xs text-green-700">Generated successfully</span>
                            ) : (
                              <span className="text-xs text-red-600">{result.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={generateAll}
              disabled={employees.length === 0 || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <FileText size={18} />
              Generate {employees.length} Payslips
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
