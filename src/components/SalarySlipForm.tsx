import React from 'react';
import { SalaryData, SalaryItem, TaxConfig } from '../types';
import { Plus, Trash2, Upload, X, CircleDollarSign } from 'lucide-react';

interface Props {
  data: SalaryData;
  onChange: (data: SalaryData) => void;
  taxConfig?: TaxConfig;
}

/* ─── Sub-components ──────────────────────────────────────── */

function FieldGroup({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="card animate-fade-in-up">
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {icon && <span style={{ color: 'var(--clr-accent)', opacity: 0.8 }}>{icon}</span>}
          {title}
        </span>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="field-label">{children}</label>;
}

function InlineInput({
  label: lbl,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <FieldLabel>{lbl}</FieldLabel>
      <input {...props} className="field" />
    </div>
  );
}

function InlineTextarea({
  label: lbl,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <FieldLabel>{lbl}</FieldLabel>
      <textarea {...props} className="field" />
    </div>
  );
}

interface SalaryRowProps {
  item: SalaryItem;
  onNameChange: (v: string) => void;
  onAmountChange: (v: number) => void;
  onRemove: () => void;
}

function SalaryRow({ item, onNameChange, onAmountChange, onRemove }: SalaryRowProps) {
  return (
    <div className="salary-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        placeholder="Component name"
        value={item.name}
        onChange={e => onNameChange(e.target.value)}
        style={{
          flex: 1,
          padding: '7px 10px',
          background: '#f9fafb',
          border: '1.5px solid transparent',
          borderRadius: 7,
          fontSize: 12.5,
          color: 'var(--clr-text)',
          fontFamily: 'inherit',
          fontWeight: 500,
          transition: 'all 150ms',
          outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#71717a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgb(0 0 0 / .06)'; }}
        onBlur={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      <input
        type="number"
        placeholder="0"
        value={item.amount || ''}
        onChange={e => onAmountChange(Number(e.target.value))}
        style={{
          width: 88,
          padding: '7px 10px',
          background: '#f9fafb',
          border: '1.5px solid transparent',
          borderRadius: 7,
          fontSize: 12.5,
          color: 'var(--clr-text)',
          fontFamily: 'inherit',
          fontWeight: 700,
          textAlign: 'right',
          transition: 'all 150ms',
          outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#71717a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgb(0 0 0 / .06)'; }}
        onBlur={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      <button
        onClick={onRemove}
        className="salary-row-delete"
        title="Remove"
        style={{
          padding: 5, borderRadius: 6, border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: '#d1d5db', transition: 'all 150ms',
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface SalaryColHeaderProps {
  label: string;
  onAdd: () => void;
}

function SalaryColHeader({ label: lbl, onAdd }: SalaryColHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span className="field-label" style={{ marginBottom: 0 }}>{lbl}</span>
      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 9px', borderRadius: 6,
          border: '1.5px dashed var(--clr-border)',
          background: 'transparent', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)',
          transition: 'all 150ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#71717a'; e.currentTarget.style.color = '#18181b'; e.currentTarget.style.background = '#f4f4f5'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.color = 'var(--clr-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <Plus size={12} />
        Add
      </button>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */

export function SalarySlipForm({ data, onChange, taxConfig }: Props) {

  /* Company */
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...data, company: { ...data.company, [e.target.name]: e.target.value } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange({ ...data, company: { ...data.company, logo: reader.result as string } });
    reader.readAsDataURL(file);
  };

  /* Employee */
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, employee: { ...data.employee, [e.target.name]: e.target.value } });
  };

  /* Salary period */
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    onChange({ ...data, salary: { ...data.salary, [e.target.name]: value } });
  };

  /* Earnings */
  const addEarning = () =>
    onChange({ ...data, earnings: [...data.earnings, { id: Date.now().toString(), name: '', amount: 0 }] });
  const removeEarning = (id: string) =>
    onChange({ ...data, earnings: data.earnings.filter(e => e.id !== id) });
  const updateEarning = (id: string, f: keyof SalaryItem, v: string | number) =>
    onChange({ ...data, earnings: data.earnings.map(e => e.id === id ? { ...e, [f]: v } : e) });

  /* Deductions */
  const addDeduction = () =>
    onChange({ ...data, deductions: [...data.deductions, { id: Date.now().toString(), name: '', amount: 0 }] });
  const removeDeduction = (id: string) =>
    onChange({ ...data, deductions: data.deductions.filter(d => d.id !== id) });
  const updateDeduction = (id: string, f: keyof SalaryItem, v: string | number) =>
    onChange({ ...data, deductions: data.deductions.map(d => d.id === id ? { ...d, [f]: v } : d) });

  /* Totals */
  const totalEarnings   = data.earnings.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalDeductions = data.deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const netPay          = totalEarnings - totalDeductions;

  const currency = taxConfig?.currency || 'INR';

  const fmt = (n: number) =>
    n.toLocaleString('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="stagger-children">

      {/* Row 1: Company + Employee */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Company */}
        <FieldGroup title="Company">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Logo upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {data.company.logo && (
                <div style={{ position: 'relative' }}>
                  <img
                    src={data.company.logo}
                    alt="Company logo"
                    style={{ height: 40, width: 40, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--clr-border)', padding: 4 }}
                  />
                  <button
                    onClick={() => onChange({ ...data, company: { ...data.company, logo: null } })}
                    title="Remove logo"
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#374151', color: '#fff', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 1px 3px rgb(0 0 0 / .3)',
                    }}
                  >
                    <X size={9} />
                  </button>
                </div>
              )}
              <label
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px',
                  border: '1.5px dashed var(--clr-border)',
                  borderRadius: 8, cursor: 'pointer',
                  fontSize: 11.5, fontWeight: 600, color: 'var(--clr-text-muted)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#71717a'; e.currentTarget.style.color = '#18181b'; e.currentTarget.style.background = '#f4f4f5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.color = 'var(--clr-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Upload size={13} />
                {data.company.logo ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
            </div>

            <InlineInput label="Company Name" type="text" name="name" value={data.company.name} onChange={handleCompanyChange} placeholder="Acme Corporation" />
            <InlineTextarea label="Address" name="address" value={data.company.address} onChange={handleCompanyChange} rows={2} style={{ resize: 'none' }} placeholder="Full address..." />
          </div>
        </FieldGroup>

        {/* Employee */}
        <FieldGroup title="Employee">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InlineInput label="Full Name" type="text" name="name" value={data.employee.name} onChange={handleEmployeeChange} placeholder="John Doe" />
              <InlineInput label="Employee ID" type="text" name="id" value={data.employee.id} onChange={handleEmployeeChange} placeholder="EMP-001" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InlineInput label="Designation" type="text" name="designation" value={data.employee.designation} onChange={handleEmployeeChange} placeholder="Engineer" />
              <InlineInput label="Department" type="text" name="department" value={data.employee.department} onChange={handleEmployeeChange} placeholder="Engineering" />
            </div>
            <InlineInput label="Date of Joining" type="date" name="doj" value={data.employee.doj} onChange={handleEmployeeChange} />
          </div>
        </FieldGroup>
      </div>

      {/* Row 2: Period + Signatures + Salary Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>

        {/* Period */}
        <FieldGroup title="Pay Period">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <FieldLabel>Month</FieldLabel>
                <select name="month" value={data.salary.month} onChange={handleSalaryChange} className="field" style={{ fontSize: 13 }}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <InlineInput label="Year" type="number" name="year" value={data.salary.year} onChange={handleSalaryChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InlineInput label="Paid Days" type="number" name="paidDays" value={data.salary.paidDays} onChange={handleSalaryChange} min={0} max={31} />
              <InlineInput label="LOP Days" type="number" name="lopDays" value={data.salary.lopDays} onChange={handleSalaryChange} min={0} max={31} />
            </div>
          </div>
        </FieldGroup>

      </div>

      {/* Row 3: Salary Breakdown (full width) */}
      <div className="card animate-fade-in-up">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <CircleDollarSign size={13} style={{ color: 'var(--clr-text-muted)', opacity: 0.8 }} />
            Salary Breakdown
          </span>
          {/* Summary chips */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 500 }}>
              Gross: <strong style={{ color: 'var(--clr-text)' }}>{fmt(totalEarnings)}</strong>
            </span>
            <span style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 500 }}>
              Ded: <strong style={{ color: 'var(--clr-danger)' }}>{fmt(totalDeductions)}</strong>
            </span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>

            {/* Earnings */}
            <div>
              <SalaryColHeader label="Earnings" onAdd={addEarning} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.earnings.map(item => (
                  <SalaryRow
                    key={item.id}
                    item={item}
                    onNameChange={v => updateEarning(item.id, 'name', v)}
                    onAmountChange={v => updateEarning(item.id, 'amount', v)}
                    onRemove={() => removeEarning(item.id)}
                  />
                ))}
                {data.earnings.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--clr-text-subtle)', textAlign: 'center', padding: '12px 0' }}>
                    No earnings added
                  </p>
                )}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <SalaryColHeader label="Deductions" onAdd={addDeduction} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.deductions.map(item => (
                  <SalaryRow
                    key={item.id}
                    item={item}
                    onNameChange={v => updateDeduction(item.id, 'name', v)}
                    onAmountChange={v => updateDeduction(item.id, 'amount', v)}
                    onRemove={() => removeDeduction(item.id)}
                  />
                ))}
                {data.deductions.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--clr-text-subtle)', textAlign: 'center', padding: '12px 0' }}>
                    No deductions added
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Net Pay Summary Bar */}
          <div style={{
            marginTop: 20,
            padding: '14px 16px',
            background: '#f4f4f5',
            borderRadius: 10,
            border: '1px solid #e4e4e7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Gross Pay</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--clr-text)', margin: 0 }}>{fmt(totalEarnings)}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Total Deductions</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--clr-danger)', margin: 0 }}>- {fmt(totalDeductions)}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Net Payable</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#09090b', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{fmt(netPay)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
