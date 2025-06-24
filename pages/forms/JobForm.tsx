
import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Job, Client, ServiceType, JobStatus } from '../../types';
import { JOB_STATUS_OPTIONS, SERVICE_TYPE_OPTIONS } from '../../constants';
import toast from 'react-hot-toast';

interface JobFormProps {
  onSuccess: () => void;
  jobToEdit?: Job;
}

const JobForm: React.FC<JobFormProps> = ({ onSuccess, jobToEdit }) => {
  const { clients, addJob, updateJob } = useAppData();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.VIDEO);
  const [value, setValue] = useState<number>(0);
  const [deadline, setDeadline] = useState(''); // Store as YYYY-MM-DD for input
  const [status, setStatus] = useState<JobStatus>(JobStatus.BRIEFING);
  const [cloudLink, setCloudLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (jobToEdit) {
      setName(jobToEdit.name);
      setClientId(jobToEdit.clientId);
      setServiceType(jobToEdit.serviceType);
      setValue(jobToEdit.value);
      try {
        if (jobToEdit.deadline) {
          const d = new Date(jobToEdit.deadline);
          if (!isNaN(d.getTime())) {
            setDeadline(d.toISOString().split('T')[0]);
          } else {
            setDeadline('');
            console.warn(`Invalid deadline found for job ${jobToEdit.id}: ${jobToEdit.deadline}`);
          }
        } else {
          setDeadline('');
        }
      } catch (e) {
        console.error("Error processing jobToEdit.deadline", e);
        setDeadline(''); // Fallback
        toast.error("Erro ao carregar o prazo do job.");
      }
      setStatus(jobToEdit.status);
      setCloudLink(jobToEdit.cloudLink || '');
      setNotes(jobToEdit.notes || '');
    } else {
      // Reset all fields for new job form
      setName('');
      if (clients.length > 0 && clients[0]?.id) {
          setClientId(clients[0].id);
      } else {
          setClientId(''); 
      }
      setServiceType(ServiceType.VIDEO);
      setValue(0);
      setDeadline('');
      setStatus(JobStatus.BRIEFING);
      setCloudLink('');
      setNotes('');
    }
  }, [jobToEdit, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !deadline) {
      toast.error('Preencha todos os campos obrigatórios (Nome, Cliente, Prazo).');
      return;
    }

    const deadlineDate = new Date(deadline + "T00:00:00.000Z"); 
    if (isNaN(deadlineDate.getTime())) {
      toast.error('Data de prazo inválida.');
      return;
    }

    const jobData = {
      name,
      clientId,
      serviceType,
      value: Number(value),
      deadline: deadlineDate.toISOString(),
      status,
      cloudLink: cloudLink || undefined,
      notes: notes || undefined,
    };

    if (jobToEdit) {
      updateJob({ ...jobToEdit, ...jobData });
      toast.success('Job atualizado com sucesso!');
    } else {
      addJob(jobData);
      toast.success('Job adicionado com sucesso!');
    }
    onSuccess();
  };
  
  const commonInputClass = "w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-custom-brown focus:border-custom-brown text-text-primary outline-none transition-shadow bg-card-bg";


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="jobName" className="block text-sm font-medium text-text-secondary mb-1">Nome do Job <span className="text-red-500">*</span></label>
        <input type="text" id="jobName" value={name} onChange={(e) => setName(e.target.value)} className={commonInputClass} required />
      </div>

      <div>
        <label htmlFor="client" className="block text-sm font-medium text-text-secondary mb-1">Cliente <span className="text-red-500">*</span></label>
        <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={commonInputClass} required>
          <option value="" disabled>Selecione um cliente</option>
          {clients.map((client: Client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-text-secondary mb-1">Tipo de Serviço</label>
            <select id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className={commonInputClass}>
            {SERVICE_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="value" className="block text-sm font-medium text-text-secondary mb-1">Valor (R$)</label>
            <input type="number" id="value" value={value} onChange={(e) => setValue(parseFloat(e.target.value))} className={commonInputClass} min="0" step="0.01" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary mb-1">Prazo de Entrega <span className="text-red-500">*</span></label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={commonInputClass} required/>
        </div>
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)} className={commonInputClass}>
            {JOB_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            </select>
        </div>
      </div>

      <div>
        <label htmlFor="cloudLink" className="block text-sm font-medium text-text-secondary mb-1">Link da Pasta na Nuvem (Opcional)</label>
        <input type="url" id="cloudLink" value={cloudLink} onChange={(e) => setCloudLink(e.target.value)} className={commonInputClass} placeholder="https://example.com/drive/project" />
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Notas (Opcional)</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={commonInputClass} placeholder="Detalhes adicionais sobre o job..."></textarea>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:bg-opacity-90 transition-colors">
          {jobToEdit ? 'Salvar Alterações' : 'Adicionar Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
