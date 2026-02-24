import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
    Factory, Plus, Trash2, Save, Percent, MapPin,
    Hash, DollarSign, Search, Check, X, Edit2,
    Settings, Zap, ChevronDown, Calendar, History,
    AlertCircle, FileText, Download, Filter
} from 'lucide-react';

const PlantsPage = () => {
    const [plants, setPlants] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDistModal, setShowDistModal] = useState(false);
    const [showProdModal, setShowProdModal] = useState(false);
    const [activePlant, setActivePlant] = useState(null);
    const [distributions, setDistributions] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [prodHistory, setProdHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingProdId, setEditingProdId] = useState(null);
    const [openProdMenuId, setOpenProdMenuId] = useState(null);
    const menuRef = useRef(null);
    const prodMenuRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        uc_number: '',
        capacity_kw: '',
        acquisition_cost: '',
        maintenance_cost: '',
        is_active: true,
        pix_key: ''
    });

    const [prodData, setProdData] = useState({
        kwh_generated: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
            if (prodMenuRef.current && !prodMenuRef.current.contains(event.target)) {
                setOpenProdMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plantsRes, clientsRes] = await Promise.all([
                api.get('/plants/'),
                api.get('/clients/')
            ]);
            setPlants(plantsRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdatePlant = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                capacity_kw: parseFloat(formData.capacity_kw),
                acquisition_cost: parseFloat(formData.acquisition_cost || 0),
                maintenance_cost: parseFloat(formData.maintenance_cost || 0)
            };

            if (activePlant) {
                await api.patch(`/plants/${activePlant.id}`, data);
            } else {
                await api.post('/plants/', data);
            }

            setShowModal(false);
            resetForms();
            fetchData();
            alert('Operação realizada com sucesso!');
        } catch (error) {
            alert('Erro ao processar usina. Verifique os dados.');
        }
    };

    const togglePlantStatus = async (plant) => {
        try {
            await api.patch(`/plants/${plant.id}`, { is_active: !plant.is_active });
            fetchData();
        } catch (error) {
            console.error("Error toggling status", error);
        }
    };

    const handleRegisterProduction = async (e) => {
        e.preventDefault();
        try {
            const monthStr = `${prodData.year}-${String(prodData.month).padStart(2, '0')}`;
            if (editingProdId) {
                await api.patch(`/productions/${editingProdId}`, {
                    kwh_generated: parseFloat(prodData.kwh_generated),
                    month: monthStr
                });
                setEditingProdId(null);
                alert('Produção atualizada!');
            } else {
                await api.post(`/plants/${activePlant.id}/production/`, {
                    kwh_generated: parseFloat(prodData.kwh_generated),
                    month: monthStr
                });
                alert('Produção registrada e créditos distribuídos!');
            }
            setProdData({ ...prodData, kwh_generated: '' });
            fetchProductionHistory(activePlant.id);
            fetchData();
        } catch (error) {
            alert('Erro ao processar produção.');
        }
    };

    const handleDeleteProduction = async (prodId) => {
        if (!window.confirm("Deseja realmente excluir este lançamento? Os créditos distribuídos serão estornados.")) return;
        try {
            await api.delete(`/productions/${prodId}`);
            fetchProductionHistory(activePlant.id);
            fetchData();
            alert("Lançamento excluído com sucesso!");
        } catch (error) {
            console.error("Delete error", error);
            alert("Erro ao excluir lançamento.");
        }
    };

    const handleEditProduction = (prod) => {
        setEditingProdId(prod.id);
        const [year, month] = prod.month.split('-');
        setProdData({
            kwh_generated: prod.kwh_generated.toString(),
            month: parseInt(month),
            year: parseInt(year)
        });
        setOpenProdMenuId(null);
    };

    const fetchProductionHistory = async (plantId) => {
        setLoadingHistory(true);
        try {
            // This endpoint would need to be checked/added in backend
            const res = await api.get(`/plants/${plantId}/productions/`);
            setProdHistory(res.data);
        } catch (error) {
            console.error("Error fetching history", error);
            setProdHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const resetForms = () => {
        setFormData({ name: '', address: '', uc_number: '', capacity_kw: '', acquisition_cost: '', maintenance_cost: '', is_active: true, pix_key: '' });
        setActivePlant(null);
    };

    const openDistModal = async (plant) => {
        setActivePlant(plant);
        setOpenMenuId(null);
        try {
            const res = await api.get(`/plants/${plant.id}/distributions/`);
            setDistributions(res.data);
            setShowDistModal(true);
        } catch (error) {
            console.error("Error loading distributions", error);
        }
    };

    const openProdModal = (plant) => {
        setActivePlant(plant);
        setOpenMenuId(null);
        setEditingProdId(null);
        setProdData({
            kwh_generated: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        fetchProductionHistory(plant.id);
        setShowProdModal(true);
    };

    const saveDistributions = async () => {
        const total = distributions.reduce((sum, d) => sum + (d.percentage || 0), 0);
        if (total > 100.1) return alert(`A soma das porcentagens (${total.toFixed(2)}%) não pode exceder 100%`);

        try {
            const payload = distributions
                .filter(d => d.client_id && d.percentage > 0)
                .map(d => ({
                    client_id: parseInt(d.client_id),
                    percentage: parseFloat(d.percentage),
                    plant_id: activePlant.id
                }));

            await api.post(`/plants/${activePlant.id}/distributions/`, payload);
            setShowDistModal(false);
            alert('Configuração de rateio salva com sucesso!');
        } catch (error) {
            console.error("Save error:", error.response?.data || error.message);
            alert('Erro ao salvar rateio.');
        }
    };

    const filteredPlants = plants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uc_number.includes(searchTerm)
    );

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Lista de Usinas</h1>

                </div>
                <button
                    onClick={() => { resetForms(); setShowModal(true); }}
                    className="bg-[#facc15] hover:bg-[#eab308] text-[#1e293b] px-8 py-3 rounded-xl font-black shadow-[0_10px_20px_rgba(250,204,21,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-wide text-sm"
                >
                    <Plus size={20} className="stroke-[3]" />
                    Nova Usina
                </button>
            </div>

            {/* List and Search */}
            <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[500px]">
                <div className="p-8 flex flex-wrap justify-between items-center gap-4 border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-black uppercase tracking-[0.2em] font-montserrat">
                        Mostra
                        <select className="border-2 border-gray-100 rounded-xl px-3 py-1.5 bg-white text-gray-800 outline-none focus:border-yellow-400 transition-all font-black text-sm">
                            <option>10</option>
                            <option>50</option>
                        </select>
                        registros
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] font-montserrat">Pesquisa:</span>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-8 focus:ring-yellow-50 focus:border-yellow-400 outline-none transition-all w-80 font-bold text-gray-700 placeholder:text-gray-200"
                                placeholder="Nome ou UC..."
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#b45309] text-white text-[10px] tracking-[0.25em] font-montserrat">
                                <th className="p-6 border-r border-white/10 font-black uppercase">Usina</th>
                                <th className="p-6 border-r border-white/10 font-black uppercase">Endereço</th>
                                <th className="p-6 border-r border-white/10 font-black uppercase w-56">UC instalação</th>
                                <th className="p-6 border-r border-white/10 font-black uppercase w-32 text-center">Status</th>
                                <th className="p-6 font-black uppercase w-36 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-32 text-center text-gray-300 font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Sincronizando dados...</td></tr>
                            ) : filteredPlants.length > 0 ? (
                                filteredPlants.map((plant, idx) => (
                                    <tr key={plant.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-yellow-50/40 transition-colors group relative`}>
                                        <td className="p-6 font-black text-[#1e293b] border-r border-gray-50 text-lg">{plant.name}</td>
                                        <td className="p-6 text-sm text-gray-500 font-bold border-r border-gray-50">{plant.address}</td>
                                        <td className="p-6 text-base font-black text-gray-300 border-r border-gray-50 tracking-tighter font-montserrat uppercase">{plant.uc_number}</td>
                                        <td className="p-6 border-r border-gray-50 text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => togglePlantStatus(plant)}
                                                    className={`p-2 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 ${plant.is_active !== false ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}
                                                >
                                                    {plant.is_active !== false ? <Check size={20} className="stroke-[3]" /> : <X size={20} className="stroke-[3]" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center relative overflow-visible">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === plant.id ? null : plant.id)}
                                                    className={`p-3 rounded-2xl transition-all shadow-sm ${openMenuId === plant.id ? 'bg-[#1e293b] text-yellow-400 rotate-90' : 'bg-gray-100 text-gray-300 hover:bg-yellow-100 hover:text-yellow-600'}`}
                                                >
                                                    <Settings size={28} className="stroke-[2.5]" />
                                                </button>

                                                {openMenuId === plant.id && (
                                                    <div
                                                        ref={menuRef}
                                                        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#1e293b] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100] w-56 overflow-hidden border border-white/5 animate-in slide-in-from-right-4 duration-300"
                                                    >
                                                        <button
                                                            onClick={() => openDistModal(plant)}
                                                            className="w-full px-7 py-5 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors border-b border-white/5 group"
                                                        >
                                                            <div className="bg-yellow-400 group-hover:bg-yellow-300 p-1.5 rounded-lg text-[#1e293b]"><Percent size={18} className="stroke-[3]" /></div>
                                                            <span className="font-black text-xs uppercase tracking-widest">Rateio</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { setActivePlant(plant); setFormData(plant); setOpenMenuId(null); setShowModal(true); }}
                                                            className="w-full px-7 py-5 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors border-b border-white/5 group"
                                                        >
                                                            <div className="bg-blue-500 group-hover:bg-blue-400 p-1.5 rounded-lg text-white"><Edit2 size={18} className="stroke-[3]" /></div>
                                                            <span className="font-black text-xs uppercase tracking-widest">Edição</span>
                                                        </button>
                                                        <button
                                                            onClick={() => openProdModal(plant)}
                                                            className="w-full px-7 py-5 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors group"
                                                        >
                                                            <div className="bg-teal-500 group-hover:bg-teal-400 p-1.5 rounded-lg text-white"><Zap size={18} className="stroke-[3]" /></div>
                                                            <span className="font-black text-xs uppercase tracking-widest">Produção</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-32 text-center text-gray-200 font-black uppercase tracking-[0.4em] text-sm">Nenhuma usina encontrada</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-gray-50/20 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] font-montserrat border-t border-gray-50">
                    <div>Mostrando página 1 de 1</div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 border-2 border-gray-100 rounded-xl disabled:opacity-30 transition-all font-black" disabled>Anterior</button>
                        <button className="px-6 py-2.5 bg-[#1e293b] text-white rounded-xl shadow-xl font-black">1</button>
                        <button className="px-5 py-2.5 border-2 border-gray-100 rounded-xl disabled:opacity-30 transition-all font-black" disabled>Próxima</button>
                    </div>
                </div>
            </div>

            {/* Modal: Nova/Editar Usina */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-[0_50px_120px_rgba(0,0,0,0.6)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-[#facc15] p-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-4xl font-black text-[#1e293b] flex items-center gap-5 tracking-tighter">
                                    <div className="bg-[#1e293b] p-3 rounded-[1.25rem] text-yellow-400 shadow-2xl">
                                        <Factory size={36} />
                                    </div>
                                    {activePlant ? 'Editar Usina' : 'Nova Planta'}
                                </h2>
                                <p className="text-[#854d0e] font-black text-xs mt-3 uppercase tracking-[0.25em] opacity-70 font-montserrat">Dados técnicos da unidade de geração.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-[#1e293b] text-white p-3 rounded-[1.5rem] hover:bg-black transition-all shadow-xl">
                                <X size={32} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdatePlant} className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat">Nome da Usina</label>
                                    <input
                                        required
                                        className="w-full border-b-4 border-gray-100 focus:border-yellow-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b] placeholder:text-gray-100"
                                        placeholder="Ex: Usina Solar Central"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat">Nº da UC (Instalação)</label>
                                    <input
                                        required
                                        className="w-full border-b-4 border-gray-100 focus:border-yellow-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b] placeholder:text-gray-100"
                                        placeholder="Ex: 10203040"
                                        value={formData.uc_number}
                                        onChange={e => setFormData({ ...formData, uc_number: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat">Endereço Completo</label>
                                    <input
                                        required
                                        className="w-full border-b-4 border-gray-100 focus:border-yellow-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b] placeholder:text-gray-100"
                                        placeholder="Rua, Número, Bairro, Cidade..."
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat text-blue-600">Chave Pix para Recebimento</label>
                                    <input
                                        className="w-full border-b-4 border-gray-100 focus:border-blue-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b] placeholder:text-gray-100 placeholder:font-normal"
                                        placeholder="CPF, CNPJ, E-mail ou Chave Aleatória..."
                                        value={formData.pix_key || ''}
                                        onChange={e => setFormData({ ...formData, pix_key: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat">Capacidade (kW)</label>
                                    <input
                                        required type="number" step="0.1"
                                        className="w-full border-b-4 border-gray-100 focus:border-yellow-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b]"
                                        value={formData.capacity_kw}
                                        onChange={e => setFormData({ ...formData, capacity_kw: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-yellow-600 transition-colors font-montserrat">Custo Aquisição (R$)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full border-b-4 border-gray-100 focus:border-yellow-400 py-4 outline-none transition-all font-black text-2xl text-[#1e293b]"
                                        value={formData.acquisition_cost}
                                        onChange={e => setFormData({ ...formData, acquisition_cost: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-8 pt-12 border-t border-gray-50">
                                <button type="button" onClick={() => setShowModal(false)} className="text-gray-300 font-black hover:text-[#1e293b] transition-all text-sm uppercase tracking-[0.3em] font-montserrat">Cancelar</button>
                                <button type="submit" className="bg-[#1e293b] text-white px-16 py-6 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(30,41,59,0.4)] hover:bg-black hover:scale-105 transition-all active:scale-95 text-xl tracking-[0.15em] uppercase">
                                    {activePlant ? 'Salvar Edição' : 'Salvar Usina'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Produção Especializada (Histórico + Lançamento) */}
            {showProdModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-2xl p-4 animate-in fade-in transition-all">
                    <div className="bg-white rounded-[3rem] shadow-[0_60px_150px_rgba(0,0,0,0.7)] w-full max-w-4xl overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom-12 duration-700 h-[85vh]">
                        {/* Header Premium (Reference Style) */}
                        <div className="bg-[#b45309] p-10 flex justify-between items-center text-white relative">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={200} /></div>
                            <div className="z-10">
                                <h2 className="text-4xl font-black tracking-tighter flex items-center gap-6">
                                    <div className="bg-[#ffffff20] p-4 rounded-[1.5rem] backdrop-blur-md shadow-2xl">
                                        <Zap size={40} className="text-yellow-300 fill-yellow-300" />
                                    </div>
                                    Histórico de Produção
                                </h2>
                                <p className="text-[#fcd34d] font-black text-sm mt-3 uppercase tracking-[0.4em] opacity-90 font-montserrat">{activePlant?.name}</p>
                            </div>
                            <button onClick={() => setShowProdModal(false)} className="bg-white/10 text-white p-4 rounded-[1.5rem] hover:bg-white/20 transition-all z-10 shadow-2xl backdrop-blur-md">
                                <X size={36} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden bg-white">
                            {/* Toolbar: Filtros e Lançamento */}
                            <div className="p-10 border-b border-gray-50 bg-[#fffbeb]/30 flex flex-wrap items-end justify-between gap-8">
                                <div className="flex gap-6 items-end flex-1">
                                    <div className="space-y-3 flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] font-montserrat">Mês / Ano</label>
                                        <div className="flex gap-4">
                                            <select
                                                className="flex-1 bg-white border-4 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#b45309] font-black text-[#1e293b] transition-all text-sm appearance-none cursor-pointer"
                                                value={prodData.month}
                                                onChange={e => setProdData({ ...prodData, month: parseInt(e.target.value) })}
                                            >
                                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                            </select>
                                            <select
                                                className="w-36 bg-white border-4 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#b45309] font-black text-[#1e293b] transition-all text-sm appearance-none cursor-pointer"
                                                value={prodData.year}
                                                onChange={e => setProdData({ ...prodData, year: parseInt(e.target.value) })}
                                            >
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] font-montserrat">Geração (kWh)</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full bg-white border-4 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-teal-500 font-black text-[#1e293b] transition-all text-xl"
                                            placeholder="0,00"
                                            value={prodData.kwh_generated}
                                            onChange={e => setProdData({ ...prodData, kwh_generated: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleRegisterProduction}
                                            className={`${editingProdId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1e293b] hover:bg-black'} text-white px-10 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest text-sm`}
                                        >
                                            {editingProdId ? 'Salvar Edição' : 'Lançar'}
                                        </button>
                                        {editingProdId && (
                                            <button
                                                onClick={() => { setEditingProdId(null); setProdData({ ...prodData, kwh_generated: '' }); }}
                                                className="text-gray-400 font-bold text-[10px] uppercase hover:text-red-500 transition-colors"
                                            >
                                                Cancelar Edição
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="p-4 border-4 border-gray-50 rounded-2xl text-gray-300 hover:text-gray-800 transition-all bg-white"><Download size={22} /></button>
                                    <button className="p-4 border-4 border-gray-50 rounded-2xl text-gray-300 hover:text-gray-800 transition-all bg-white"><Filter size={22} /></button>
                                </div>
                            </div>

                            {/* History Table (Reference Style) */}
                            <div className="flex-1 overflow-auto p-10">
                                <div className="bg-white rounded-[2rem] border-4 border-gray-50 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] font-montserrat">
                                                <th className="p-6 border-r border-gray-100">Mês / Ano</th>
                                                <th className="p-6 border-r border-gray-100">Produção (kWh)</th>
                                                <th className="p-6 border-r border-gray-100">Data Registro</th>
                                                <th className="p-6 border-r border-gray-100 text-center">Status</th>
                                                <th className="p-6 text-center font-black uppercase w-20">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loadingHistory ? (
                                                <tr><td colSpan="5" className="p-20 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest text-xs">Acessando registros...</td></tr>
                                            ) : prodHistory.length > 0 ? (
                                                prodHistory.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group relative">
                                                        <td className="p-6 font-black text-[#1e293b] border-r border-gray-50 uppercase tracking-tighter">
                                                            {months[parseInt(row.month.split('-')[1]) - 1]} {row.month.split('-')[0]}
                                                        </td>
                                                        <td className="p-6 font-black text-teal-600 border-r border-gray-50 text-xl font-montserrat text-right">
                                                            {parseFloat(row.kwh_generated).toLocaleString('pt-BR')} <span className="text-xs text-gray-300 ml-1">kWh</span>
                                                        </td>
                                                        <td className="p-6 text-gray-400 font-bold border-r border-gray-50 text-xs font-montserrat">
                                                            {new Date(row.created_at || row.reading_date).toLocaleDateString('pt-BR')}
                                                            <span className="block opacity-50 text-[10px]">{new Date(row.created_at || row.reading_date).toLocaleTimeString('pt-BR')}</span>
                                                        </td>
                                                        <td className="p-6 text-center border-r border-gray-50">
                                                            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-teal-100 shadow-sm">
                                                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                                                                Distribuído
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-center overflow-visible relative">
                                                            <button
                                                                onClick={() => setOpenProdMenuId(openProdMenuId === row.id ? null : row.id)}
                                                                className={`p-2 rounded-xl transition-all ${openProdMenuId === row.id ? 'bg-[#1e293b] text-yellow-400 rotate-90 shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-yellow-100'}`}
                                                            >
                                                                <Settings size={20} className="stroke-[2.5]" />
                                                            </button>

                                                            {openProdMenuId === row.id && (
                                                                <div
                                                                    ref={prodMenuRef}
                                                                    className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#1e293b] rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[300] w-48 overflow-hidden border border-white/5 animate-in slide-in-from-right-4 duration-300"
                                                                >
                                                                    <button
                                                                        onClick={() => handleEditProduction(row)}
                                                                        className="w-full px-6 py-4 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors border-b border-white/5 group"
                                                                    >
                                                                        <div className="bg-blue-500 group-hover:bg-blue-400 p-1.5 rounded-lg text-white"><Edit2 size={14} className="stroke-[3]" /></div>
                                                                        <span className="font-black text-[10px] uppercase tracking-widest">Editar</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteProduction(row.id)}
                                                                        className="w-full px-6 py-4 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors group"
                                                                    >
                                                                        <div className="bg-red-500 group-hover:bg-red-400 p-1.5 rounded-lg text-white"><Trash2 size={14} className="stroke-[3]" /></div>
                                                                        <span className="font-black text-[10px] uppercase tracking-widest">Excluir</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="p-32 text-center text-gray-100 font-black uppercase tracking-[0.5em] text-xs">Sem registros antigos</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Premium */}
                        <div className="p-10 bg-white border-t border-gray-50 flex justify-between items-center rounded-t-[4rem] shadow-[0_-40px_100px_rgba(0,0,0,0.05)]">
                            <div className="flex gap-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-montserrat mb-1">Média Mensal</span>
                                    <span className="text-3xl font-black text-[#1e293b] tracking-tighter">
                                        {prodHistory.length > 0
                                            ? (prodHistory.reduce((s, p) => s + p.kwh_generated, 0) / prodHistory.length).toFixed(0)
                                            : '0'}
                                        <span className="text-sm ml-2 opacity-30">kWh</span>
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-montserrat mb-1">Total Acumulado</span>
                                    <span className="text-3xl font-black text-[#b45309] tracking-tighter">
                                        {prodHistory.reduce((s, p) => s + p.kwh_generated, 0).toLocaleString()}
                                        <span className="text-sm ml-2 opacity-30">kWh</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProdModal(false)}
                                className="bg-[#1e293b] text-white px-16 py-6 rounded-[2rem] font-black shadow-[0_20px_40px_rgba(30,41,59,0.3)] hover:bg-black transition-all active:scale-95 text-xl tracking-[0.2em] uppercase font-montserrat"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Configurar Rateio */}
            {showDistModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl p-4 transition-all">
                    <div className="bg-[#1e293b] text-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.7)] w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-500">
                        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/5">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                                    <div className="bg-yellow-400 p-2 rounded-xl text-[#1e293b] shadow-xl">
                                        <Percent size={20} />
                                    </div>
                                    Rateio %
                                </h2>
                                <p className="text-[10px] text-yellow-400 mt-1 uppercase tracking-[0.3em] font-black opacity-80 font-montserrat">{activePlant?.name}</p>
                            </div>
                            <button onClick={() => setShowDistModal(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[45vh] overflow-y-auto custom-scrollbar">
                            {distributions.map((dist, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-4 shadow-xl flex items-center gap-4 border border-gray-50 relative group transition-all hover:scale-[1.01]">
                                    <div className="flex-1">
                                        <label className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1 block font-montserrat">Cliente Alvo</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-transparent outline-none font-bold text-[#1e293b] text-sm cursor-pointer pr-6 border-b border-gray-100 focus:border-yellow-400 transition-all py-1"
                                                value={dist.client_id}
                                                onChange={e => {
                                                    const newDists = [...distributions];
                                                    newDists[idx].client_id = parseInt(e.target.value);
                                                    setDistributions(newDists);
                                                }}
                                            >
                                                <option value="" className="text-gray-400">Selecionar...</option>
                                                {clients.filter(c => c.is_active === true || c.is_active === 1).map(c => (
                                                    <option key={c.id} value={c.id} className="text-[#1e293b] font-bold">
                                                        {c.name} ({c.uc_number})
                                                    </option>
                                                ))}
                                                {clients.filter(c => c.is_active === true || c.is_active === 1).length === 0 && (
                                                    <option disabled className="text-gray-400 italic text-[10px]">Nenhum cliente ativo vinculado</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-24 text-right flex flex-col items-end">
                                        <label className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 block font-montserrat">Percentual</label>
                                        <div className="flex items-center gap-1 border-b-2 border-gray-50 focus-within:border-yellow-400 transition-all pb-1">
                                            <input
                                                type="number" step="0.01" max="100"
                                                className="w-full text-right bg-transparent outline-none font-black text-xl text-[#1e293b] tracking-tighter"
                                                value={dist.percentage}
                                                onChange={e => {
                                                    const newDists = [...distributions];
                                                    newDists[idx].percentage = parseFloat(e.target.value || 0);
                                                    setDistributions(newDists);
                                                }}
                                            />
                                            <span className="text-gray-200 font-black text-sm">%</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDistributions(distributions.filter((_, i) => i !== idx))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => setDistributions([...distributions, { client_id: '', percentage: 0 }])}
                                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/30 hover:border-yellow-400 hover:text-yellow-400 font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white/0 hover:bg-white/5 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span className="uppercase tracking-[0.2em] text-[10px]">Vincular Cliente</span>
                            </button>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-50 flex justify-between items-center rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] mt-auto">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-[.2em] mb-1 font-montserrat leading-none">Soma Total</span>
                                <span className={`text-2xl font-black tracking-tighter leading-none ${distributions.reduce((s, d) => s + (d.percentage || 0), 0) > 100.1 ? 'text-red-600' : 'text-[#1e293b]'}`}>
                                    {distributions.reduce((s, d) => s + (d.percentage || 0), 0).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowDistModal(false)}
                                    className="px-4 py-2 text-gray-400 font-bold hover:bg-gray-100 rounded-lg transition-all text-[9px] uppercase tracking-widest font-montserrat"
                                >
                                    Sair
                                </button>
                                <button
                                    onClick={saveDistributions}
                                    className="bg-yellow-400 text-[#1e293b] px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm hover:scale-105 uppercase tracking-wide"
                                >
                                    <Save size={16} /> Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default PlantsPage;
