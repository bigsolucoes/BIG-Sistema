
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { Job, Client, ServiceType, JobStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-card-bg p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold text-text-primary mb-4">{title}</h2>
    <div className="h-72 md:h-96"> {/* Fixed height for chart containers */}
      {children}
    </div>
  </div>
);

const KPICard: React.FC<{ title: string; value: string | number; unit?: string }> = ({ title, value, unit }) => (
  <div className="bg-card-bg p-6 rounded-xl shadow-lg text-center">
    <h3 className="text-md font-medium text-text-secondary mb-1">{title}</h3>
    <p className="text-3xl font-bold text-accent">
      {typeof value === 'number' ? value.toLocaleString('pt-BR', {minimumFractionDigits: unit === 'dias' ? 0 : (unit === 'R$' ? 2 : 0) , maximumFractionDigits: unit === 'dias' ? 0 : (unit === 'R$' ? 2 : 0)}) : value}
      {unit && <span className="text-lg ml-1">{unit}</span>}
    </p>
  </div>
);


const PerformancePage: React.FC = () => {
  const { jobs, clients, loading } = useAppData();

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  // Faturamento Mensal (últimos 12 meses)
  const monthlyRevenueMap = jobs
    .filter(job => job.paidAt)
    .reduce((acc, job) => {
      try {
        const date = new Date(job.paidAt!);
        if (isNaN(date.getTime())) return acc; // Skip invalid dates

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01, 02, ..., 12
        const yearMonthKey = `${year}-${month}`; 
        
        acc[yearMonthKey] = (acc[yearMonthKey] || 0) + job.value;
      } catch (e) {
        console.warn("Error processing job.paidAt for revenue", job.paidAt, e);
      }
      return acc;
    }, {} as { [key: string]: number });

  const revenueData = Object.entries(monthlyRevenueMap)
    .map(([yearMonthKey, revenue]) => {
      // Format YYYY-MM to "mmm/yy" for display
      const [yearStr, monthStr] = yearMonthKey.split('-');
      const dateForFormatting = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const displayName = dateForFormatting.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      return { key: yearMonthKey, name: displayName, Receita: revenue };
    })
    .sort((a, b) => a.key.localeCompare(b.key)) // Sort by YYYY-MM
    .slice(-12); // Take the last 12 months (most recent)


  // Top Clientes por Receita
  const clientRevenue = clients.map(client => {
    const total = jobs
      .filter(job => job.clientId === client.id && job.paidAt)
      .reduce((sum, job) => sum + job.value, 0);
    return { name: client.name, value: total };
  }).filter(c => c.value > 0).sort((a,b) => b.value - a.value).slice(0,5); // Top 5

  // Top Serviços por Receita
  const serviceRevenue = Object.values(ServiceType).map(service => {
    const total = jobs
      .filter(job => job.serviceType === service && job.paidAt)
      .reduce((sum, job) => sum + job.value, 0);
    return { name: service, value: total };
  }).filter(s => s.value > 0);
  
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Valor Médio por Job
  const paidJobs = jobs.filter(job => job.paidAt);
  const averageJobValue = paidJobs.length > 0 ? paidJobs.reduce((sum, job) => sum + job.value, 0) / paidJobs.length : 0;

  // Tempo Médio de Conclusão (do createdAt até paidAt para jobs pagos)
  const completedJobsWithTimes = paidJobs.filter(job => job.createdAt && job.paidAt);
  const averageCompletionTime = completedJobsWithTimes.length > 0 
    ? completedJobsWithTimes.reduce((sum, job) => {
        try {
          const start = new Date(job.createdAt!).getTime();
          const end = new Date(job.paidAt!).getTime();
          if (isNaN(start) || isNaN(end)) return sum; // Skip if dates are invalid
          return sum + (end - start);
        } catch (e) {
          console.warn("Error calculating completion time for job", job.id, e);
          return sum;
        }
      }, 0) / completedJobsWithTimes.length / (1000 * 60 * 60 * 24) // in days
    : 0;


  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Painel de Desempenho</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <KPICard title="Valor Médio por Job" value={averageJobValue} unit="R$" />
        <KPICard title="Tempo Médio de Conclusão" value={averageCompletionTime.toFixed(1)} unit="dias" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Faturamento Mensal (Últimos 12 meses)">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, "Receita"]} />
                <Legend wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-text-secondary text-center pt-10">Dados insuficientes para o gráfico de faturamento.</p>}
        </ChartCard>

        <ChartCard title="Top 5 Clientes (por Receita)">
           {clientRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={clientRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {clientRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}/>
                <Legend wrapperStyle={{fontSize: "14px"}}/>
              </PieChart>
            </ResponsiveContainer>
           ) : <p className="text-text-secondary text-center pt-10">Dados insuficientes para o gráfico de top clientes.</p>}
        </ChartCard>

        <ChartCard title="Receita por Tipo de Serviço">
          {serviceRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={serviceRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => `R$${value/1000}k`} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, "Receita"]} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={25}/>
              </BarChart>
            </ResponsiveContainer>
          ): <p className="text-text-secondary text-center pt-10">Dados insuficientes para o gráfico de top serviços.</p>}
        </ChartCard>
      </div>
    </div>
  );
};

export default PerformancePage;
