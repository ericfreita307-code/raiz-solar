import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductionForm = () => {
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [month, setMonth] = useState('');
    const [kwh, setKwh] = useState('');

    useEffect(() => {
        api.get('/plants/').then(response => setPlants(response.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlant) return alert('Selecione uma usina');

        try {
            await api.post(`/plants/${selectedPlant}/production/`, {
                month: month,
                kwh_generated: parseFloat(kwh)
            });
            alert('Produção registrada com sucesso!');
            setMonth('');
            setKwh('');
        } catch (error) {
            console.error("Error registering production", error);
            alert('Erro ao registrar produção.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 mb-8 font-sans transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col mb-8">
                <h3 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Registrar Produção</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Geração de saldo mensal por usina</p>
                <div className="h-1 w-12 bg-blue-500 mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Selecione a Usina</label>
                    <div className="relative">
                        <select
                            value={selectedPlant}
                            onChange={(e) => setSelectedPlant(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-[#1e293b] font-bold appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Selecione a Usina</option>
                            {plants.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.capacity_kw}kW)</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mês de Geração</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-[#1e293b] font-bold"
                        required
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">kWh Gerado Total</label>
                    <input
                        type="number"
                        placeholder="Ex: 1200.50"
                        value={kwh}
                        onChange={(e) => setKwh(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-[#1e293b] font-bold placeholder:text-gray-300"
                        step="0.01"
                        required
                    />
                </div>
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    type="submit"
                    className="bg-[#1e293b] text-white font-black px-10 py-5 rounded-2xl hover:bg-black hover:scale-105 transition-all shadow-[0_10px_25px_rgba(30,41,59,0.2)] active:scale-95 text-xs uppercase tracking-[0.2em] w-full md:w-auto"
                >
                    Salvar Produção
                </button>
            </div>
        </form>
    );
};

export default ProductionForm;
