
import React, { useState, useCallback } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, JobStatus, Client } from '../types';
import { KANBAN_COLUMNS, PlusCircleIcon, PencilIcon, TrashIcon } from '../constants';
import Modal from '../components/Modal';
import JobForm from './forms/JobForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const JobCard: React.FC<{ job: Job; client?: Client; onEdit: (job: Job) => void; onDelete: (jobId: string) => void; onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void }> = 
  ({ job, client, onEdit, onDelete, onDragStart }) => {
  const isOverdue = new Date(job.deadline) < new Date() && job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED;
  
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, job.id)}
      className="bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing border border-border-color"
    >
      <h4 className="font-semibold text-md text-text-primary mb-1">{job.name}</h4>
      <p className="text-xs text-text-secondary mb-1">{client?.name || 'Cliente não encontrado'}</p>
      <p className="text-xs text-text-secondary mb-2">Valor: R$ {job.value.toLocaleString('pt-BR')}</p>
      <div className={`text-xs px-2 py-1 inline-block rounded-full mb-2 ${
        isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-accent'
      }`}>
        Prazo: {new Date(job.deadline).toLocaleDateString('pt-BR')} {isOverdue && '(Atrasado)'}
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
  status: JobStatus; 
  jobs: Job[]; 
  clients: Client[]; 
  onEditJob: (job: Job) => void; 
  onDeleteJob: (jobId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: JobStatus) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ title, status, jobs, clients, onEditJob, onDeleteJob, onDragStart, onDrop, onDragOver }) => {
  const columnJobs = jobs.filter(job => job.status === status);

  return (
    <div 
      className="bg-slate-100 p-4 rounded-lg w-80 flex-shrink-0 min-h-[calc(100vh-200px)]"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <h3 className="font-semibold text-lg text-text-primary mb-4 sticky top-0 bg-slate-100 py-2">{title} ({columnJobs.length})</h3>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-260px)]">
        {columnJobs.length > 0 ? columnJobs.map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            client={clients.find(c => c.id === job.clientId)} 
            onEdit={onEditJob}
            onDelete={onDeleteJob}
            onDragStart={onDragStart}
          />
        )) : <p className="text-sm text-text-secondary text-center py-4">Nenhum job nesta etapa.</p>}
      </div>
    </div>
  );
};

const JobsPage: React.FC = () => {
  const { jobs, clients, addJob, updateJob, deleteJob: deleteJobContext, loading } = useAppData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);

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

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    const jobToMove = jobs.find(j => j.id === jobId);
    if (jobToMove && jobToMove.status !== targetStatus) {
      updateJob({ ...jobToMove, status: targetStatus });
      toast.success(`Job "${jobToMove.name}" movido para ${targetStatus}!`);
    }
  }, [jobs, updateJob]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  }, []);


  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Gerenciamento de Jobs</h1>
        <button
          onClick={handleAddJob}
          className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:bg-opacity-90 transition-colors flex items-center"
        >
          <PlusCircleIcon /> <span className="ml-2">Adicionar Novo Job</span>
        </button>
      </div>

      <div className="flex-grow overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.status as JobStatus}
              jobs={jobs}
              clients={clients}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onDragOver={onDragOver}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingJob ? 'Editar Job' : 'Adicionar Novo Job'}>
        <JobForm onSuccess={handleFormSuccess} jobToEdit={editingJob} />
      </Modal>
    </div>
  );
};

export default JobsPage;
