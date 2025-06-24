import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, FinancialStatus, JobStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, CurrencyDollarIcon } from '../constants';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const FinancialsPage: React.FC = () => {
  const { jobs, clients, updateJob, loading } = useAppData();

  const getFinancialStatus = (job: Job): FinancialStatus => {
    if (job.paidAt) return FinancialStatus.PAID;
    // An overdue job is one that is finalized, past its deadline, and not paid.
    if (job.status === JobStatus.FINALIZED && !job.paidAt) {
        try {
            if (new Date(job.deadline) < new Date(new Date().setHours(0,0,0,0))) return FinancialStatus.OVERDUE;
        } catch(e) {/* ignore date parsing error, fallback to pending */}
        return FinancialStatus.PENDING;
    }
    // Default for jobs that are Finalized but not yet paid (and not overdue)
    if (job.status === JobStatus.FINALIZED && !job.paidAt) return FinancialStatus.PENDING;
    
    // Fallback for any other scenario, though filtering should handle this
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
        // Sort by status first (Pending/Overdue before Paid), then by deadline
        if (a.financialStatus !== FinancialStatus.PAID && b.financialStatus === FinancialStatus.PAID) return -1;
        if (a.financialStatus === FinancialStatus.PAID && b.financialStatus !== FinancialStatus.PAID) return 1;
        try {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); // Earlier deadlines first for pending
        } catch (e) { return 0; }
    });


  const handleMarkAsPaid = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({ 
        ...job, 
        status: JobStatus.PAID, // Explicitly set JobStatus to PAID
        paidAt: new Date().toISOString() 
      });
      toast.success(`Job "${job.name}" marcado como pago!`);
    }
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Job</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Prazo Final</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status Pagamento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Data de Pagamento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border-color">
                {financialRecords.length > 0 ? financialRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{record.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{record.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">R$ {record.value.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(record.deadline).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={record.financialStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {record.paidAt ? new Date(record.paidAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'}) : '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {record.financialStatus !== FinancialStatus.PAID && (
                        <button
                        onClick={() => handleMarkAsPaid(record.id)}
                        className="text-accent hover:text-opacity-80 font-semibold transition-colors flex items-center p-1 rounded hover:bg-green-100"
                        title="Confirmar Pagamento"
                        >
                        <CurrencyDollarIcon /> <span className="ml-1">Confirmar</span>
                        </button>
                    )}
                    </td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-text-secondary">
                    Nenhum registro financeiro (jobs finalizados ou pagos) para exibir.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialsPage;