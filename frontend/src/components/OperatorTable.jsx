import React, { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';

const OperatorTable = ({ operators, onRefresh, onEdit }) => {
    const handleDelete = async (operatorId) => {
        if (window.confirm('Tem certeza que deseja deletar este operador?')) {
            try {
                await api.delete(`/operators/${operatorId}`);
                alert('Operador deletado com sucesso!');
                onRefresh();
            } catch (error) {
                console.error('Erro ao deletar operador', error);
                alert('Erro ao deletar operador');
            }
        }
    };

    const formatCPF = (cpf) => {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1e293b] px-8 py-6">
                <h3 className="text-white font-black text-lg uppercase tracking-wider">Lista de Operadores</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-gray-400">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Nome</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Email</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">CPF</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Cadastrado em</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {operators.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-wider text-sm">
                                    Nenhum operador cadastrado
                                </td>
                            </tr>
                        ) : (
                            operators.map((operator) => (
                                <tr key={operator.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-black text-[#1e293b] text-sm">{operator.full_name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                            ID: {String(operator.id).slice(0, 8)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-600">{operator.email}</td>
                                    <td className="px-8 py-5 font-bold text-gray-600">{formatCPF(operator.cpf)}</td>
                                    <td className="px-8 py-5 font-bold text-gray-500 text-sm">{formatDate(operator.created_at)}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(operator)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(operator.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                                title="Deletar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperatorTable;
