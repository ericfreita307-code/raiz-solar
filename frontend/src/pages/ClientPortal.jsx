import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    FileText,
    BarChart2,
    User,
    LogOut,
    AlertCircle,
    Download,
    QrCode,
    Save,
    X,
    Check,
    Copy,
    Clipboard
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const ClientPortal = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, history, profile
    const [user, setUser] = useState(null);
    const [showPixModal, setShowPixModal] = useState(false);
    const [pixData, setPixData] = useState(null);
    const [generatingPix, setGeneratingPix] = useState(false);
    const [pixCopied, setPixCopied] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login?type=client');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchClientData(parsedUser.user_id);
    }, [navigate]);

    const fetchClientData = async (id) => {
        try {
            const response = await api.get(`/clients/id/${id}`);
            setClient(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching client data", error);
            setLoading(false);
        }
    };

    const handleGeneratePix = async (invoiceId) => {
        setGeneratingPix(true);
        try {
            const response = await api.get(`/invoices/${invoiceId}/pix`);
            const data = response.data;

            // Debug: validate received data
            console.log('[PIX] Data received from backend:', data);
            console.log('[PIX] pix_payload:', data.pix_payload);
            console.log('[PIX] pix_key:', data.pix_key);
            console.log('[PIX] amount:', data.amount);

            if (!data.pix_payload) {
                console.error('[PIX] pix_payload is empty or null!');
                throw new Error('Payload PIX vazio retornado pelo servidor.');
            }

            setPixData(data);
            setShowPixModal(true);
        } catch (error) {
            console.error('[PIX] Error:', error);
            const detail = error.response?.data?.detail || error.message || 'Erro desconhecido';
            alert(`Erro ao gerar PIX: ${detail}`);
        } finally {
            setGeneratingPix(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Ocorreu um erro</h1>
                <p className="text-gray-600 mb-6">Não conseguimos carregar seus dados. Por favor, tente novamente mais tarde.</p>
                <button
                    onClick={handleLogout}
                    className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition"
                >
                    Voltar para o Início
                </button>
            </div>
        );
    }

    // Get latest invoice
    const invoices = [...client.invoices].sort((a, b) => b.month.localeCompare(a.month));
    const latestInvoice = invoices[0] || null;

    // Prepare chart data (Last 6 months economy)
    const chartData = [...invoices].reverse().slice(-6).map(inv => {
        const economy = (inv.value_without_discount || 0) - (inv.amount_to_collect || 0);
        return {
            month: inv.month,
            value: economy > 0 ? economy : 0, // Focus on economy/savings
            consumption: inv.consumption_kwh,
            cost: inv.amount_to_collect
        };
    });

    const totalAccumulatedSavings = invoices.reduce((acc, inv) => {
        const economy = (inv.value_without_discount || 0) - (inv.amount_to_collect || 0);
        return acc + (economy > 0 ? economy : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12 text-[#1e293b]">
            {/* Header / Nav */}
            <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <img src="/logo-raiz-solar.png" alt="Raiz Solar Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-lg font-black text-[#1e293b] tracking-tight leading-none uppercase">Raiz Solar</h1>
                        <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mt-1">Portal do Cliente</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bem-vindo,</p>
                        <p className="text-sm font-black text-[#1e293b]">{client.name}</p>
                        <p className="text-[8px] text-gray-300 font-bold uppercase mt-1">v1.0.8 - {new Date().toLocaleTimeString()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
                {/* Services Grid */}
                <section className="mb-10">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Serviços Disponíveis</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <ServiceIcon
                            icon={<FileText />}
                            label="Faturas e 2ª via"
                            active={activeSection === 'dashboard'}
                            onClick={() => setActiveSection('dashboard')}
                        />
                        <ServiceIcon
                            icon={<BarChart2 />}
                            label="Histórico de Economia"
                            active={activeSection === 'history'}
                            onClick={() => setActiveSection('history')}
                        />
                        <ServiceIcon
                            icon={<User />}
                            label="Atualização Cadastral"
                            active={activeSection === 'profile'}
                            onClick={() => setActiveSection('profile')}
                            colSpanFull
                        />
                    </div>
                </section>

                {activeSection === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Latest Invoice */}
                        <div className="lg:col-span-5">
                            <InvoiceCard
                                latestInvoice={latestInvoice}
                                client={client}
                                onGeneratePix={handleGeneratePix}
                                generatingPix={generatingPix}
                            />
                        </div>

                        {/* Chart Preview */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
                                        HISTÓRICO DE ECONOMIA
                                    </h3>
                                    <button
                                        onClick={() => setActiveSection('history')}
                                        className="text-yellow-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                    >
                                        Ver mais detalhes
                                    </button>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ConsumptionChart data={chartData} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'history' && (
                    <HistorySection
                        invoices={invoices}
                        chartData={chartData}
                        totalAccumulatedSavings={totalAccumulatedSavings}
                    />
                )}

                {activeSection === 'profile' && (
                    <ProfileSection client={client} onUpdate={() => fetchClientData(user.user_id)} />
                )}

                {/* Pix Modal */}
                {showPixModal && pixData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">

                            {/* Modal Header */}
                            <div className="bg-[#f59e0b] p-7 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-tighter">Pagamento Pix</h3>
                                    <p className="text-[11px] font-bold text-[#78350f] uppercase tracking-[0.2em] mt-1 opacity-80">Escaneie o QR Code abaixo</p>
                                </div>
                                <button
                                    onClick={() => { setShowPixModal(false); setPixCopied(false); }}
                                    className="bg-[#1e293b] text-white p-2.5 rounded-2xl hover:bg-black transition-all shadow-xl"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* QR Code */}
                            <div className="px-8 pt-8 pb-4 flex flex-col items-center">

                                {/* Amount badge */}
                                {pixData.amount > 0 && (
                                    <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-6 py-3 w-full text-center">
                                        <p className="text-[9px] font-black text-yellow-700 uppercase tracking-widest mb-1">Valor a Pagar</p>
                                        <p className="text-2xl font-black text-[#1e293b]">
                                            R$ {pixData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-white rounded-3xl border-4 border-gray-100 shadow-inner p-4 mb-5 w-full flex items-center justify-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(pixData.pix_payload)}`}
                                        alt="Pix QR Code"
                                        className="w-56 h-56 rounded-xl"
                                        onError={(e) => { e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(pixData.pix_payload)}`; }}
                                    />
                                </div>

                                {/* PIX Key read-only */}
                                <div className="w-full mb-3">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1.5">Chave Pix</p>
                                    <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-[#1e293b] text-sm select-all cursor-text">
                                        {pixData.pix_key}
                                    </div>
                                </div>

                                {/* PIX Copia e Cola read-only */}
                                <div className="w-full mb-5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1.5">Pix Copia e Cola</p>
                                    <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 font-mono text-[11px] text-gray-500 break-all select-all cursor-text max-h-20 overflow-y-auto leading-relaxed">
                                        {pixData.pix_payload || <span className="text-red-400 italic">Erro: payload vazio</span>}
                                    </div>
                                </div>

                                {/* Copy Button with visual feedback */}
                                <button
                                    onClick={() => copyToClipboard(pixData.pix_payload)}
                                    disabled={!pixData.pix_payload}
                                    className={`w-full py-5 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl active:scale-95 mb-6 ${pixCopied
                                        ? 'bg-green-600 text-white shadow-green-200'
                                        : 'bg-[#1e293b] text-white hover:bg-black disabled:opacity-50'
                                        }`}
                                >
                                    {pixCopied ? (
                                        <><Check size={18} className="text-green-300" /> Copiado com Sucesso!</>
                                    ) : (
                                        <><QrCode size={18} className="text-yellow-500" /> Copiar Código Pix</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const ServiceIcon = ({ icon, label, active, onClick, colSpanFull }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-3 p-5 sm:p-4 rounded-3xl transition-all group w-full ${colSpanFull ? 'col-span-2 sm:col-span-1' : ''
            } ${active ? 'bg-yellow-500 shadow-xl shadow-yellow-100 scale-[1.02]' : 'bg-[#1e293b] hover:bg-black shadow-lg'}`}
        style={{ minHeight: '110px' }}
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-[#1e293b] text-yellow-500' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
            {React.cloneElement(icon, { size: 26, strokeWidth: 2.5 })}
        </div>
        <span className={`text-[10px] font-black text-center uppercase tracking-wider leading-tight ${active ? 'text-[#1e293b]' : 'text-gray-300 group-hover:text-white'}`}>
            {label}
        </span>
    </button>
);

const InvoiceCard = ({ latestInvoice, client, onGeneratePix, generatingPix }) => {
    if (!latestInvoice) return (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
            <FileText className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">Nenhuma fatura disponível no momento.</p>
        </div>
    );

    const isPaid = latestInvoice.status_pago;
    const [year, month] = latestInvoice.month.split('-');
    const formattedDueDate = `${String(client.payment_day || 1).padStart(2, '0')}/${month}/${year}`;

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-[#1e293b] tracking-tight">ÚLTIMA FATURA</h3>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isPaid ? 'Pago' : 'Aguardando Pagamento'}
                </div>
            </div>

            <div className="p-8 flex-1">
                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês de Referência</p>
                        <p className="text-lg font-black text-[#1e293b]">{latestInvoice.month}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vencimento</p>
                        <p className={`text-lg font-black ${isPaid ? 'text-gray-800' : 'text-yellow-600'}`}>
                            {formattedDueDate}
                        </p>
                    </div>
                </div>

                <div className="mb-8 text-center py-10 rounded-[2.5rem] bg-[#f8fafc] border-2 border-dashed border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <QrCode size={80} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Total com Desconto</p>
                    <p className="text-6xl font-black text-[#1e293b] tracking-tighter mb-4">
                        <span className="text-2xl mr-1">R$</span>
                        {latestInvoice.amount_to_collect.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {latestInvoice.value_without_discount > 0 && (
                        <div className="inline-flex flex-col items-center">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Valor Sem Desconto</span>
                            <span className="text-base font-bold text-gray-400 line-through decoration-red-400/30 decoration-2">
                                R$ {latestInvoice.value_without_discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> UC</span>
                        <span className="text-[#1e293b] font-black">{client.uc_number}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Endereço</span>
                        <span className="text-[#1e293b] font-bold truncate max-w-[180px]">{client.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isPaid && (
                        <button
                            onClick={() => onGeneratePix(latestInvoice.id)}
                            disabled={generatingPix}
                            className="flex items-center justify-center gap-2 bg-yellow-500 text-[#1e293b] py-4 rounded-2xl font-black hover:bg-yellow-400 transition shadow-lg shadow-yellow-100 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            <QrCode size={18} /> {generatingPix ? 'Gerando...' : 'Gerar Pix'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (latestInvoice.equatorial_invoice_path) {
                                const path = latestInvoice.equatorial_invoice_path;
                                const url = path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${path}`;
                                window.open(url, '_blank');
                            } else {
                                alert('Fatura PDF ainda não disponível para este mês.');
                            }
                        }}
                        className={`flex items-center justify-center gap-2 border-2 border-[#1e293b] text-[#1e293b] py-4 rounded-2xl font-black hover:bg-gray-50 transition uppercase tracking-widest text-xs ${isPaid ? 'md:col-span-2' : ''}`}
                    >
                        <Download size={18} /> Baixar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConsumptionChart = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                dy={10}
            />
            <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1rem' }}
                itemStyle={{ fontWeight: 900, color: '#1e293b' }}
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Economia']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10b981' : '#EAB308'} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

const HistorySection = ({ invoices, chartData, totalAccumulatedSavings }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-black text-[#1e293b] mb-8 border-l-4 border-yellow-500 pl-4">HISTÓRICO DE ECONOMIA</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 col-span-1 md:col-span-2">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Desconto Acumulado (R$) - Últimos 6 meses</h3>
                <div className="h-[250px] md:h-[300px]">
                    <ConsumptionChart data={chartData} />
                </div>
            </div>
            <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-xl shadow-gray-200 text-white flex flex-col justify-center">
                <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">Economia Total Acumulada</h3>
                <p className="text-5xl font-black mb-2 tracking-tighter">
                    <span className="text-2xl mr-1">R$</span>
                    {totalAccumulatedSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-gray-400 font-bold opacity-80 uppercase text-[10px] tracking-wider">Histórico Completo</p>
            </div>
        </div>

        {/* Versão Desktop: Tabela */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Mês</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Consumo (kWh)</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Economia (R$)</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Valor Sem Desconto</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">V. Fatura</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Status</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] text-center">Fatura</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {invoices.map((inv) => {
                        const economy = (inv.value_without_discount || 0) - (inv.amount_to_collect || 0);
                        return (
                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-black text-[#1e293b]">{inv.month}</td>
                                <td className="p-6 font-bold text-gray-600">{inv.consumption_kwh.toFixed(0)} kWh</td>
                                <td className="p-6 font-black text-green-600 bg-green-50/30">
                                    R$ {economy.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6 font-bold text-gray-400 line-through decoration-red-400/20">
                                    R$ {(inv.value_without_discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6 font-black text-yellow-600">
                                    R$ {(inv.amount_to_collect || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.status_pago ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {inv.status_pago ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    <button
                                        onClick={() => {
                                            if (inv.equatorial_invoice_path) {
                                                const path = inv.equatorial_invoice_path;
                                                const url = path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${path}`;
                                                window.open(url, '_blank');
                                            } else {
                                                alert('Fatura PDF ainda não disponível para este mês.');
                                            }
                                        }}
                                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                    >
                                        <Download size={20} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Versão Mobile: Cards */}
        <div className="md:hidden space-y-4">
            {invoices.map((inv) => {
                const economy = (inv.value_without_discount || 0) - (inv.amount_to_collect || 0);
                return (
                    <div key={inv.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-black text-[#1e293b] tracking-tight">{inv.month}</span>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.status_pago ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {inv.status_pago ? 'Pago' : 'Pendente'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Consumo</p>
                                <p className="text-sm font-bold text-gray-700">{inv.consumption_kwh.toFixed(0)} kWh</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Economia</p>
                                <p className="text-sm font-black text-green-600">R$ {economy.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">V. Fatura</p>
                                <p className="text-sm font-black text-yellow-600">R$ {(inv.amount_to_collect || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Sem Desconto</p>
                                <p className="text-sm font-bold text-gray-400 line-through decoration-red-400/20">
                                    R$ {(inv.value_without_discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (inv.equatorial_invoice_path) {
                                    const path = inv.equatorial_invoice_path;
                                    const url = path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${path}`;
                                    window.open(url, '_blank');
                                } else {
                                    alert('Fatura PDF ainda não disponível.');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 border-2 border-gray-100 text-[#1e293b] py-4 rounded-2xl font-black hover:bg-gray-100 transition uppercase tracking-widest text-[10px]"
                        >
                            <Download size={16} /> Baixar PDF
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
);

const ProfileSection = ({ client, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        password: '',
        confirmPassword: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Senhas não coincidem!');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };
            delete payload.confirmPassword;
            if (!payload.password) delete payload.password;

            await api.patch(`/clients/profile/${client.id}`, payload);
            alert('Perfil atualizado com sucesso!');
            onUpdate();
        } catch (error) {
            console.error("Error updating profile", error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <h2 className="text-2xl font-black text-[#1e293b] mb-8 border-l-4 border-yellow-500 pl-4 uppercase">Atualização Cadastral</h2>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Editable Fields */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-yellow-600 uppercase tracking-widest border-b border-yellow-50 pb-2">Informações Pessoais</h4>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold focus:border-yellow-500 outline-none transition text-[#1e293b]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold focus:border-yellow-500 outline-none transition text-[#1e293b]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold focus:border-yellow-500 outline-none transition text-[#1e293b]"
                                />
                            </div>
                        </div>

                        {/* Read-only / Blocked Fields */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-red-500 uppercase tracking-widest border-b border-red-50 pb-2 flex items-center gap-2">
                                <AlertCircle size={14} /> Somente Leitura
                            </h4>

                            <div className="space-y-2 opacity-60 grayscale-[0.5]">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº da UC</label>
                                <div className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed">
                                    {client.uc_number}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dia do Pagamento</label>
                                    <div className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed text-center">
                                        {client.payment_day}
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desconto (%)</label>
                                    <div className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed text-center">
                                        {client.negotiated_discount}%
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 opacity-60">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">V. KWh Original</label>
                                <div className="w-full bg-gray-100 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-500 cursor-not-allowed">
                                    R$ {client.kwh_value_original.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 mt-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Alterar Senha</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nova Senha</label>
                                <input
                                    type="password"
                                    placeholder="Deixe em branco para não alterar"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold focus:border-yellow-500 outline-none transition text-[#1e293b]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold focus:border-yellow-500 outline-none transition text-[#1e293b]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#1e293b] text-yellow-500 px-12 py-5 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-black hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                        >
                            <Save size={20} />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientPortal;
