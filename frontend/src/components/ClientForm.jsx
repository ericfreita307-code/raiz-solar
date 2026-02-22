import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, MapPin, Hash, Save, X, Mail, Phone, Calendar, Lock, Zap, DollarSign } from 'lucide-react';

const ClientForm = ({ onClientAdded, initialData, onCancel, onClientUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        uc_number: '',
        email: '',
        password: '',
        payment_day: '',
        kwh_value_original: '',
        negotiated_discount: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                address: initialData.address || '',
                uc_number: initialData.uc_number || '',
                email: initialData.email || '',
                password: '', // Don't pre-fill password for security
                phone: initialData.phone || '',
                payment_day: initialData.payment_day || '',
                kwh_value_original: initialData.kwh_value_original || '',
                negotiated_discount: initialData.negotiated_discount || '',
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            // Password logic: remove if empty during update, or handle for create
            if (initialData && !formData.password) {
                delete payload.password;
            }

            // Numeric conversions
            if (payload.payment_day !== '' && payload.payment_day !== null) {
                payload.payment_day = parseInt(payload.payment_day);
            }
            if (payload.kwh_value_original !== '' && payload.kwh_value_original !== null) {
                // Handle comma as decimal separator
                const value = String(payload.kwh_value_original).replace(',', '.');
                payload.kwh_value_original = parseFloat(value);
            }
            if (payload.negotiated_discount !== '' && payload.negotiated_discount !== null) {
                // Handle comma as decimal separator
                const value = String(payload.negotiated_discount).replace(',', '.');
                payload.negotiated_discount = parseFloat(value);
            }

            if (initialData) {
                const response = await api.patch(`/clients/${initialData.id}`, payload);
                if (onClientUpdated) onClientUpdated(response.data);
                alert('Cliente atualizado com sucesso!');
            } else {
                const response = await api.post('/clients/', payload);
                onClientAdded(response.data);
                setFormData({ name: '', address: '', uc_number: '', email: '', password: '', phone: '', payment_day: '', kwh_value_original: '', negotiated_discount: '' });
                alert('Cliente cadastrado com sucesso!');
            }
        } catch (error) {
            console.error("Error saving client", error);
            const errorMessage = error.response?.data?.detail || 'Erro ao salvar cliente.';
            alert(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <User size={12} className="stroke-[3]" /> Nome Completo
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                        required
                    />
                </div>
                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <MapPin size={12} className="stroke-[3]" /> Endereço
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Rua das Flores, 123"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                        required
                    />
                </div>
                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Hash size={12} className="stroke-[3]" /> Nº da UC
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: 12345678"
                        value={formData.uc_number}
                        onChange={(e) => setFormData({ ...formData, uc_number: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                        required
                    />
                </div>

                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Mail size={12} className="stroke-[3]" /> E-mail
                    </label>
                    <input
                        type="email"
                        placeholder="Ex: joao@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                        required
                    />
                </div>
                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Phone size={12} className="stroke-[3]" /> Telefone
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: (11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                    />
                </div>
                <div className="group space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Calendar size={12} className="stroke-[3]" /> Dia do Pagamento
                    </label>
                    <input
                        type="number" min="1" max="31"
                        placeholder="Ex: 10"
                        value={formData.payment_day}
                        onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                    />
                </div>

                <div className="group space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Lock size={12} className="stroke-[3]" /> Senha de Acesso
                    </label>
                    <input
                        type="password"
                        placeholder={initialData ? "Deixe em branco para não alterar" : "Defina uma senha"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                        required={!initialData}
                    />
                </div>
                <div className="group space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <Zap size={12} className="stroke-[3]" /> V. KWh Original
                    </label>
                    <input
                        type="number" step="0.000001"
                        placeholder="Ex: 1.126520"
                        value={formData.kwh_value_original}
                        onChange={(e) => setFormData({ ...formData, kwh_value_original: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                    />
                </div>
                <div className="group space-y-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-focus-within:text-blue-600 transition-colors font-montserrat flex items-center gap-2">
                        <DollarSign size={12} className="stroke-[3]" /> Desconto Negociado (%)
                    </label>
                    <input
                        type="number" step="0.1"
                        placeholder="Ex: 15.0"
                        value={formData.negotiated_discount}
                        onChange={(e) => setFormData({ ...formData, negotiated_discount: e.target.value })}
                        className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-3 outline-none transition-all font-bold text-lg text-[#1e293b] placeholder:text-gray-200 bg-transparent"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-6 mt-10 pt-8 border-t border-gray-50">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 font-black hover:text-red-500 transition-all text-xs uppercase tracking-[0.2em] font-montserrat"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-[#1e293b] text-white px-10 py-4 rounded-2xl font-black shadow-[0_15px_35px_rgba(30,41,59,0.2)] hover:bg-black hover:scale-105 transition-all active:scale-95 flex items-center gap-3 text-sm tracking-wide uppercase"
                >
                    <Save size={18} /> Salvar
                </button>
            </div>
        </form>
    );
};

export default ClientForm;
