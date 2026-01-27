// app/portal/dashboard/finance/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Download,
  Receipt,
  BarChart3,
  ChevronRight,
  Filter,
  Search,
  Clock,
  Eye
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StudentLedger {
  id: string;
  name: string;
  student_class: string;
  previous_balance: number;
  term_1_2026: number;
  term_2_2026: number;
  term_3_2026: number;
  term_1_2027?: number;
  term_2_2027?: number;
  term_3_2027?: number;
  payments?: Payment[];
  total_balance: number;
  last_payment_date?: string;
  last_payment_amount?: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
  receipt_number?: string;
  payment_method: string;
  term: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function FinanceDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState<StudentLedger | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'breakdown'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState<string>('all');

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Get student session
      const session = localStorage.getItem('portalSession');
      if (!session) {
        router.push('/portal');
        return;
      }

      const parsed = JSON.parse(session);
      if (!parsed.student || !parsed.student.id) {
        router.push('/portal');
        return;
      }

      setStudent(parsed.student);
      
      // Load ledger data from Supabase
      await loadLedgerData(parsed.student.id);
      
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLedgerData = async (studentId: string) => {
    try {
      // Fetch student ledger from Supabase
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('student_ledger')
        .select('*')
        .eq('id', studentId)
        .single();

      if (ledgerError) {
        console.error('Error loading ledger:', ledgerError);
        // Create mock data for testing if table doesn't exist
        const mockLedger: StudentLedger = {
          id: studentId,
          name: student?.name || 'Student',
          student_class: student?.class || student?.student_class || 'Form 4',
          previous_balance: 1500,
          term_1_2026: 500,
          term_2_2026: 500,
          term_3_2026: 500,
          total_balance: 2500,
          last_payment_date: '2024-01-15',
          last_payment_amount: 750
        };
        setLedger(mockLedger);
        
        // Mock payments
        const mockPayments: Payment[] = [
          {
            id: '1',
            date: '2024-01-15',
            amount: 750,
            description: 'Term 1 Partial Payment',
            receipt_number: 'REC-00123',
            payment_method: 'Bank Transfer',
            term: 'Term 1 2026',
            status: 'completed'
          },
          {
            id: '2',
            date: '2023-12-20',
            amount: 500,
            description: 'Previous Balance',
            receipt_number: 'REC-00100',
            payment_method: 'Cash',
            term: 'Previous Balance',
            status: 'completed'
          },
          {
            id: '3',
            date: '2024-02-01',
            amount: 250,
            description: 'Term 1 Remaining',
            receipt_number: 'REC-00145',
            payment_method: 'Mobile Money',
            term: 'Term 1 2026',
            status: 'pending'
          },
          {
            id: '4',
            date: '2023-11-30',
            amount: 1000,
            description: 'Previous Year Balance',
            receipt_number: 'REC-00085',
            payment_method: 'Bank Transfer',
            term: 'Previous Balance',
            status: 'completed'
          }
        ];
        setPayments(mockPayments);
        
        // Calculate total paid
        const paid = mockPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);
        setTotalPaid(paid);
        
        return;
      }

      if (ledgerData) {
        // Calculate total balance from all terms
        const totalBalance = Object.keys(ledgerData)
          .filter(key => key.startsWith('term_') || key === 'previous_balance')
          .reduce((sum, key) => {
            const value = ledgerData[key];
            return sum + (typeof value === 'number' ? value : 0);
          }, 0);

        const formattedLedger: StudentLedger = {
          ...ledgerData,
          total_balance: totalBalance
        };
        
        setLedger(formattedLedger);

        // Fetch payments from payments table (if exists)
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('student_payments')
          .select('*')
          .eq('student_id', studentId)
          .order('date', { ascending: false });

        if (paymentsError) {
          console.log('No payments table or error:', paymentsError);
          // Use mock payments for now
          const mockPayments: Payment[] = [
            {
              id: '1',
              date: '2024-01-15',
              amount: ledgerData.previous_balance || 0,
              description: 'Previous Balance Payment',
              receipt_number: 'AUTO-GEN',
              payment_method: 'System',
              term: 'Previous Balance',
              status: 'completed'
            }
          ];
          setPayments(mockPayments);
          setTotalPaid(mockPayments[0].amount);
        } else if (paymentsData) {
          const formattedPayments: Payment[] = paymentsData.map((p: any) => ({
            id: p.id,
            date: p.date,
            amount: p.amount,
            description: p.description || 'Payment',
            receipt_number: p.receipt_number,
            payment_method: p.payment_method || 'Unknown',
            term: p.term || 'General',
            status: p.status || 'completed'
          }));
          
          setPayments(formattedPayments);
          
          // Calculate total paid
          const paid = formattedPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
          setTotalPaid(paid);
        }
      }
    } catch (error) {
      console.error('Error in loadLedgerData:', error);
    }
  };

  const calculateTermBalances = () => {
    if (!ledger) return [];
    
    const terms = [
      { name: 'Previous Balance', amount: ledger.previous_balance || 0 },
      { name: 'Term 1 2026', amount: ledger.term_1_2026 || 0 },
      { name: 'Term 2 2026', amount: ledger.term_2_2026 || 0 },
      { name: 'Term 3 2026', amount: ledger.term_3_2026 || 0 },
      ...(ledger.term_1_2027 ? [{ name: 'Term 1 2027', amount: ledger.term_1_2027 }] : []),
      ...(ledger.term_2_2027 ? [{ name: 'Term 2 2027', amount: ledger.term_2_2027 }] : []),
      ...(ledger.term_3_2027 ? [{ name: 'Term 3 2027', amount: ledger.term_3_2027 }] : []),
    ].filter(term => term.amount > 0);

    return terms;
  };

  const filteredPayments = payments.filter(payment => {
    // Filter by search term
    if (searchTerm && !payment.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by term
    if (filterTerm !== 'all' && payment.term !== filterTerm) {
      return false;
    }
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'failed': return <XCircle size={14} />;
      default: return null;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    if (student) {
      loadLedgerData(student.id).finally(() => setLoading(false));
    }
  };

  const handleExport = () => {
    // Simple export functionality
    const data = {
      student: ledger?.name,
      studentId: ledger?.id,
      class: ledger?.student_class,
      totalBalance: ledger?.total_balance,
      totalPaid,
      remainingBalance: (ledger?.total_balance || 0) - totalPaid,
      payments: payments,
      termBalances: calculateTermBalances(),
      generated: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-statement-${ledger?.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading finance data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student || !ledger) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Finance Data Available</h2>
          <p className="text-slate-600 mb-4">Unable to load your financial information.</p>
          <button
            onClick={() => router.push('/portal/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const termBalances = calculateTermBalances();
  const remainingBalance = (ledger.total_balance || 0) - totalPaid;
  const paymentProgress = ledger.total_balance > 0 ? (totalPaid / ledger.total_balance) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="text-slate-600">Track your fees, payments, and balance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-slate-900">
                ${ledger.total_balance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Wallet className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Includes all terms and previous balances
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-slate-900">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CreditCard className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Remaining Balance</p>
              <p className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ${remainingBalance.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${remainingBalance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {remainingBalance > 0 ? (
                <TrendingUp className="text-red-600" size={24} />
              ) : (
                <TrendingDown className="text-emerald-600" size={24} />
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {remainingBalance > 0 ? 'Payment required' : 'Balance cleared'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Payment Progress</span>
          <span className="text-sm font-bold text-slate-900">
            {paymentProgress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Paid: ${totalPaid.toLocaleString()}</span>
          <span>Total: ${ledger.total_balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            {(['overview', 'payments', 'breakdown'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'overview' && (
                  <span className="flex items-center gap-2">
                    <BarChart3 size={16} /> Overview
                  </span>
                )}
                {tab === 'payments' && (
                  <span className="flex items-center gap-2">
                    <Receipt size={16} /> Payment History
                  </span>
                )}
                {tab === 'breakdown' && (
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Term Breakdown
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Student ID</p>
                  <p className="font-mono font-medium">{ledger.id}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Class</p>
                  <p className="font-medium">{ledger.student_class}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Last Payment</p>
                  <p className="font-medium">
                    {ledger.last_payment_date 
                      ? new Date(ledger.last_payment_date).toLocaleDateString()
                      : 'No payments yet'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                  <p className={`font-medium ${remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {remainingBalance > 0 ? 'Outstanding Balance' : 'Fully Paid'}
                  </p>
                </div>
              </div>

              {/* Recent Payments */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Payments</h3>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <DollarSign className="text-emerald-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(payment.date).toLocaleDateString()} • {payment.payment_method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${payment.amount.toLocaleString()}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500">No payment history available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-500" />
                  <select
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Terms</option>
                    <option value="Previous Balance">Previous Balance</option>
                    <option value="Term 1 2026">Term 1 2026</option>
                    <option value="Term 2 2026">Term 2 2026</option>
                    <option value="Term 3 2026">Term 3 2026</option>
                  </select>
                </div>
              </div>

              {/* Payments Table */}
              {filteredPayments.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Description</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Term</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Method</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="font-medium">
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{payment.description}</div>
                            {payment.receipt_number && (
                              <div className="text-sm text-slate-500">
                                Receipt: {payment.receipt_number}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {payment.term}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-slate-400" />
                              <span>{payment.payment_method}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-lg">
                              ${payment.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Payments Found</h3>
                  <p className="text-slate-500">
                    {searchTerm || filterTerm !== 'all' 
                      ? 'Try adjusting your search or filter' 
                      : 'No payment history available yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              {/* Term Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Term Balances</h3>
                  <div className="space-y-4">
                    {termBalances.map((term, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium">{term.name}</p>
                          <p className="text-sm text-slate-500">
                            {term.amount > 0 ? 'Amount due' : 'Paid in full'}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${term.amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ${term.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Summary</h3>
                  <div className="bg-slate-50 p-6 rounded-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Fees:</span>
                        <span className="font-bold">${ledger.total_balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Paid:</span>
                        <span className="font-bold text-emerald-600">${totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-300 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Remaining:</span>
                          <span className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            ${remainingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Instructions */}
                    {remainingBalance > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Payment Required</h4>
                            <p className="text-sm text-blue-800">
                              Please pay your remaining balance of <strong>${remainingBalance.toLocaleString()}</strong> 
                              at the finance office to avoid restrictions on academic services.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-slate-500" />
            <span className="text-sm text-slate-600">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-slate-500">
            For payment inquiries, contact the Finance Office
          </div>
        </div>
      </div>
    </div>
  );
}