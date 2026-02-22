import React, { useState, useEffect } from 'react';
import { Plus, Minus, History, CreditCard, Edit2, Copy, Trash2 } from 'lucide-react';
import api from '../services/api';

const CreditSystem = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null); // For Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        month: new Date().toISOString().slice(0, 7),
        consumption_kwh: '',
        kwh_value_original: '',
        kwh_value_injection: '',
        credited_balance: '',
        fixed_cost: '',
        total_invoiced: '',
        amount_to_collect: '',
        value_without_discount: '',
        status: 'aberto',
        discount_percent: 0
    });
    const [statementModalOpen, setStatementModalOpen] = useState(false);
    const [statementData, setStatementData] = useState([]);
    const [editingInvoice, setEditingInvoice] = useState(null); // track invoice being edited
    const [selectedPdfFile, setSelectedPdfFile] = useState(null); // For Equatorial invoice PDF
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [adjustmentData, setAdjustmentData] = useState({
        operation: 'creditar',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clients/');
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erro ao buscar clientes", error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (client) => {
        setSelectedClient(client);
        setInvoiceData({
            month: new Date().toISOString().slice(0, 7),
            consumption_kwh: '',
            kwh_value_original: (client.kwh_value_original || 1.20).toString(),
            kwh_value_injection: '0.90',
            credited_balance: (client.current_credits || 0).toString(),
            fixed_cost: '10.00',
            total_invoiced: '',
            amount_to_collect: '',
            value_without_discount: '',
            status: 'aberto',
            discount_percent: client.negotiated_discount || 0
        });
        setModalOpen(true);
        setSelectedPdfFile(null);
    };

    const handleOpenStatement = async (client) => {
        setSelectedClient(client);
        try {
            const response = await api.get(`/clients/${client.id}/statement`);
            setStatementData(Array.isArray(response.data) ? response.data : []);
            setStatementModalOpen(true);
        } catch (error) {
            console.error("Erro ao carregar extrato", error);
            alert("Erro ao carregar extrato.");
        }
    };

    const refreshStatement = async () => {
        if (!selectedClient) return;
        try {
            const response = await api.get(`/clients/${selectedClient.id}/statement`);
            setStatementData(Array.isArray(response.data) ? response.data : []);
            fetchClients();
        } catch (error) {
            console.error("Erro ao atualizar extrato", error);
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta fatura?")) return;
        try {
            await api.delete(`/invoices/${invoiceId}`);
            alert("Fatura excluída com sucesso!");
            if (statementModalOpen) {
                refreshStatement();
            } else {
                fetchClients();
            }
        } catch (error) {
            console.error("Erro ao excluir fatura", error);
            alert("Erro ao excluir fatura.");
        }
    };

    const handleEditInvoice = (invoice) => {
        setEditingInvoice(invoice);
        setInvoiceData({
            month: invoice.month || "",
            consumption_kwh: (invoice.consumption_kwh || 0).toString(),
            kwh_value_original: (invoice.kwh_value_original || 0).toString(),
            kwh_value_injection: (invoice.kwh_value_injection || 0).toString(),
            credited_balance: (invoice.credited_balance || 0).toString(),
            fixed_cost: (invoice.fixed_cost || 0).toString(),
            total_invoiced: (invoice.total_invoiced || 0).toString(),
            amount_to_collect: (invoice.amount_to_collect || 0).toString(),
            value_without_discount: (invoice.value_without_discount || 0).toString(),
            status: invoice.status || 'aberto',
            discount_percent: invoice.kwh_value_original > 0
                ? Number((1 - (invoice.kwh_value_injection / invoice.kwh_value_original)) * 100).toFixed(0)
                : 0
        });
        setModalOpen(true);
    };

    const handleCloneInvoice = (invoice) => {
        setEditingInvoice(null);
        setInvoiceData({
            month: invoice.month || "",
            consumption_kwh: (invoice.consumption_kwh || 0).toString(),
            kwh_value_original: (invoice.kwh_value_original || 0).toString(),
            kwh_value_injection: (invoice.kwh_value_injection || 0).toString(),
            credited_balance: (invoice.credited_balance || 0).toString(),
            fixed_cost: (invoice.fixed_cost || 0).toString(),
            total_invoiced: (invoice.total_invoiced || 0).toString(),
            amount_to_collect: (invoice.amount_to_collect || 0).toString(),
            value_without_discount: (invoice.value_without_discount || 0).toString(),
            status: invoice.status || 'aberto',
            discount_percent: invoice.kwh_value_original > 0
                ? Number((1 - (invoice.kwh_value_injection / invoice.kwh_value_original)) * 100).toFixed(0)
                : 0
        });
        setModalOpen(true);
    };

    const handleCreateInvoice = async () => {
        if (!selectedClient) return;
        try {
            const data = {
                ...invoiceData,
                client_id: selectedClient.id,
                consumption_kwh: parseFloat(invoiceData.consumption_kwh) || 0,
                kwh_value: parseFloat(invoiceData.kwh_value_injection) || 0,
                kwh_value_original: parseFloat(invoiceData.kwh_value_original) || 0,
                kwh_value_injection: parseFloat(invoiceData.kwh_value_injection) || 0,
                credited_balance: parseFloat(invoiceData.credited_balance) || 0,
                fixed_cost: parseFloat(invoiceData.fixed_cost) || 0,
                total_invoiced: parseFloat(invoiceData.total_invoiced) || 0,
                amount_to_collect: parseFloat(invoiceData.amount_to_collect) || 0,
                value_without_discount: parseFloat(invoiceData.value_without_discount) || 0,
                original_value: parseFloat(invoiceData.value_without_discount) || 0,
                invoice_value: parseFloat(invoiceData.amount_to_collect) || 0,
                total_value: parseFloat(invoiceData.amount_to_collect) || 0,
                discount: (parseFloat(invoiceData.value_without_discount) || 0) - (parseFloat(invoiceData.amount_to_collect) || 0),
                profit: (parseFloat(invoiceData.amount_to_collect) || 0) * 0.2,
                status: invoiceData.status,
                status_cobrado: invoiceData.status === 'vencido' || invoiceData.status === 'pago',
                status_pago: invoiceData.status === 'pago',
                status_recebido: true,
            };

            if (editingInvoice) {
                await api.patch(`/invoices/${editingInvoice.id}`, data);
                alert("Fatura atualizada com sucesso!");
            } else {
                const response = await api.post('/invoices/', data);
                const newInvoiceId = response.data.id;
                if (selectedPdfFile) {
                    const formData = new FormData();
                    formData.append('file', selectedPdfFile);
                    try {
                        await api.post(`/invoices/${newInvoiceId}/upload-equatorial`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                    } catch (uploadError) {
                        console.error("Erro ao fazer upload do PDF", uploadError);
                        alert("Fatura criada, mas houve erro ao fazer upload do PDF.");
                    }
                }
                alert("Fatura gerada com sucesso!");
            }
            setModalOpen(false);
            setEditingInvoice(null);
            setSelectedPdfFile(null);
            if (statementModalOpen) {
                refreshStatement();
            } else {
                fetchClients();
            }
        } catch (error) {
            console.error("Erro ao gerar fatura", error);
            alert(error.response?.data?.detail || "Erro ao gerar fatura.");
        }
    };

    const handleOpenAdjustModal = (client) => {
        setSelectedClient(client);
        setAdjustmentData({
            operation: 'creditar',
            amount: '',
            description: ''
        });
        setAdjustModalOpen(true);
    };

    const handleAdjustCredits = async () => {
        if (!selectedClient) return;
        const amount = parseFloat(adjustmentData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert("Por favor, insira um valor válido.");
            return;
        }
        try {
            const finalAmount = adjustmentData.operation === 'debitar' ? -amount : amount;
            await api.post(`/clients/${selectedClient.id}/adjust-credits/`, {
                amount: finalAmount,
                description: adjustmentData.description
            });
            alert("Crédito ajustado com sucesso!");
            setAdjustModalOpen(false);
            fetchClients();
        } catch (error) {
            console.error("Erro ao ajustar créditos", error);
            alert("Erro ao ajustar créditos.");
        }
    };

    useEffect(() => {
        if (!modalOpen) return;
        const consumption = parseFloat(invoiceData.consumption_kwh) || 0;
        const originalKwh = parseFloat(invoiceData.kwh_value_original) || 0;
        const discountPercent = parseFloat(invoiceData.discount_percent) || 0;
        const fixed = parseFloat(invoiceData.fixed_cost) || 0;

        const injectionKwh = originalKwh * (1 - discountPercent / 100);
        const currentlyAvailable = Number(selectedClient?.current_credits || 0);
        const alreadyUsedByThis = editingInvoice ? Number(editingInvoice.credited_balance || 0) : 0;
        const totalPossibleCredit = currentlyAvailable + alreadyUsedByThis;
        const autoCredit = Math.min(consumption, totalPossibleCredit);
        const valWithoutDiscount = (consumption * originalKwh) + fixed;
        const valFaturado = consumption * injectionKwh;
        const valToCollect = valFaturado + fixed;

        setInvoiceData(prev => ({
            ...prev,
            kwh_value_injection: Number(injectionKwh || 0).toFixed(4),
            credited_balance: Number(autoCredit || 0).toFixed(2),
            value_without_discount: Number(valWithoutDiscount || 0).toFixed(2),
            total_invoiced: Number(valFaturado || 0).toFixed(2),
            amount_to_collect: Number(valToCollect || 0).toFixed(2)
        }));
    }, [invoiceData.consumption_kwh, invoiceData.kwh_value_original, invoiceData.discount_percent, invoiceData.fixed_cost, selectedClient, editingInvoice, modalOpen]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-yellow-600" />
                    Sistema de Créditos
                </h2>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-sm">
                    Gestão de Saldo de Energia
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1e293b] text-white">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Cliente</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Crédito Disponível (kWh)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="3" className="p-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Carregando dados...</td></tr>
                        ) : clients.length > 0 ? (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-black text-[#1e293b] text-sm uppercase tracking-tight">{client.name || 'N/A'}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">UC: {client.uc_number || 'N/A'}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl font-black text-xs inline-block min-w-[100px] ${Number(client.current_credits || 0) > 0 ? 'bg-green-50 text-green-600 shadow-sm shadow-green-100' : 'bg-red-50 text-red-600 shadow-sm shadow-red-100'}`}>
                                            {Number(client.current_credits || 0).toFixed(2)} kWh
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleOpenModal(client)} className="px-6 py-2 bg-yellow-400 hover:bg-black hover:text-white text-[#1e293b] font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95">Faturar</button>
                                            <button onClick={() => handleOpenAdjustModal(client)} className="px-5 py-2 bg-[#f8fafc] hover:bg-blue-600 hover:text-white text-[#1e293b] font-black rounded-xl text-[10px] uppercase tracking-widest transition-all border border-gray-100 shadow-sm flex items-center gap-2 active:scale-95">
                                                <Edit2 size={14} /> Editar
                                            </button>
                                            <button onClick={() => handleOpenStatement(client)} className="px-5 py-2 bg-[#f8fafc] hover:bg-[#1e293b] hover:text-white text-[#1e293b] font-black rounded-xl text-[10px] uppercase tracking-widest transition-all border border-gray-100 shadow-sm flex items-center gap-2 active:scale-95">
                                                <History size={14} /> Extrato
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="p-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum cliente encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-yellow-500 p-6 text-black">
                            <h3 className="text-xl font-black uppercase tracking-tight">{editingInvoice ? "Editar Fatura" : "Gerar Fatura"}</h3>
                            <p className="text-black/60 font-bold text-xs uppercase">Cliente: {selectedClient.name}</p>
                        </div>
                        <div className="p-8 grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mês de Referência</label>
                                <input type="month" value={invoiceData.month} onChange={(e) => setInvoiceData({ ...invoiceData, month: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Consumo (kWh)</label>
                                <input type="number" value={invoiceData.consumption_kwh} onChange={(e) => setInvoiceData({ ...invoiceData, consumption_kwh: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Dedução de Crédito (kWh)</label>
                                <input type="number" value={invoiceData.credited_balance} onChange={(e) => setInvoiceData({ ...invoiceData, credited_balance: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-green-600" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">V. kWh Original (R$)</label>
                                <input type="number" step="0.01" value={invoiceData.kwh_value_original} onChange={(e) => setInvoiceData({ ...invoiceData, kwh_value_original: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">V. kWh Injeção (R$)</label>
                                <input type="number" step="0.0001" value={invoiceData.kwh_value_injection} readOnly className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-xl outline-none font-bold text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Desconto (%)</label>
                                <input type="number" value={invoiceData.discount_percent} onChange={(e) => setInvoiceData({ ...invoiceData, discount_percent: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor Fixo (R$)</label>
                                <input type="number" value={invoiceData.fixed_cost} onChange={(e) => setInvoiceData({ ...invoiceData, fixed_cost: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor Sem Desconto (R$)</label>
                                <input type="number" value={invoiceData.value_without_discount} readOnly className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-xl outline-none font-bold text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor Faturado (R$)</label>
                                <input type="number" value={invoiceData.total_invoiced} onChange={(e) => setInvoiceData({ ...invoiceData, total_invoiced: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold" />
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <label className="block text-[10px] font-black text-blue-400 uppercase mb-1">Valor A Cobrar (R$)</label>
                                <input type="number" value={invoiceData.amount_to_collect} onChange={(e) => setInvoiceData({ ...invoiceData, amount_to_collect: e.target.value })} className="w-full bg-transparent text-xl font-black text-blue-600 outline-none" />
                            </div>
                            <div className="col-span-2 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <label className="block text-[10px] font-black text-blue-400 uppercase mb-3">Fatura Equatorial (PDF)</label>
                                <input type="file" accept=".pdf" onChange={(e) => setSelectedPdfFile(e.target.files[0])} className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer" />
                                {selectedPdfFile && <p className="mt-2 text-xs font-bold text-blue-600">Arquivo selecionado: {selectedPdfFile.name}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status do Pagamento</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['aberto', 'vencido', 'pago'].map((s) => (
                                        <button key={s} onClick={() => setInvoiceData({ ...invoiceData, status: s })} className={`py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${invoiceData.status === s ? (s === 'pago' ? 'bg-green-500 text-white shadow-lg' : s === 'vencido' ? 'bg-red-500 text-white shadow-lg' : 'bg-blue-500 text-white shadow-lg') : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleCreateInvoice} className="col-span-2 mt-4 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl">Confirmar e Gerar Fatura</button>
                            <button onClick={() => setModalOpen(false)} className="col-span-2 py-2 text-gray-400 font-bold text-xs uppercase hover:text-gray-600">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {statementModalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#1e293b] p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Histórico de Créditos</h3>
                                <p className="text-blue-400 font-bold text-xs mt-1 uppercase tracking-widest">Cliente: {selectedClient.name}</p>
                            </div>
                            <button onClick={() => setStatementModalOpen(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all text-white"><Minus size={24} /></button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mês</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Crédito (kWh)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Consumo Real</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {statementData.length > 0 ? (
                                            statementData.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-[#1e293b]">{item.date || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${item.type === 'geracao' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{item.type === 'geracao' ? 'Geração' : 'Faturamento'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-bold ${Number(item.kwh || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(item.kwh || 0) > 0 ? `+${Number(item.kwh || 0).toFixed(2)}` : Number(item.kwh || 0).toFixed(2)} kWh</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-500 font-medium whitespace-nowrap">{item.type === 'faturamento' ? `${Number(item.item?.consumption_kwh || 0).toFixed(2)} kWh` : '-'}</td>
                                                    <td className="px-6 py-4 text-center"><span className="text-[8px] font-black uppercase text-blue-500">Processado</span></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {item.type === 'faturamento' && (
                                                                <>
                                                                    <button onClick={() => handleDeleteInvoice(item.invoice_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                                    <button onClick={() => handleEditInvoice(item.item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                                    <button onClick={() => handleCloneInvoice(item.item)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><Copy size={16} /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium italic">Nenhum histórico encontrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setStatementModalOpen(false)} className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95">FECHAR EXTRATO</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {adjustModalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">
                        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
                            <h3 className="text-gray-600 font-medium text-sm">Gerenciar Crédito {selectedClient.name}</h3>
                            <button onClick={() => setAdjustModalOpen(false)} className="text-gray-300 hover:text-gray-600 text-xl">&times;</button>
                        </div>
                        <div className="p-8">
                            <h2 className="text-[2rem] font-black text-[#334155] mb-8 tracking-tighter">Gerenciamento de Crédito</h2>
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-700 uppercase mb-2">$ Saldo Atual</label>
                                    <input type="text" value={Number(selectedClient.current_credits || 0).toFixed(2)} readOnly className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-600 outline-none" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-700 uppercase mb-2"><History size={14} /> Operação:</label>
                                    <select value={adjustmentData.operation} onChange={(e) => setAdjustmentData({ ...adjustmentData, operation: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500/20">
                                        <option value="creditar">Creditar</option>
                                        <option value="debitar">Debitar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-700 uppercase mb-2"><CreditCard size={14} /> Valor</label>
                                    <input type="number" value={adjustmentData.amount} onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-green-500/20" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-700 uppercase mb-2"><History size={14} /> Descrição</label>
                                <textarea value={adjustmentData.description} onChange={(e) => setAdjustmentData({ ...adjustmentData, description: e.target.value })} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 outline-none focus:ring-2 focus:ring-green-500/20 min-h-[120px] resize-none" placeholder="Motivo da operação" />
                            </div>
                            <div className="flex justify-center">
                                <button onClick={handleAdjustCredits} className="bg-[#00a35c] text-white px-10 py-4 rounded-lg font-bold text-base flex items-center gap-4 hover:bg-[#008f51] transition-all shadow-lg active:scale-95">
                                    Salvar alterações
                                    <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded-sm"><Plus size={14} className="rotate-45" /></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditSystem;
