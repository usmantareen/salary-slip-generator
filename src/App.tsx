import React, { useState, useRef } from 'react';
import { SalaryData, BulkUploadResult, BulkEmployeeData, TaxConfig } from './types';
import { SalarySlipForm } from './components/SalarySlipForm';
import { SalarySlipPreview } from './components/SalarySlipPreview';
import { TaxConfiguration } from './components/TaxConfiguration';
import { BulkUpload } from './components/BulkUpload';
import { BulkGenerator } from './components/BulkGenerator';
import {
  Download, FileText, Eye, Pencil, Loader2, Users,
  ChevronLeft, ArrowRight, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { defaultTaxConfigs, calculateTax } from './utils/taxCalculator';

const initialData: SalaryData = {
  company: {
    name: 'Example Corporation',
    address: '123 Business Street, Tech Park\nCity - 100001',
    logo: null,
  },
  employee: {
    name: 'John Doe',
    id: 'EMP-001',
    designation: 'Software Engineer',
    department: 'Engineering',
    doj: '2026-01-01',
    email: '',
    panNumber: '',
    bankAccount: '',
    bankName: '',
    ifscCode: ''
  },
  salary: {
    month: 'January',
    year: '2026',
    paidDays: 30,
    lopDays: 0,
  },
  earnings: [
    { id: '1', name: 'Basic Salary', amount: 30000 },
    { id: '2', name: 'House Rent Allowance', amount: 12000 },
    { id: '3', name: 'Special Allowance', amount: 5000 },
  ],
  deductions: [
    { id: '4', name: 'Provident Fund', amount: 3600 },
    { id: '5', name: 'Professional Tax', amount: 200 },
  ],
};

type ViewMode = 'single' | 'bulk';
type PanelView = 'form' | 'preview';

export default function App() {
  const [data, setData] = useState<SalaryData>(initialData);
  const [panelView, setPanelView] = useState<PanelView>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [currentTaxConfig, setCurrentTaxConfig] = useState<TaxConfig>(defaultTaxConfigs[0]);
  const [bulkData, setBulkData] = useState<BulkUploadResult | null>(null);
  const [selectedBulkEmployees, setSelectedBulkEmployees] = useState<BulkEmployeeData[]>([]);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const netPay = data.earnings.reduce((s, e) => s + e.amount, 0)
    - data.deductions.reduce((s, d) => s + d.amount, 0);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(previewRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const preview = clonedDoc.getElementById('printable-area');
          if (preview) {
            preview.style.transform = 'none';
            preview.style.margin = '0';
          }
        }
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Salary_Slip_${data.employee.name.replace(/\s+/g, '_')}_${data.salary.month}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Failed to generate PDF. Please try again.');
      setTimeout(() => setPdfError(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaxConfigChange = (config: TaxConfig) => {
    setCurrentTaxConfig(config);
    const taxCalc = calculateTax(data, config);
    if (taxCalc.breakdown.length > 0) {
      const newDeductions = taxCalc.breakdown
        .filter(b => b.isDeduction)
        .map((b, idx) => ({ id: `tax-${idx}`, name: b.ruleName, amount: b.calculatedAmount }));
      const nonTaxDeductions = data.deductions.filter(d => !d.id.startsWith('tax-'));
      setData({
        ...data,
        deductions: [...nonTaxDeductions, ...newDeductions],
        salary: { ...data.salary, taxConfigId: config.id, taxCalculation: taxCalc }
      });
    }
  };

  const handleBulkDataUpload = (result: BulkUploadResult) => {
    setBulkData(result);
    setSelectedBulkEmployees(result.valid);
  };

  const handleClearBulkData = () => {
    setBulkData(null);
    setSelectedBulkEmployees([]);
  };

  const isPreview = panelView === 'preview';

  return (
    <div className="min-h-screen" style={{ background: 'var(--clr-bg)' }}>

      {pdfError && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          padding: '10px 16px', background: '#dc2626', color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {pdfError}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="app-header">
        <div className="page-container">
          <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--clr-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  salary slip generator
                </span>
                <p style={{ fontSize: 10, color: 'var(--clr-text-muted)', fontWeight: 500, marginTop: 1, display: 'none' }}
                  className="sm-show">Professional Generator</p>
              </div>
            </div>

            {/* Center: Badge (bulk) */}
            {viewMode === 'bulk' && selectedBulkEmployees.length > 0 && (
              <div className="badge" style={{ flexShrink: 0 }}>
                <Users size={11} style={{ marginRight: 4 }} />
                {selectedBulkEmployees.length} employees
              </div>
            )}

            {/* Right: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Mode Tabs */}
              <div className="tab-group">
                <button
                  id="tab-single"
                  className={`tab-btn ${viewMode === 'single' ? 'active' : ''}`}
                  onClick={() => setViewMode('single')}
                >
                  Single
                </button>
                <button
                  id="tab-bulk"
                  className={`tab-btn ${viewMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setViewMode('bulk')}
                >
                  <Users size={12} />
                  <span className="hidden sm:inline">Bulk</span>
                </button>
              </div>

              {/* Single-mode actions */}
              {viewMode === 'single' && (
                <>
                  <button
                    id="btn-toggle-view"
                    onClick={() => setPanelView(isPreview ? 'form' : 'preview')}
                    className="btn btn-secondary"
                    style={{ padding: '7px 13px', fontSize: 12 }}
                  >
                    {isPreview ? <Pencil size={13} /> : <Eye size={13} />}
                    <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
                  </button>

                  {isPreview && (
                    <button
                      id="btn-export-pdf"
                      onClick={handleDownloadPDF}
                      disabled={isGenerating}
                      className="btn btn-dark"
                      style={{ padding: '7px 14px', fontSize: 12 }}
                    >
                      {isGenerating
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Download size={13} />
                      }
                      <span className="hidden sm:inline">{isGenerating ? 'Exporting…' : 'Export PDF'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="page-container">
        {viewMode === 'single' ? (

          <div className="main-grid">
            {/* Left column */}
            <div className="animate-fade-in-up" style={{ minWidth: 0 }}>

              {/* Section heading */}
              <div style={{ marginBottom: 20 }}>
                {isPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => setPanelView('form')}
                      className="btn-ghost btn"
                      style={{ padding: '5px 8px', fontSize: 12 }}
                    >
                      <ChevronLeft size={15} />
                      Edit
                    </button>
                    <div>
                      <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--clr-text)', margin: 0, letterSpacing: '-0.02em' }}>
                        Preview
                      </h1>
                      <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', margin: 0, marginTop: 1 }}>
                        A4 format · print ready
                      </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className="btn btn-dark"
                        style={{ fontSize: 12 }}
                      >
                        {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                        {isGenerating ? 'Exporting…' : 'Export PDF'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--clr-text)', margin: 0, letterSpacing: '-0.02em' }}>
                        Configure Salary Slip
                      </h1>
                      <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', margin: 0, marginTop: 2 }}>
                        Fill in the details below to generate a professional salary slip
                      </p>
                    </div>
                    <button
                      onClick={() => setPanelView('preview')}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, flexShrink: 0 }}
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview</span>
                      <ArrowRight size={12} style={{ color: 'var(--clr-text-muted)' }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Panel content */}
              {isPreview ? (
                <div className="preview-shell animate-fade-in-up">
                  <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div
                      className="shadow-2xl bg-white"
                      style={{
                        width: '210mm',
                        borderRadius: 4,
                        transformOrigin: 'top center',
                        transform: `scale(${typeof window !== 'undefined'
                          ? Math.min(1, (window.innerWidth < 1024
                            ? (window.innerWidth - 48)
                            : Math.min(window.innerWidth - 400, 800)) / 794)
                          : 1})`,
                        marginBottom: typeof window !== 'undefined'
                          ? `-${794 * (1 - Math.min(1, (window.innerWidth < 1024
                            ? (window.innerWidth - 48)
                            : Math.min(window.innerWidth - 400, 800)) / 794))}px`
                          : '0'
                      }}
                    >
                      <SalarySlipPreview data={data} previewRef={previewRef} taxConfig={currentTaxConfig} />
                    </div>
                  </div>
                </div>
              ) : (
                <SalarySlipForm data={data} onChange={setData} taxConfig={currentTaxConfig} />
              )}
            </div>

            {/* Right sidebar */}
            <aside className="sidebar-panel animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <TaxConfiguration
                data={data}
                onConfigChange={handleTaxConfigChange}
                currentConfig={currentTaxConfig}
              />
            </aside>
          </div>

        ) : (

          /* ── BULK MODE ─────────────────────────────────── */
          <div className="main-grid">
            <div className="animate-fade-in-up" style={{ minWidth: 0 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <button
                    onClick={() => setViewMode('single')}
                    className="btn-ghost btn"
                    style={{ padding: '5px 8px', fontSize: 12 }}
                  >
                    <ChevronLeft size={15} />
                    Single
                  </button>
                  <div className="badge">
                    <Sparkles size={10} style={{ marginRight: 4 }} />
                    Bulk Mode
                  </div>
                </div>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--clr-text)', margin: 0, letterSpacing: '-0.02em' }}>
                  Bulk Payslip Generation
                </h1>
                <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2, margin: 0 }}>
                  Upload employee data to generate multiple payslips at once
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <BulkUpload
                  onBulkDataUpload={handleBulkDataUpload}
                  onClearData={handleClearBulkData}
                  company={data.company}
                  month={data.salary.month}
                  year={data.salary.year}
                  taxConfig={currentTaxConfig}
                />

                {bulkData && selectedBulkEmployees.length > 0 && (
                  <BulkGenerator
                    employees={selectedBulkEmployees}
                    company={data.company}
                    month={data.salary.month}
                    year={data.salary.year}
                    taxConfig={currentTaxConfig}
                  />
                )}
              </div>
            </div>

            <aside className="sidebar-panel animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <TaxConfiguration
                data={data}
                onConfigChange={handleTaxConfigChange}
                currentConfig={currentTaxConfig}
              />
            </aside>
          </div>

        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'var(--clr-surface)', marginTop: 60 }}>
        <div className="page-container">
          <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', margin: 0 }}>
              Open source project by <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>Usman Tareen</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--clr-text-muted)', margin: 0 }}>
              MIT License · Free to use and modify
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
