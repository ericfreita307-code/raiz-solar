import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Settings, Edit2, Trash2, Search, MoreHorizontal } from 'lucide-react';
import api from '../services/api';

const ClientTable = ({ clients, onRefresh, onEdit, onDelete }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleClientStatus = async (client) => {
        try {
            await api.patch(`/clients/${client.id}`, { is_active: !client.is_active });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Error toggling status", error);
            alert("Erro ao alterar status do cliente.");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1e293b] text-white text-[10px] tracking-[0.25em] font-montserrat">
                            <th className="p-6 border-r border-white/10 font-black uppercase">Cliente</th>
                            <th className="p-6 border-r border-white/10 font-black uppercase">Endereço</th>
                            <th className="p-6 border-r border-white/10 font-black uppercase w-56">Nº da UC</th>
                            <th className="p-6 border-r border-white/10 font-black uppercase w-32 text-center">Status</th>
                            <th className="p-6 font-black uppercase w-36 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clients.length > 0 ? (
                            clients.map((client, idx) => (
                                <tr key={client.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/40 transition-colors group relative`}>
                                    <td className="p-6 font-black text-[#1e293b] border-r border-gray-50 text-lg">{client.name}</td>
                                    <td className="p-6 text-sm text-gray-500 font-bold border-r border-gray-50">{client.address}</td>
                                    <td className="p-6 text-base font-black text-gray-300 border-r border-gray-50 tracking-tighter font-montserrat uppercase">{client.uc_number}</td>
                                    <td className="p-6 border-r border-gray-50 text-center">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => toggleClientStatus(client)}
                                                className={`p-2 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 ${client.is_active !== false ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}
                                            >
                                                {client.is_active !== false ? <Check size={20} className="stroke-[3]" /> : <X size={20} className="stroke-[3]" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center relative overflow-visible">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                                                className={`p-3 rounded-2xl transition-all shadow-sm ${openMenuId === client.id ? 'bg-[#1e293b] text-yellow-400 rotate-90' : 'bg-gray-100 text-gray-300 hover:bg-blue-100 hover:text-blue-600'}`}
                                            >
                                                <Settings size={28} className="stroke-[2.5]" />
                                            </button>

                                            {openMenuId === client.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#1e293b] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100] w-56 overflow-hidden border border-white/5 animate-in slide-in-from-right-4 duration-300"
                                                >
                                                    <button
                                                        onClick={() => { onEdit(client); setOpenMenuId(null); }}
                                                        className="w-full px-7 py-5 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors border-b border-white/5 group"
                                                    >
                                                        <div className="bg-blue-500 group-hover:bg-blue-400 p-1.5 rounded-lg text-white"><Edit2 size={18} className="stroke-[3]" /></div>
                                                        <span className="font-black text-xs uppercase tracking-widest">Editar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { onDelete(client); setOpenMenuId(null); }}
                                                        className="w-full px-7 py-5 text-left text-white hover:bg-white/10 flex items-center gap-4 transition-colors group"
                                                    >
                                                        <div className="bg-red-500 group-hover:bg-red-400 p-1.5 rounded-lg text-white"><Trash2 size={18} className="stroke-[3]" /></div>
                                                        <span className="font-black text-xs uppercase tracking-widest">Excluir</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-32 text-center text-gray-300 font-bold uppercase tracking-[0.3em] text-xs">Nenhum cliente cadastrado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientTable;
