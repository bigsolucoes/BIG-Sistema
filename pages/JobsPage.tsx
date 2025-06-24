import React, { useState, useCallback } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, JobStatus, Client } from '../types';
import { KANBAN_COLUMNS, PlusCircleIcon, PencilIcon, TrashIcon, BriefcaseIcon, ListBulletIcon } from '../constants';
import Modal from '../components/Modal';
import JobForm from './forms/JobForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import JobListTableView from '../components/JobListTableView';
import PaymentRegistrationModal from '../components/modals/PaymentRegistrationModal'; // Import the payment modal

const JobCard: React.FC<{ 
  job: Job; 
  client?: Client; 
  onEdit: (job: Job) => void; 
  onDelete: (jobId: string) => void; 
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
  isDraggable: boolean; // New prop to control draggable behavior
}> = 
  ({ job, client, onEdit, onDelete, onDragStart, isDraggable }) => {
  const { settings } = useAppData();
  const today = new Date();
  today.setHours(0,0,0,0);
  const deadlineDate = new Date(job.deadline);
  deadlineDate.setHours(0,0,0,0);

  const isOverdue = deadlineDate < today && job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED;
  
  return (
    <div 
      draggable={isDraggable} // Use prop
      onDragStart={(e) => isDraggable && onDragStart(e, job.id)} // Only call onDragStart if draggable
      className={`bg-card-bg p-4 mb-3 rounded-lg shadow-md border border-border-color ${isDraggable ? 'hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing' : 'opacity-80'}`}
    >
      <h4 className="font-semibold text-md text-text-primary mb-1">{job.name}</h4>
      <p className="text-xs text-text-secondary mb-1">{client?.name || 'Cliente não encontrado'}</p>
      <p className="text-xs text-text-secondary mb-2">Valor: {formatCurrency(job.value, settings.privacyModeEnabled)}</p>
      <div className={`text-xs px-2 py-1 inline-block rounded-full mb-2 ${
        isOverdue ? 'bg-red-100 text-red-700' : `bg-blue-100 text-accent`
      }`}>
        Prazo: {formatDate(job.deadline)} {isOverdue && '(Atrasado)'}
      </div>
       <p className="text-xs text-text-secondary mb-1">Tipo: {job.serviceType}</p>
      {job.cloudLink && <a href={job.cloudLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">Link Nuvem</a>}
      <div className="mt-3 pt-3 border-t border-border-color flex justify-end space-x-2">
        <button onClick={() => onEdit(job)} className="text-slate-500 hover:text-accent p-1" title="Editar Job"><PencilIcon /></button>
        <button onClick={() => onDelete(job.id)} className="text-slate-500 hover:text-red-500 p-1" title="Excluir Job"><TrashIcon /></button>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{ 
  title: string; 
  status: JobStatus | 'UNCATEGORIZED_COLUMN'; 
  jobs: Job[]; 
  clients: Client[]; 
  onEditJob: (job: Job) => void; 
  onDeleteJob: (jobId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: JobStatus | 'UNCATEGORIZED_COLUMN') => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ title, status, jobs, clients, onEditJob, onDeleteJob, onDragStart, onDrop, onDragOver }) => {
  const columnJobs = jobs;
  const isPaidColumn = status === JobStatus.PAID;

  return (
    <div 
      className={`bg-slate-100 p-4 rounded-lg w-80 flex-shrink-0 min-h-[calc(100vh-250px)] ${isPaidColumn ? 'bg-green-50' : ''}`} 
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <h3 className={`font-semibold text-lg text-text-primary mb-4 sticky top-0 py-2 z-10 ${isPaidColumn ? 'bg-green-50' : 'bg-slate-100'}`}>{title} ({columnJobs.length})</h3>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-310px)]"> 
        {columnJobs.length > 0 ? columnJobs.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            client={clients.find(c => c.id === job.clientId)} 
            onEdit={onEditJob}
            onDelete={onDeleteJob}
            onDragStart={onDragStart}
            isDraggable={!isPaidColumn} // Jobs in "Pago" are not draggable to other active workflow columns
          />
        )) : <p className="text-sm text-text-secondary text-center py-4">Nenhum job nesta etapa.</p>}
      </div>
    </div>
  );
};

type ViewMode = 'kanban' | 'list';
const UNCATEGORIZED_COLUMN_ID = 'UNCATEGORIZED_COLUMN' as const;


const JobsPage: React.FC = () => {
  const { jobs, clients, updateJob, deleteJob: deleteJobContext, loading, settings } = useAppData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [jobForPaymentModal, setJobForPaymentModal] = useState<Job | undefined>(undefined);

  const handleAddJob = () => {
    setEditingJob(undefined);
    setModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este job?')) {
      deleteJobContext(jobId);
      toast.success('Job excluído com sucesso!');
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingJob(undefined);
  };
  
  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, jobId: string) => {
    e.dataTransfer.setData('jobId', jobId);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetStatusOrColumnId: JobStatus | typeof UNCATEGORIZED_COLUMN_ID) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    const jobToMove = jobs.find(j => j.id === jobId);

    if (jobToMove) {
      // Prevent dragging from "Pago" to other active columns
      if (jobToMove.status === JobStatus.PAID && targetStatusOrColumnId !== JobStatus.PAID && targetStatusOrColumnId !== UNCATEGORIZED_COLUMN_ID) {
        toast.error('Jobs pagos não podem ser movidos para colunas de trabalho ativo.');
        return;
      }
      
      if (targetStatusOrColumnId === JobStatus.PAID) {
        // If dropped onto "Pago", open the payment registration modal
        setJobForPaymentModal(jobToMove);
        setPaymentModalOpen(true);
        // Status update to PAID will happen upon successful modal submission
      } else {
        let finalStatus: JobStatus;
        let targetColumnName: string;

        if (targetStatusOrColumnId === UNCATEGORIZED_COLUMN_ID) {
          finalStatus = JobStatus.BRIEFING; 
          targetColumnName = "Não Categorizado (movido para Briefing)";
        } else {
          finalStatus = targetStatusOrColumnId as JobStatus;
          targetColumnName = finalStatus;
        }

        if (jobToMove.status !== finalStatus) {
          updateJob({ ...jobToMove, status: finalStatus });
          if (finalStatus === JobStatus.FINALIZED) {
            toast.success(`Job "${jobToMove.name}" movido para ${targetColumnName}. Verifique o módulo Financeiro.`);
          } else {
            toast.success(`Job "${jobToMove.name}" movido para ${targetColumnName}!`);
          }
        }
      }
    }
  }, [jobs, updateJob]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  }, []);

  const handlePaymentModalSuccess = () => {
    setPaymentModalOpen(false);
    setJobForPaymentModal(undefined);
    toast.success('Pagamento registrado com sucesso via Kanban!');
    // The updateJob within the modal form already updates context and triggers re-render
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const standardStatuses = KANBAN_COLUMNS.map(col => col.status as JobStatus);
  const uncategorizedJobs = jobs.filter(job => !standardStatuses.includes(job.status));

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">Gerenciamento de Jobs</h1>
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 p-1 bg-slate-200 rounded-lg">
            <button
                onClick={() => setCurrentView('kanban')}
                title="Visualização Kanban"
                className={`p-2 rounded-md transition-colors filter hover:brightness-100 ${currentView === 'kanban' ? 'bg-accent text-white shadow-sm' : 'hover:bg-slate-300'}`}
            >
                <BriefcaseIcon />
            </button>
            <button
                onClick={() => setCurrentView('list')}
                title="Visualização Lista Geral"
                className={`p-2 rounded-md transition-colors filter hover:brightness-100 ${currentView === 'list' ? 'bg-accent text-white shadow-sm' : 'hover:bg-slate-300'}`}
            >
                <ListBulletIcon />
            </button>
            </div>
            <button
            onClick={handleAddJob}
            className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:brightness-90 transition-all flex items-center"
            >
            <PlusCircleIcon /> <span className="ml-2">Adicionar Job</span>
            </button>
        </div>
      </div>

      {currentView === 'kanban' ? (
        <div className="flex-grow overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {KANBAN_COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                title={column.title}
                status={column.status as JobStatus}
                jobs={jobs.filter(job => job.status === (column.status as JobStatus))} 
                clients={clients}
                onEditJob={handleEditJob}
                onDeleteJob={handleDeleteJob}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
              />
            ))}
            <KanbanColumn
                key={UNCATEGORIZED_COLUMN_ID}
                title="Não Categorizado"
                status={UNCATEGORIZED_COLUMN_ID}
                jobs={uncategorizedJobs}
                clients={clients}
                onEditJob={handleEditJob}
                onDeleteJob={handleDeleteJob}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
            />
          </div>
        </div>
      ) : (
        <JobListTableView 
            jobs={jobs} 
            clients={clients} 
            onEditJob={handleEditJob} 
            onDeleteJob={handleDeleteJob}
            privacyModeEnabled={settings.privacyModeEnabled || false}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingJob ? 'Editar Job' : 'Adicionar Novo Job'} size="lg">
        <JobForm onSuccess={handleFormSuccess} jobToEdit={editingJob} />
      </Modal>

      {jobForPaymentModal && (
        <PaymentRegistrationModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setJobForPaymentModal(undefined); 
          }}
          job={jobForPaymentModal}
          onSuccess={handlePaymentModalSuccess}
        />
      )}
    </div>
  );
};

export default JobsPage;