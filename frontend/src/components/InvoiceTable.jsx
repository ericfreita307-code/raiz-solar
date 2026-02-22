import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import api from '../services/api';

const InvoiceTable = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error("Error fetching invoices", error);
        }
    };

    const handleCheckboxChange = async (invoiceId, field, currentValue) => {
        try {
            await api.patch(`/invoices/${invoiceId}`, { [field]: !currentValue });
            // Optimistic update or refetch
            setInvoices(invoices.map(inv =>
                inv.id === invoiceId ? { ...inv, [field]: !currentValue } : inv
            ));
        } catch (error) {
            console.error("Error updating invoice", error);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden mt-8">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-[#1e293b] tracking-tight uppercase">Gerenciamento Financeiro</h3>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Cobrado</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Pago</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Recebido</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-gray-400">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Cliente</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Mês</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Consumo (kWh)</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">Valor a Receber</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Fatura Equatorial</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-black text-[#1e293b] text-sm uppercase tracking-tight">{invoice.client?.name || 'N/A'}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: {String(invoice.id).slice(0, 8)}</div>
                                </td>
                                <td className="px-8 py-5 font-bold text-gray-600">{invoice.month}</td>
                                <td className="px-8 py-5 font-bold text-[#1e293b]">{invoice.consumption_kwh?.toFixed(2)} kWh</td>
                                <td className="px-8 py-5 text-right">
                                    <div className="font-black text-green-600 text-base">
                                        R$ {invoice.amount_to_collect?.toFixed(2) || '0.00'}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    {invoice.equatorial_invoice_path ? (
                                        <a
                                            href={`http://localhost:8000${invoice.equatorial_invoice_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            <FileText size={14} />
                                            Ver PDF
                                        </a>
                                    ) : (
                                        <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Sem arquivo</span>
                                    )}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex justify-center gap-6">
                                        <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={invoice.status_cobrado}
                                                onChange={() => handleCheckboxChange(invoice.id, 'status_cobrado', invoice.status_cobrado)}
                                                className="hidden"
                                            />
                                            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${invoice.status_cobrado ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-transparent hover:border-blue-200'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${invoice.status_cobrado ? 'text-blue-500' : 'text-gray-300'}`}>Cobrado</span>
                                        </label>

                                        <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={invoice.status_pago}
                                                onChange={() => handleCheckboxChange(invoice.id, 'status_pago', invoice.status_pago)}
                                                className="hidden"
                                            />
                                            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${invoice.status_pago ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 'bg-white border-gray-100 text-transparent hover:border-green-200'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${invoice.status_pago ? 'text-green-500' : 'text-gray-300'}`}>Pago</span>
                                        </label>

                                        <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={invoice.status_recebido}
                                                onChange={() => handleCheckboxChange(invoice.id, 'status_recebido', invoice.status_recebido)}
                                                className="hidden"
                                            />
                                            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${invoice.status_recebido ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-100' : 'bg-white border-gray-100 text-transparent hover:border-purple-200'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${invoice.status_recebido ? 'text-purple-500' : 'text-gray-300'}`}>Recebido</span>
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma fatura encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceTable;
