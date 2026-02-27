import React, { useState } from 'react';
import api from '../services/api';
import { Factory } from 'lucide-react';

const PlantForm = ({ onPlantAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity_kw: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/plants/', {
                ...formData,
                capacity_kw: parseFloat(formData.capacity_kw)
            });
            onPlantAdded(response.data);
            setFormData({ name: '', address: '', capacity_kw: '' });
            alert('Planta de Geração cadastrada com sucesso!');
        } catch (error) {
            console.error("Error adding plant", error);
            alert('Erro ao cadastrar planta.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                <Factory size={20} className="text-blue-600" />
                Nova Planta de Geração (Usina)
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Usina</label>
                    <input
                        type="text"
                        placeholder="Ex: Usina Solar Central"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input
                        type="text"
                        placeholder="Ex: Fazenda Solar Sul"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (kW)</label>
                    <input
                        type="number"
                        placeholder="Ex: 500"
                        value={formData.capacity_kw}
                        onChange={(e) => setFormData({ ...formData, capacity_kw: e.target.value })}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white"
                        required
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX para Recebimento</label>
                    <input
                        type="text"
                        placeholder="CPF, CNPJ, E-mail ou Chave Aleatória"
                        value={formData.pix_key || ''}
                        onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 bg-white"
                    />
                </div>
            </div>
            <button type="submit" className="mt-6 bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors shadow-sm w-full md:w-auto">
                + Cadastrar Usina
            </button>
        </form>
    );
};

export default PlantForm;
