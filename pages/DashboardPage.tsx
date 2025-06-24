import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, JobStatus } from '../types';
import { PlusCircleIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon, BriefcaseIcon, UsersIcon } from '../constants';
import Modal from '../components/Modal';
import JobForm from './forms/JobForm'; 
import ClientForm from './forms/ClientForm'; 
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { jobs, clients, settings, loading } = useAppData(); // Added settings
  const [isJobModalOpen, setJobModalOpen] = React.useState(false);
  const [isClientModalOpen, setClientModalOpen] = React.useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  const now = new Date();
  const todayStart = new Date(now.setHours(0,0,0,0)); 
  const thirtyDaysAgo = new Date(new Date().setDate(todayStart.getDate() - 30));


  const totalToReceive = jobs
    .filter(job => job.status === JobStatus.FINALIZED && !job.paidAt)
    .reduce((sum, job) => sum + job.value, 0);

  const receivedLast30Days = jobs
    .filter(job => {
        try {
            return job.paidAt && new Date(job.paidAt) >= thirtyDaysAgo;
        } catch (e) { return false; }
    })
    .reduce((sum, job) => sum + job.value, 0);

  const jobStatusCounts = jobs.reduce((acc, job) => {
    try {
        const deadlineDate = new Date(job.deadline);
        const isOverdue = !isNaN(deadlineDate.getTime()) && deadlineDate < todayStart && job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED;
        
        if (isOverdue) {
          acc.Atrasados = (acc.Atrasados || 0) + 1;
        } else if (job.status === JobStatus.PAID || job.status === JobStatus.FINALIZED) {
          acc.Concluídos = (acc.Concluídos || 0) + 1;
        } else if (job.status === JobStatus.REVIEW) {
          acc.AguardandoAprovação = (acc.AguardandoAprovação || 0) + 1;
        }
         else {
          acc.EmAndamento = (acc.EmAndamento || 0) + 1;
        }
    } catch(e) {
        console.warn("Error processing job status for dashboard", job.id, e);
    }
    return acc;
  }, {} as { [key: string]: number });

  const jobStatusData = Object.entries(jobStatusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = {
    EmAndamento: '#3b82f6', 
    Atrasados: '#ef4444', 
    AguardandoAprovação: '#eab308', 
    Concluídos: '#22c55e', 
  };

  const upcomingDeadlines = jobs
    .filter(job => {
        try {
            return job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED && new Date(job.deadline) >= todayStart;
        } catch(e) { return false; }
    })
    .sort((a, b) => {
        try {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } catch(e) { return 0; }
    })
    .slice(0, 5);

  const getDaysRemaining = (deadline: string) => {
    try {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return 'Data inválida';
      }
      
      const deadlineDayStart = new Date(deadlineDate.setHours(0,0,0,0));

      if (deadlineDayStart < todayStart) return 'Atrasado';
      if (deadlineDayStart.getTime() === todayStart.getTime()) return 'Hoje';
      
      const diffTime = deadlineDayStart.getTime() - todayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} dia(s)`;

    } catch (e) {
      console.warn("Error in getDaysRemaining", deadline, e);
      return 'Erro no prazo';
    }
  };
  
  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = 'text-accent' }) => (
    <div className="bg-card-bg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{typeof value === 'number' ? `R$ ${value.toLocaleString('pt-BR')}` : value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${color.startsWith('text-') ? `${color.replace('text-', 'bg-')} ${color}` : `bg-${color}-500 text-${color}-500`}`}>{icon}</div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">
                {settings.userName ? `Olá, ${settings.userName}!` : 'Dashboard'}
            </h1>
            {settings.userName && <p className="text-text-secondary">Bem-vindo(a) ao seu painel BIG Soluções.</p>}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setJobModalOpen(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg shadow hover:bg-opacity-90 transition-colors flex items-center"
          >
            <PlusCircleIcon /> <span className="ml-2">Novo Job</span>
          </button>
          <button
            onClick={() => setClientModalOpen(true)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-600 transition-colors flex items-center"
          >
            <PlusCircleIcon /> <span className="ml-2">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="A Receber" value={totalToReceive} icon={<CurrencyDollarIcon />} color="text-yellow-500" />
        <StatCard title="Recebido (30 dias)" value={receivedLast30Days} icon={<CheckCircleIcon />} color="text-green-500" />
        <StatCard title="Jobs Ativos" value={jobs.filter(j => j.status !== JobStatus.PAID && j.status !== JobStatus.FINALIZED).length} icon={<BriefcaseIcon />} />
        <StatCard title="Total Clientes" value={clients.length} icon={<UsersIcon />} />
      </div>
      
      {/* Job Status & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Status dos Jobs</h2>
          {jobStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={jobStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} job(s)`}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-text-secondary">Nenhum job para exibir.</p>}
        </div>

        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Próximos Prazos</h2>
          {upcomingDeadlines.length > 0 ? (
            <ul className="space-y-3">
              {upcomingDeadlines.map(job => (
                <li key={job.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Link to={`/jobs`} className="block">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-text-primary">{job.name}</span>
                      <span className={`text-sm font-semibold ${new Date(job.deadline) < todayStart && job.status !== JobStatus.PAID && job.status !== JobStatus.FINALIZED ? 'text-red-500' : 'text-accent'}`}>
                        {getDaysRemaining(job.deadline)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{clients.find(c => c.id === job.clientId)?.name || 'Cliente desconhecido'}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-text-secondary">Nenhum prazo iminente.</p>}
        </div>
      </div>


      <Modal isOpen={isJobModalOpen} onClose={() => setJobModalOpen(false)} title="Adicionar Novo Job">
        <JobForm onSuccess={() => setJobModalOpen(false)} />
      </Modal>
      <Modal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} title="Adicionar Novo Cliente">
        <ClientForm onSuccess={() => setClientModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default DashboardPage;