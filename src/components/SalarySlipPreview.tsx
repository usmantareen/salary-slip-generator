import React from 'react';
import { SalaryData } from '../types';
import { toWords } from 'number-to-words';

interface Props {
  data: SalaryData;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function SalarySlipPreview({ data, previewRef }: Props) {
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
    ? toWords(netPay).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Rupees Only'
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

  const maxRows = Math.max(data.earnings.length, data.deductions.length, 1);

  const hasSignature = data.signatures.employeeSignature || data.signatures.authorizedSignatory || data.signatures.companySeal;

  return (
    <div
      ref={previewRef}
      id="printable-area"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '18mm 20mm',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#1a1a1a',
        fontSize: '9pt',
        lineHeight: '1.6',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ position: 'relative', borderBottom: '1.5px solid #000', paddingBottom: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {data.company.logo ? (
              <img
                src={data.company.logo}
                alt="Logo"
                style={{ height: 48, objectFit: 'contain', maxWidth: 200, marginBottom: 8 }}
              />
            ) : (
              <h1 style={{ fontSize: '18pt', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: '#000' }}>
                {data.company.name || 'Company Name'}
              </h1>
            )}
            <p style={{ fontSize: '7.5pt', color: '#4b5563', margin: '4px 0 0 0', maxWidth: 350, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
              {data.company.address || 'Company Address'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '15pt', fontWeight: 800, letterSpacing: '0.12em', margin: 0, color: '#000' }}>
              PAYSLIP
            </h2>
            <p style={{ fontSize: '9pt', color: '#4b5563', margin: '4px 0 0 0', fontWeight: 600 }}>
              {data.salary.month} {data.salary.year}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 16px', backgroundColor: '#fafafa' }}>
          <p style={{ fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', margin: '0 0 10px 0' }}>
            Employee Details
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Name', data.employee.name],
              ['Designation', data.employee.designation],
              ['Department', data.employee.department],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: '8.5pt', color: '#6b7280', width: 90 }}>{l}</span>
                <span style={{ fontSize: '8.5pt', fontWeight: 600, color: '#111827', flex: 1 }}>: {v || '-'}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 16px', backgroundColor: '#fafafa' }}>
          <p style={{ fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', margin: '0 0 10px 0' }}>
            Employment Information
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Employee ID', data.employee.id],
              ['Date of Joining', formatDate(data.employee.doj)],
              ['Paid Days / LOP', `${data.salary.paidDays} / ${data.salary.lopDays}`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: '8.5pt', color: '#6b7280', width: 100 }}>{l}</span>
                <span style={{ fontSize: '8.5pt', fontWeight: 600, color: '#111827', flex: 1 }}>: {v || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div style={{ marginBottom: 24, border: '1px solid #000', borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #000' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '7.5pt', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '30%' }}>Earnings</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '7.5pt', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '20%' }}>Amount</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '7.5pt', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '30%', borderLeft: '1.5px solid #000' }}>Deductions</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '7.5pt', fontWeight: 700, color: '#374151', textTransform: 'uppercase', width: '20%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(maxRows, 5) }).map((_, idx) => {
              const earning = data.earnings[idx];
              const deduction = data.deductions[idx];
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 16px', fontSize: '9pt', color: '#1f2937' }}>{earning?.name || ''}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: '9pt', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {earning?.amount ? `Rs. ${fmt(earning.amount)}` : ''}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '9pt', color: '#1f2937', borderLeft: '1.5px solid #000' }}>{deduction?.name || ''}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: '9pt', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {deduction?.amount ? `Rs. ${fmt(deduction.amount)}` : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f9fafb', borderTop: '1.5px solid #000' }}>
              <td style={{ padding: '12px 16px', fontSize: '9pt', fontWeight: 700 }}>Total Earnings</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '9pt', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Rs. {fmt(totalEarnings)}
              </td>
              <td style={{ padding: '12px 16px', fontSize: '9pt', fontWeight: 700, borderLeft: '1.5px solid #000' }}>
                Total Deductions
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '9pt', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Rs. {fmt(totalDeductions)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 20, marginBottom: 24 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', margin: '0 0 6px 0' }}>
            Net Pay (In Words)
          </p>
          <p style={{ fontSize: '10pt', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.5 }}>
            {netPayWords}
          </p>
        </div>
        <div style={{ backgroundColor: '#111827', borderRadius: 6, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '7pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 4px 0' }}>
            Net Payable Amount
          </p>
          <p style={{ fontSize: '18pt', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
            Rs. {fmt(netPay)}
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 60 }} />

      {/* Signatures */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {([
            { key: 'employeeSignature' as const, label: 'Employee Signature' },
            { key: 'authorizedSignatory' as const, label: 'Authorized Signatory' },
            { key: 'companySeal' as const, label: 'Company Seal' },
          ]).map(({ key, label }) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #9ca3af', height: 64, marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 10px' }}>
                {data.signatures[key] && (
                  <img
                    src={data.signatures[key]!}
                    alt={label}
                    style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <p style={{ fontSize: '6.5pt', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
        <p style={{ fontSize: '7pt', color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
          This is a computer-generated document and does not require a physical signature.
        </p>
        <p style={{ fontSize: '6.5pt', color: '#9ca3af', margin: '6px 0 0 0' }}>
          Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
