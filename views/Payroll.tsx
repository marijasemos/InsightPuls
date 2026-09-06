
import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Download,
  Search,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Printer,
  X,
  FileText,
  Building2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole, Payslip } from '../types';
import PayrollRunWizard, { PayrollRunResult } from '../components/PayrollRunWizard';

interface EmployeeWithPayroll {
  id: string;
  name: string;
  position: string;
  team: string;
  salary: number;
  avatar: string;
  lastPayslip: string;
  payslips: Payslip[];
}

const MOCK_PAYSLIPS: Payslip[] = [
  { id: 'ps-1', month: 'September', year: 2023, date: 'Sep 30, 2023', grossPay: 5500, netPay: 4125, tax: 825, insurance: 550, status: 'Sent' },
  { id: 'ps-2', month: 'August', year: 2023, date: 'Aug 31, 2023', grossPay: 5500, netPay: 4125, tax: 825, insurance: 550, status: 'Sent' },
  { id: 'ps-3', month: 'July', year: 2023, date: 'Jul 31, 2023', grossPay: 5500, netPay: 4125, tax: 825, insurance: 550, status: 'Sent' },
  { id: 'ps-4', month: 'June', year: 2023, date: 'Jun 30, 2023', grossPay: 5500, netPay: 4125, tax: 825, insurance: 550, status: 'Sent' },
];

const INITIAL_EMPLOYEES_PAYROLL: EmployeeWithPayroll[] = [
  { id: '1', name: 'Sarah Jenkins', position: 'Senior Product Designer', team: 'Creative', salary: 5500, avatar: 'https://picsum.photos/seed/sarah/100/100', lastPayslip: 'Sep 2023', payslips: MOCK_PAYSLIPS },
  { id: '2', name: 'Michael Chen', position: 'Backend Engineer', team: 'Engineering', salary: 4800, avatar: 'https://picsum.photos/seed/michael/100/100', lastPayslip: 'Sep 2023', payslips: MOCK_PAYSLIPS },
  { id: '3', name: 'Emma Davis', position: 'QA Specialist', team: 'Quality', salary: 3200, avatar: 'https://picsum.photos/seed/emma/100/100', lastPayslip: 'Sep 2023', payslips: MOCK_PAYSLIPS },
  { id: '4', name: 'Robert Fox', position: 'Legal Counsel', team: 'Legal', salary: 7200, avatar: 'https://picsum.photos/seed/robert/100/100', lastPayslip: 'Sep 2023', payslips: MOCK_PAYSLIPS },
  { id: '5', name: 'Jenny Wilson', position: 'HR Coordinator', team: 'HR', salary: 3800, avatar: 'https://picsum.photos/seed/jenny/100/100', lastPayslip: '—', payslips: [] },
];

const NEXT_RUN_DATE = 'Oct 31, 2023';

const Payroll: React.FC = () => {
  const { role, currentUser } = useApp();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeWithPayroll[]>(INITIAL_EMPLOYEES_PAYROLL);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);

  const selectedEmployee = useMemo(() =>
    employees.find(e => e.id === selectedEmployeeId),
    [selectedEmployeeId, employees]
  );

  const filteredEmployees = useMemo(() =>
    employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, employees]
  );

  const handlePayrollComplete = (result: PayrollRunResult) => {
    setEmployees(prev => prev.map(emp => {
      const newPayslip = result.payslipsByEmployee[emp.id];
      if (!newPayslip) return emp;
      return {
        ...emp,
        lastPayslip: `${newPayslip.month.slice(0, 3)} ${newPayslip.year}`,
        payslips: [newPayslip, ...emp.payslips],
      };
    }));
    setLastRunDate(result.runDate);
    setWizardOpen(false);
  };

  const PayslipDocument = ({ payslip, employee }: { payslip: Payslip, employee: { name: string, position: string } }) => (
    <div className="bg-white text-slate-900 p-8 md:p-12 max-w-2xl mx-auto shadow-2xl rounded-sm border border-slate-200 font-mono">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">InsightPro Corp.</h2>
          <p className="text-xs mt-1 text-slate-500">123 Innovation Drive, Tech City</p>
          <p className="text-xs text-slate-500">HR Department: hr@insightpro.com</p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-black uppercase">PAYSLIP</h3>
          <p className="text-xs font-bold text-slate-500">{payslip.month} {payslip.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Details</p>
          <p className="text-sm font-black">{employee.name}</p>
          <p className="text-xs text-slate-500">{employee.position}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Date</p>
          <p className="text-sm font-black">{payslip.date}</p>
          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Processed</p>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <div className="flex justify-between text-sm py-2 border-b">
          <span className="font-medium text-slate-600">Basic Salary (Gross)</span>
          <span className="font-black">€{payslip.grossPay.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm py-2 border-b text-rose-600">
          <span className="font-medium">Income Tax (15%)</span>
          <span className="font-black">-€{payslip.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm py-2 border-b text-rose-600">
          <span className="font-medium">Health & Social Insurance (10%)</span>
          <span className="font-black">-€{payslip.insurance.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 flex justify-between items-center rounded-sm">
        <span className="text-sm font-black uppercase tracking-widest">NET PAYABLE</span>
        <span className="text-2xl font-black">€{payslip.netPay.toFixed(2)}</span>
      </div>

      <div className="mt-12 pt-8 border-t border-dashed border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          This is a computer-generated document and does not require a physical signature.<br/>
          Confidentiality Notice: This payslip is for the intended recipient only.
        </p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Conditionally render HR or Employee view while keeping shared state and modal in the same component scope */}
      {role === UserRole.HR ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payroll Management</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Review and verify organizational salary distribution.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <button
                onClick={() => setWizardOpen(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Banknote className="h-4 w-4" /> Run Payroll
              </button>
            </div>
          </div>

          {!selectedEmployeeId ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="font-bold text-slate-800 dark:text-white">Staff Payroll Status</h3>
                {lastRunDate ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Processed • {lastRunDate}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Run: {NEXT_RUN_DATE}</span>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Employee</th>
                      <th className="px-8 py-4">Monthly Gross</th>
                      <th className="px-8 py-4">Last Payslip</th>
                      <th className="px-8 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <img src={emp.avatar} alt={emp.name} className="h-10 w-10 rounded-xl object-cover border dark:border-slate-700" />
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{emp.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{emp.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-black dark:text-slate-200">€{emp.salary.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-500">{emp.lastPayslip}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          {emp.payslips.length > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                              Processed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 tracking-widest border border-amber-100 dark:border-amber-800/30">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                          >
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <button 
                onClick={() => setSelectedEmployeeId(null)}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Payroll List
              </button>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={selectedEmployee?.avatar} className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-700" alt="" />
                    <div>
                      <h2 className="text-xl font-black dark:text-white">{selectedEmployee?.name}</h2>
                      <p className="text-sm text-slate-500 font-medium">Salary History & Payslips</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-1">Contract Salary</p>
                     <p className="text-2xl font-black text-blue-600">€{selectedEmployee?.salary.toLocaleString()}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-4">Month/Year</th>
                        <th className="px-8 py-4">Gross</th>
                        <th className="px-8 py-4">Net Amount</th>
                        <th className="px-8 py-4">Payment Date</th>
                        <th className="px-8 py-4 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {selectedEmployee?.payslips.map((ps) => (
                        <tr key={ps.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold dark:text-white">{ps.month} {ps.year}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-slate-500">€{ps.grossPay.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-emerald-600">€{ps.netPay.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs text-slate-500 font-medium">{ps.date}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => setSelectedPayslip(ps)}
                              className="p-2 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-400"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Payroll & Income</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Access your monthly payslips and tax documentation.</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-2xl flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                 <CheckCircle2 className="h-6 w-6 text-emerald-600" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest">Last Payment</p>
                 <p className="text-sm font-black text-slate-800 dark:text-emerald-100">€4,125.00 • Sep 30, 2023</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 dark:text-white tracking-tight">Payslip Archive</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fiscal Year 2023</span>
                  </div>
                </div>
                <div className="divide-y dark:divide-slate-800">
                  {MOCK_PAYSLIPS.map((ps) => (
                    <div key={ps.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black dark:text-white">{ps.month} {ps.year}</p>
                          <p className="text-xs text-slate-500 font-medium">Payment Date: {ps.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Paid</p>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">€{ps.netPay.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedPayslip(ps)}
                            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95"
                          >
                            View & Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">Auto-Deposit Active</h3>
                  <p className="text-xs text-blue-100 leading-relaxed mb-6 opacity-80">
                    Your salary is scheduled to be deposited on the last working day of every month. Ensure your bank details are up to date.
                  </p>
                  <button className="w-full py-3.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                    Update Bank Details
                  </button>
                </div>
                <div className="absolute -bottom-12 -right-12 h-48 w-48 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Tax Documents</h4>
                 <div className="space-y-3">
                   {[
                     { label: 'Annual Tax Statement 2022', date: 'Jan 2023', size: '1.2MB' },
                     { label: 'Social Security Confirmation', date: 'Mar 2023', size: '0.8MB' },
                   ].map((doc, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 group hover:border-blue-300 transition-all cursor-pointer">
                       <div className="flex items-center gap-3">
                         <Download className="h-4 w-4 text-slate-400" />
                         <span className="text-xs font-bold dark:text-slate-300">{doc.label}</span>
                       </div>
                       <span className="text-[10px] text-slate-400 font-bold">{doc.size}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Overlay for Payslip Document - Shared outside conditional logic to prevent unintentional type overlap errors */}
      {(selectedPayslip) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white">
                <Printer className="h-5 w-5 cursor-pointer hover:text-blue-400" />
                <Download className="h-5 w-5 cursor-pointer hover:text-blue-400" />
                <Mail className="h-5 w-5 cursor-pointer hover:text-blue-400" />
              </div>
              <button 
                onClick={() => setSelectedPayslip(null)}
                className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Logic to choose the correct employee object based on active role while ensuring role is typed as UserRole.HR | UserRole.EMPLOYEE */}
            <PayslipDocument
              payslip={selectedPayslip}
              employee={role === UserRole.HR ? { name: selectedEmployee?.name || '', position: selectedEmployee?.position || '' } : { name: currentUser.name, position: currentUser.position }}
            />
          </div>
        </div>
      )}

      {/* Run Payroll Wizard */}
      {wizardOpen && (
        <PayrollRunWizard
          employees={employees.map(e => ({ id: e.id, name: e.name, position: e.position, team: e.team, avatar: e.avatar, salary: e.salary }))}
          paymentDate={NEXT_RUN_DATE}
          onClose={() => setWizardOpen(false)}
          onComplete={handlePayrollComplete}
        />
      )}
    </div>
  );
};

export default Payroll;
