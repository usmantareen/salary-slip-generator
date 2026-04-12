import React, { useState, useRef } from 'react';
import { BulkEmployeeData, BulkUploadResult, SalaryData, TaxConfig } from '../types';
import { Upload, Download, FileSpreadsheet, Check, X, AlertCircle, Users } from 'lucide-react';

interface Props {
  onBulkDataUpload: (data: BulkUploadResult) => void;
  onClearData: () => void;
  company: SalaryData['company'];
  month: string;
  year: string;
  taxConfig: TaxConfig | null;
}

const CSV_TEMPLATE_HEADERS = [
  'employeeId',
  'name',
  'designation',
  'department',
  'doj',
  'email',
  'panNumber',
  'bankAccount',
  'bankName',
  'ifscCode',
  'basicSalary',
  'hra',
  'specialAllowance',
  'otherEarnings',
  'paidDays',
  'lopDays'
];

const SAMPLE_DATA = [
  'EMP001,John Doe,Software Engineer,Engineering,2026-01-15,john@example.com,ABCDE1234F,1234567890,State Bank,SBIN0001234,50000,20000,10000,5000,30,0',
  'EMP002,Jane Smith,Product Manager,Product,2023-06-01,jane@example.com,FGHIJ5678K,0987654321,HDFC Bank,HDFC0005678,80000,32000,15000,8000,30,0'
];

export function BulkUpload({ onBulkDataUpload, onClearData, company, month, year, taxConfig }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      CSV_TEMPLATE_HEADERS.join(','),
      ...SAMPLE_DATA
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-template-${month}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): BulkEmployeeData[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const data: BulkEmployeeData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push({
        employeeId: row.employeeid || row.employeeId || '',
        name: row.name || '',
        designation: row.designation || '',
        department: row.department || '',
        doj: row.doj || '',
        email: row.email || '',
        panNumber: row.pannumber || row.panNumber || '',
        bankAccount: row.bankaccount || row.bankAccount || '',
        bankName: row.bankname || row.bankName || '',
        ifscCode: row.ifsccode || row.ifscCode || '',
        basicSalary: parseFloat(row.basicsalary || row.basicSalary) || 0,
        hra: parseFloat(row.hra) || 0,
        specialAllowance: parseFloat(row.specialallowance || row.specialAllowance) || 0,
        otherEarnings: parseFloat(row.otherearnings || row.otherEarnings) || 0,
        paidDays: parseInt(row.paiddays || row.paidDays) || 30,
        lopDays: parseInt(row.lopdays || row.lopDays) || 0,
        errors: []
      });
    }
    
    return data;
  };

  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validateData = (data: BulkEmployeeData[]): BulkUploadResult => {
    const valid: BulkEmployeeData[] = [];
    const invalid: BulkEmployeeData[] = [];
    
    data.forEach((row, index) => {
      const errors: string[] = [];
      
      if (!row.employeeId.trim()) errors.push('Employee ID is required');
      if (!row.name.trim()) errors.push('Name is required');
      if (!row.designation.trim()) errors.push('Designation is required');
      if (!row.department.trim()) errors.push('Department is required');
      if (!row.doj.trim()) errors.push('Date of Joining is required');
      if (row.basicSalary <= 0) errors.push('Basic Salary must be greater than 0');
      
      const paidDays = row.paidDays ?? 0;
      const lopDays = row.lopDays ?? 0;
      
      if (paidDays < 0 || paidDays > 31) errors.push('Paid Days must be between 0-31');
      if (lopDays < 0 || lopDays > 31) errors.push('LOP Days must be between 0-31');
      
      if (errors.length > 0) {
        invalid.push({ ...row, errors });
      } else {
        valid.push(row);
      }
    });
    
    return { valid, invalid, totalCount: data.length };
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedData = parseCSV(content);
      const result = validateData(parsedData);
      setUploadResult(result);
      onBulkDataUpload(result);
      setSelectedRows(new Set(result.valid.map((_, i) => i)));
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
      handleFileUpload(file);
    }
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const selectAll = () => {
    if (uploadResult) {
      setSelectedRows(new Set(uploadResult.valid.map((_, i) => i)));
    }
  };

  const deselectAll = () => {
    setSelectedRows(new Set());
  };

  const getSelectedEmployees = (): BulkEmployeeData[] => {
    if (!uploadResult) return [];
    return Array.from(selectedRows).map(i => uploadResult.valid[i]).filter(Boolean);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-1">
          <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} />
            Bulk Employee Upload
          </h3>
        </div>
        <div className="px-5 pb-5 pt-3 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={14} />
              Download Template
            </button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Upload size={32} className="mx-auto mb-3 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-700 mb-1">
              Drop CSV file here or click to upload
            </p>
            <p className="text-xs text-zinc-500">
              Supports employee data in CSV format
            </p>
          </div>

          {uploadResult && (
            <div className="flex items-center justify-between bg-zinc-50 rounded-lg p-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <Check size={16} className="text-green-600" />
                  <span className="text-zinc-700">{uploadResult.valid.length} valid</span>
                </div>
                {uploadResult.invalid.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <X size={16} className="text-red-600" />
                    <span className="text-zinc-700">{uploadResult.invalid.length} invalid</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setUploadResult(null);
                  setShowPreview(false);
                  onClearData();
                }}
                className="text-xs text-zinc-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && uploadResult && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Preview ({selectedRows.size} selected)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-xs px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === uploadResult.valid.length && uploadResult.valid.length > 0}
                      onChange={() => selectedRows.size === uploadResult.valid.length ? deselectAll() : selectAll()}
                      className="rounded border-zinc-300"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Designation</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Basic</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {uploadResult.valid.map((row, index) => {
                  const grossPay = row.basicSalary + (row.hra || 0) + (row.specialAllowance || 0) + (row.otherEarnings || 0);
                  const isSelected = selectedRows.has(index);
                  
                  return (
                    <tr 
                      key={index}
                      className={`hover:bg-zinc-50 cursor-pointer ${isSelected ? 'bg-zinc-50' : ''}`}
                      onClick={() => toggleRowSelection(index)}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRowSelection(index);
                          }}
                          className="rounded border-zinc-300"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-zinc-900">{row.employeeId}</td>
                      <td className="px-4 py-2 text-zinc-700">{row.name}</td>
                      <td className="px-4 py-2 text-zinc-600">{row.designation}</td>
                      <td className="px-4 py-2 text-right font-medium text-zinc-900">
                        {taxConfig?.currency || 'USD'} {row.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-600">
                        {taxConfig?.currency || 'USD'} {grossPay.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {uploadResult.invalid.length > 0 && (
            <div className="border-t border-zinc-200">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                  <AlertCircle size={16} />
                  Invalid Records ({uploadResult.invalid.length})
                </div>
              </div>
              <div className="max-h-48 overflow-auto">
                {uploadResult.invalid.map((row, index) => (
                  <div key={index} className="px-5 py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-900">{row.name || row.employeeId || `Row ${index + 1}`}</span>
                    </div>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {row.errors?.map((error, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <X size={10} />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { BulkUploadResult };

function getSelectedEmployees(uploadResult: BulkUploadResult | null, selectedRows: Set<number>): BulkEmployeeData[] {
  if (!uploadResult) return [];
  return Array.from(selectedRows).map(i => uploadResult.valid[i]).filter(Boolean);
}
