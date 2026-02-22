import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Zap, DollarSign, FileText } from 'lucide-react';
import api from '../services/api';

const DashboardOverview = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setMetrics(response.data);
            } catch (error) {
                console.error("Error fetching metrics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Carregando painel...</div>;
    if (!metrics) return <div className="p-8 text-red-500">Erro ao carregar dados.</div>;

    const cards = [
        {
            title: 'Faturas em Aberto',
            value: `R$ ${metrics.open_invoices_value.toFixed(2)}`,
            subValue: `${metrics.open_invoices_count} faturas`,
            icon: FileText,
            color: 'bg-orange-100 text-orange-600',
            trend: '+12%', // Mock trend
            trendUp: true
        },
        {
            title: 'Margem do Mês',
            value: `R$ ${metrics.monthly_margin.toFixed(2)}`,
            subValue: 'Lucro Estimado',
            icon: DollarSign,
            color: 'bg-green-100 text-green-600',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Produção Total',
            value: `${metrics.monthly_production.toFixed(0)} kWh`,
            subValue: 'Energia Gerada',
            icon: Zap,
            color: 'bg-blue-100 text-blue-600',
            trend: '-2%',
            trendUp: false
        }
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${card.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                    <Icon size={24} />
                                </div>
                                <span className={`flex items-center text-[10px] font-black uppercase tracking-widest ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                    {card.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                    {card.trend}
                                </span>
                            </div>
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.title}</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-[#1e293b] tracking-tight">{card.value}</span>
                            </div>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-2">{card.subValue}</p>
                        </div>
                    );
                })}
            </div>

            {/* Active Clients List */}
            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight uppercase flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={20} />
                        </div>
                        Clientes Recentes
                    </h3>
                    <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">Ver Todos</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] text-gray-400">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Nome</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">UC</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {metrics.recent_clients.length > 0 ? (
                                metrics.recent_clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-black text-[#1e293b] text-sm uppercase tracking-tight">{client.name}</div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-gray-500">{client.uc_number}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                Ativo
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-8 py-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum cliente recente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
