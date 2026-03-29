# Salary Slip Generator

Generate professional salary slips with PDF export. Supports single payslips, bulk generation via CSV upload, and configurable tax rules for multiple countries.

## Features

### Single Payslip Mode
- **Company Setup** — Name, address, logo upload
- **Employee Details** — Name, ID, designation, department, date of joining, email, PAN number, bank details (account number, bank name, IFSC code)
- **Pay Period** — Month/year selection, paid days, loss of pay (LOP) days
- **Earnings** — Add/remove components (Basic Salary, HRA, Special Allowance, etc.)
- **Deductions** — Add/remove components (PF, Professional Tax, etc.)
- **Signatures** — Upload employee signature, authorized signatory, company seal
- **Live Preview** — Real-time A4 payslip preview with proper print formatting
- **PDF Export** — High-quality JPEG-compressed PDF at 2.5x scale

### Bulk Payslip Mode
- **CSV Upload** — Drag-and-drop or click to upload employee spreadsheet
- **Template Download** — Pre-formatted CSV with sample data
- **Validation** — Shows valid/invalid records with error details
- **Row Selection** — Select/deselect individual employees or all at once
- **Bulk Generation** — Progress indicator with individual success/failure status
- **ZIP Download** — All generated PDFs ZIP

### Tax Configuration
- **Built-in Tax Rules:**
  - India — Old Tax Regime (EPF, ESI, Professional Tax, Income Tax slabs, Cess)
  - India — New Tax Regime (same components, updated slabs)
  - USA — Federal (Social Security, Medicare, income tax brackets)
  - UK — National Insurance, Income Tax
  - UAE — No tax
- **Custom Tax Rules** — Create your own rules with percentage, slab, or fixed amount types
- **Import/Export** — Save and share tax configurations as JSON files
- **Tax Calculation Preview** — See breakdown before applying to salary

### Payslip Output
- A4 portrait format (210mm × 297mm)
- Company header with logo support
- Employee details + employment information side by side
- Earnings and deductions in dual-column table
- Gross pay, total deductions, net payable amount
- Net pay written in words (e.g., "Fifty Thousand Rupees Only")
- Signature fields with image upload support
- Computer-generated disclaimer footer

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS 4
- Vite
- jsPDF + html2canvas
- JSZip (bulk ZIP downloads)
- number-to-words (net pay in words)

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Output goes to `dist/`

## Project Structure

```
src/
├── App.tsx                     # Main app, routing between single/bulk modes
├── main.tsx                    # Entry point
├── index.css                   # Tailwind + custom styles
├── types.ts                    # TypeScript interfaces
├── components/
│   ├── SalarySlipForm.tsx      # Single payslip form (company, employee, salary)
│   ├── SalarySlipPreview.tsx   # A4 payslip preview with PDF-ready formatting
│   ├── TaxConfiguration.tsx    # Tax rule selector + custom rule editor
│   ├── BulkUpload.tsx           # CSV upload with drag-drop and validation
│   └── BulkGenerator.tsx       # Bulk PDF generation with ZIP export
└── utils/
    └── taxCalculator.ts        # Tax calculation logic + built-in configs
```

## Tax Rule Types

| Type | Description |
|------|-------------|
| `percentage` | Flat % of base amount, optional min/max caps |
| `slab` | Progressive tax with income ranges |
| `fixed` | Fixed amount regardless of income |

### Base Amount Options

- `gross` — Total of all earnings
- `basic` — Basic salary component
- `taxable` — Income after standard deductions
- `net` — After all other deductions

## CSV Format (Bulk Upload)

```csv
employeeId,name,designation,department,doj,email,panNumber,bankAccount,bankName,ifscCode,basicSalary,hra,specialAllowance,otherEarnings,paidDays,lopDays
EMP001,John Doe,Software Engineer,Engineering,2026-01-15,john@example.com,ABCDE1234F,1234567890,State Bank,SBIN0001234,50000,20000,10000,5000,30,0
```

All fields except `hra`, `specialAllowance`, `otherEarnings`, `paidDays`, and `lopDays` are required.

## License

MIT
