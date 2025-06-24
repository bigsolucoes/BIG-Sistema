import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, FinancialStatus, JobStatus, Client } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, CurrencyDollarIcon } from '../constants';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentRegistrationModal from '../components/modals/PaymentRegistrationModal'; // New Modal
import { formatCurrency, formatDate } from '../utils/formatters';

const FinancialsPage: React.FC = () => {
  const { jobs, clients, settings, loading } = useAppData(); // Removed updateJob, modal will handle it
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<Job | undefined>(undefined);

  const getFinancialStatus = (job: Job): FinancialStatus => {
    // A job is PAID if its status is PAID or if it has a paymentDate (primary) or paidAt (fallback)
    if (job.status === JobStatus.PAID || job.paymentDate || job.paidAt) return FinancialStatus.PAID;
    
    // An overdue job is one that is FINALIZED, past its deadline, and not paid.
    if (job.status === JobStatus.FINALIZED) {
        try {
            const today = new Date(); today.setHours(0,0,0,0);
            const deadline = new Date(job.deadline); deadline.setHours(0,0,0,0);
            if (deadline < today) return FinancialStatus.OVERDUE;
        } catch(e) {/* ignore date parsing error, fallback to pending */}
        return FinancialStatus.PENDING;
    }
    // Default for jobs that are Finalized but not yet paid (and not overdue)
    // This case should ideally be covered above.
    return FinancialStatus.PENDING; 
  };

  const financialRecords = jobs
    .filter(job => job.status === JobStatus.FINALIZED || job.status === JobStatus.PAID)
    .map(job => {
      const client = clients.find(c => c.id === job.clientId);
      return {
        ...job,
        clientName: client?.name || 'Cliente Desconhecido',
        financialStatus: getFinancialStatus(job),
      };
    })
    .sort((a,b) => {
        if (a.financialStatus !== FinancialStatus.PAID && b.financialStatus === FinancialStatus.PAID) return -1;
        if (a.financialStatus === FinancialStatus.PAID && b.financialStatus !== FinancialStatus.PAID) return 1;
        try {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); 
        } catch (e) { return 0; }
    });

  const handleOpenPaymentModal = (job: Job) => {
    setSelectedJobForPayment(job);
    setPaymentModalOpen(true);
  };
  
  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedJobForPayment(undefined);
    toast.success('Pagamento registrado com sucesso!');
    // Data re-renders automatically due to context update in useAppData
  };

  const StatusBadge: React.FC<{ status: FinancialStatus }> = ({ status }) => {
    let bgColor, textColor, IconComponent;
    switch (status) {
      case FinancialStatus.PAID:
        bgColor = 'bg-green-100'; textColor = 'text-green-700'; IconComponent = CheckCircleIcon;
        break;
      case FinancialStatus.OVERDUE:
        bgColor = 'bg-red-100'; textColor = 'text-red-700'; IconComponent = ExclamationCircleIcon;
        break;
      case FinancialStatus.PENDING:
      default:
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-700'; IconComponent = ClockIcon;
        break;
    }
    return (
      <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
        <IconComponent /> <span className="ml-1">{status}</span>
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Central de Pagamentos</h1>
      
      <div className="bg-card-bg shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-slate-50">
                <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Job</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Vencimento</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Data Pag.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Método Pag.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Obs. Pag.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Anexo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border-color">
                {financialRecords.length > 0 ? financialRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{record.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{record.clientName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatCurrency(record.value, settings.privacyModeEnabled)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(record.deadline)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={record.financialStatus} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {record.paymentDate ? formatDate(record.paymentDate, { dateStyle: 'short', timeStyle: 'short'}) : (record.paidAt ? formatDate(record.paidAt, { dateStyle: 'short', timeStyle: 'short'}) : '---')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{record.paymentMethod || '---'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary truncate max-w-xs" title={record.paymentNotes}>{record.paymentNotes || '---'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {record.paymentAttachmentName ? (
                            <span title={record.paymentAttachmentName} className="truncate">{record.paymentAttachmentName.substring(0,20)}{record.paymentAttachmentName.length > 20 ? '...' : ''}</span>
                        ): '---'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {record.financialStatus !== FinancialStatus.PAID && (
                        <button
                        onClick={() => handleOpenPaymentModal(record)}
                        className="text-accent hover:brightness-90 font-semibold transition-all flex items-center p-1 rounded hover:bg-green-50"
                        title="Registrar Pagamento"
                        >
                        <CurrencyDollarIcon /> <span className="ml-1">Registrar</span>
                        </button>
                    )}
                    </td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-sm text-text-secondary">
                    Nenhum registro financeiro (jobs finalizados ou pagos) para exibir.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
      {selectedJobForPayment && (
        <PaymentRegistrationModal
            isOpen={isPaymentModalOpen}
            onClose={() => { setPaymentModalOpen(false); setSelectedJobForPayment(undefined);}}
            job={selectedJobForPayment}
            onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default FinancialsPage;