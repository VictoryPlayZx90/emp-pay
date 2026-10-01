import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { Employee } from '../App';

type ImportRow = {
  rowNumber: number;
  employee: Employee;
  issues: string[];
};

interface Props {
  employees: Employee[];
  onImport: (employees: Employee[]) => void;
  onClose: () => void;
  isMobile: boolean;
}

const HEADER_ALIASES: Record<string, keyof Employee> = {
  name: 'name', fullname: 'name', employeename: 'name', staffname: 'name',
  salary: 'salary', monthlysalary: 'salary', salarypermonth: 'salary',
  department: 'department', team: 'department',
  joiningdate: 'joiningDate', joindate: 'joiningDate', startdate: 'joiningDate',
  employeecode: 'employeeCode', employeecodeid: 'employeeCode', code: 'employeeCode',
  designation: 'designation', jobtitle: 'designation', title: 'designation',
  email: 'email', emailaddress: 'email',
  mobile: 'mobile', mobilenumber: 'mobile', phone: 'mobile', phonenumber: 'mobile',
  alternatemobile: 'alternateMobile', alternatephone: 'alternateMobile',
  employmenttype: 'employmentType', type: 'employmentType',
  dateofbirth: 'dateOfBirth', dob: 'dateOfBirth',
  gender: 'gender', city: 'city', state: 'state', country: 'country',
  postalcode: 'postalCode', pincode: 'postalCode', zipcode: 'postalCode',
  address: 'currentAddress', currentaddress: 'currentAddress',
};

function normalizeHeader(value: unknown) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value ?? '').trim();
  if (!text) return '';
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const local = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (local) return `${local[3]}-${local[2].padStart(2, '0')}-${local[1].padStart(2, '0')}`;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function parseEmployeeRows(records: Record<string, unknown>[], employees: Employee[]): ImportRow[] {
  const seenCodes = new Set(employees.map(e => e.employeeCode?.trim().toLowerCase()).filter(Boolean) as string[]);
  const seenEmails = new Set(employees.map(e => e.email?.trim().toLowerCase()).filter(Boolean) as string[]);
  const today = new Date().toISOString().slice(0, 10);

  return records.map((record, index) => {
    const normalized: Partial<Record<keyof Employee, unknown>> = {};
    for (const [header, value] of Object.entries(record)) {
      const key = HEADER_ALIASES[normalizeHeader(header)];
      if (key && String(value ?? '').trim()) normalized[key] = value;
    }

    const name = String(normalized.name ?? '').trim();
    const salaryText = String(normalized.salary ?? '').replace(/[₹,\s]/g, '');
    const salary = Number(salaryText);
    const department = String(normalized.department ?? 'General').trim() || 'General';
    const joiningDate = toDateString(normalized.joiningDate) || today;
    const employeeCode = String(normalized.employeeCode ?? '').trim();
    const email = String(normalized.email ?? '').trim();
    const issues: string[] = [];

    if (!name) issues.push('Name is required');
    if (!salaryText || !Number.isFinite(salary) || salary < 0) issues.push('Enter a valid monthly salary');
    if (normalized.joiningDate && !toDateString(normalized.joiningDate)) issues.push('Joining date is invalid');
    if (normalized.email && !/^\S+@\S+\.\S+$/.test(email)) issues.push('Email address is invalid');

    const codeKey = employeeCode.toLowerCase();
    const emailKey = email.toLowerCase();
    if (codeKey && seenCodes.has(codeKey)) issues.push(`Employee code “${employeeCode}” is already in use`);
    if (emailKey && seenEmails.has(emailKey)) issues.push(`Email “${email}” is already in use`);
    if (codeKey) seenCodes.add(codeKey);
    if (emailKey) seenEmails.add(emailKey);

    const employmentType = String(normalized.employmentType ?? '').trim().toLowerCase().replace(/[ _]/g, '-') as Employee['employmentType'];
    if (employmentType && !['full-time', 'part-time', 'contract', 'intern'].includes(employmentType)) {
      issues.push('Employment type must be full-time, part-time, contract, or intern');
    }
    const gender = String(normalized.gender ?? '').trim().toLowerCase() as Employee['gender'];
    if (gender && !['male', 'female', 'other'].includes(gender)) issues.push('Gender must be male, female, or other');

    return {
      rowNumber: index + 2,
      issues,
      employee: {
        id: `emp_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        salary: Number.isFinite(salary) ? salary : 0,
        department,
        joiningDate,
        employeeCode: employeeCode || undefined,
        email: email || undefined,
        designation: String(normalized.designation ?? '').trim() || undefined,
        mobile: String(normalized.mobile ?? '').trim() || undefined,
        alternateMobile: String(normalized.alternateMobile ?? '').trim() || undefined,
        employmentType: employmentType || undefined,
        dateOfBirth: toDateString(normalized.dateOfBirth) || undefined,
        gender: gender || undefined,
        city: String(normalized.city ?? '').trim() || undefined,
        state: String(normalized.state ?? '').trim() || undefined,
        country: String(normalized.country ?? '').trim() || undefined,
        postalCode: String(normalized.postalCode ?? '').trim() || undefined,
        currentAddress: String(normalized.currentAddress ?? '').trim() || undefined,
        documents: [],
      },
    };
  });
}

function downloadTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Name', 'Monthly Salary', 'Department', 'Joining Date', 'Employee Code', 'Designation', 'Email', 'Mobile', 'Employment Type'],
    ['Aarav Sharma', 45000, 'Engineering', '2026-04-01', 'EMP001', 'Developer', 'aarav@example.com', '9876543210', 'full-time'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, 'emppay-employee-template.xlsx');
}

export function BulkEmployeeImport({ employees, onImport, onClose, isMobile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileError, setFileError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const validRows = useMemo(() => rows.filter(row => row.issues.length === 0), [rows]);
  const invalidRows = rows.length - validRows.length;

  const readFile = async (file?: File) => {
    if (!file) return;
    setFileError('');
    setRows([]);
    if (file.size > 5 * 1024 * 1024) { setFileError('Choose a file smaller than 5 MB.'); return; }
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) { setFileError('Choose a CSV or Excel file (.csv, .xlsx, .xls).'); return; }
    setIsReading(true);
    setFileName(file.name);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('This file does not contain a worksheet.');
      const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
      if (!records.length) throw new Error('The selected sheet is empty.');
      if (records.length > 500) throw new Error('Import up to 500 employees at a time. Split larger files into smaller batches.');
      const headers = Object.keys(records[0]);
      if (!headers.some(header => HEADER_ALIASES[normalizeHeader(header)] === 'name')) {
        throw new Error('Could not find a Name column. Download the template to see supported column names.');
      }
      setRows(parseEmployeeRows(records, employees));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'Could not read this file. Check its format and try again.');
    } finally {
      setIsReading(false);
    }
  };

  const confirmImport = () => {
    if (!validRows.length) return;
    onImport([...employees, ...validRows.map(row => row.employee)]);
    toast.success(`${validRows.length} employee${validRows.length === 1 ? '' : 's'} imported${invalidRows ? ` · ${invalidRows} skipped` : ''}`);
    onClose();
  };

  const muted: React.CSSProperties = { color: 'var(--app-text-muted)' };
  return (
    <div role="presentation" onClick={event => { if (event.target === event.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--app-overlay)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="bulk-import-title" style={{ width: 'min(760px, 100%)', maxHeight: isMobile ? '94dvh' : '90vh', overflowY: 'auto', padding: isMobile ? 20 : 26, borderRadius: isMobile ? '20px 20px 0 0' : 20, background: 'var(--app-card)', border: '1px solid var(--app-border)', boxShadow: '0 24px 80px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h2 id="bulk-import-title" style={{ margin: 0, color: 'var(--app-text-primary)', fontSize: 20 }}>Import employees</h2>
            <p style={{ ...muted, fontSize: 13, margin: '6px 0 0' }}>Add a group from a CSV or Excel spreadsheet.</p>
          </div>
          <button aria-label="Close import" onClick={onClose} style={{ border: 0, background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', padding: 4 }}><X size={19} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 20, padding: 14, borderRadius: 14, border: '1px solid var(--app-border)', background: 'var(--app-subtle-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <FileSpreadsheet size={22} color="var(--app-accent, #c9ef80)" />
            <div><div style={{ color: 'var(--app-text-primary)', fontSize: 13, fontWeight: 600 }}>Start with a spreadsheet</div><div style={{ ...muted, fontSize: 11.5, marginTop: 3 }}>Name and monthly salary are required. Up to 500 rows.</div></div>
          </div>
          <button onClick={downloadTemplate} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--app-input-border)', borderRadius: 10, padding: '8px 11px', color: 'var(--app-text-secondary)', background: 'var(--app-card)', cursor: 'pointer', fontSize: 12 }}><Download size={14} /> Download template</button>
        </div>

        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" hidden onChange={event => { void readFile(event.target.files?.[0]); event.currentTarget.value = ''; }} />
        <button onClick={() => inputRef.current?.click()} disabled={isReading} style={{ width: '100%', marginTop: 14, padding: '20px 16px', border: '1px dashed var(--app-input-border)', borderRadius: 14, background: 'transparent', color: 'var(--app-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontSize: 13, opacity: isReading ? .65 : 1 }}><Upload size={16} />{isReading ? 'Reading spreadsheet…' : fileName || 'Choose CSV or Excel file'}</button>
        <p style={{ ...muted, fontSize: 11, textAlign: 'center', margin: '8px 0 0' }}>Files are read in your browser. Existing employees are never overwritten.</p>

        {fileError && <div role="alert" style={{ marginTop: 14, borderRadius: 10, padding: '10px 12px', background: 'rgba(239,68,68,.1)', color: '#f87171', display: 'flex', gap: 8, fontSize: 12.5 }}><AlertCircle size={16} />{fileError}</div>}

        {rows.length > 0 && <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <strong style={{ color: 'var(--app-text-primary)', fontSize: 13 }}>Import preview · {rows.length} rows</strong>
            <div style={{ display: 'flex', gap: 12, fontSize: 11.5 }}><span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} />{validRows.length} ready</span>{invalidRows > 0 && <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} />{invalidRows} skipped</span>}</div>
          </div>
          <div style={{ border: '1px solid var(--app-border)', borderRadius: 12, overflow: 'auto', maxHeight: 230 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, fontSize: 12 }}>
              <thead><tr style={{ background: 'var(--app-table-header-bg)', color: 'var(--app-text-muted)', textAlign: 'left' }}>{['Row', 'Name', 'Department', 'Monthly salary', 'Result'].map(label => <th key={label} style={{ padding: '9px 11px', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 100).map(row => <tr key={row.rowNumber} style={{ borderTop: '1px solid var(--app-border-subtle)' }}>
                <td style={{ padding: '9px 11px', ...muted }}>{row.rowNumber}</td><td style={{ padding: '9px 11px', color: 'var(--app-text-primary)' }}>{row.employee.name || '—'}</td><td style={{ padding: '9px 11px', ...muted }}>{row.employee.department}</td><td style={{ padding: '9px 11px', color: 'var(--app-text-secondary)' }}>{Number(row.employee.salary).toLocaleString('en-IN')}</td>
                <td style={{ padding: '9px 11px', color: row.issues.length ? '#fbbf24' : '#34d399', maxWidth: 240 }}>{row.issues.length ? row.issues.join(' · ') : 'Ready'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          {rows.length > 100 && <p style={{ ...muted, fontSize: 11, margin: '7px 0 0' }}>Showing first 100 rows in preview. All {rows.length} rows are checked.</p>}
        </div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '10px 15px', borderRadius: 10, border: '1px solid var(--app-input-border)', background: 'transparent', color: 'var(--app-text-secondary)', cursor: 'pointer', fontSize: 12.5 }}>Cancel</button>
          <button onClick={confirmImport} disabled={!validRows.length || isReading} style={{ padding: '10px 15px', borderRadius: 10, border: 0, background: 'var(--app-btn-primary-bg)', color: 'var(--app-btn-primary-fg)', cursor: validRows.length ? 'pointer' : 'not-allowed', opacity: validRows.length ? 1 : .55, fontSize: 12.5, fontWeight: 650 }}>Import {validRows.length || ''} employee{validRows.length === 1 ? '' : 's'}</button>
        </div>
      </section>
    </div>
  );
}
