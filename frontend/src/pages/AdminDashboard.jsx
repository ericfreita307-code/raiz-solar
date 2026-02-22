import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import ClientForm from '../components/ClientForm';
import ClientTable from '../components/ClientTable';
import OperatorForm from '../components/OperatorForm';
import OperatorTable from '../components/OperatorTable';
import ProductionForm from '../components/ProductionForm';
import InvoiceTable from '../components/InvoiceTable';
import CreditSystem from '../components/CreditSystem';
import PlantsPage from '../pages/PlantsPage';
import api from '../services/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [cadastroTab, setCadastroTab] = useState('clientes'); // New state for Cadastros sub-tabs
    const [clients, setClients] = useState([]);
    const [operators, setOperators] = useState([]);
    const [activeClient, setActiveClient] = useState(null);
    const [activeOperator, setActiveOperator] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Keep client fetching for the Client Tab
    // Ideally this should move to a ClientManager component, but keeping here for now
    const fetchClients = async () => {
        try {
            const response = await api.get('/clients/');
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients", error);
        }
    };

    const fetchOperators = async () => {
        try {
            const response = await api.get('/operators/');
            setOperators(response.data);
        } catch (error) {
            console.error("Error fetching operators", error);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'clients') {
            fetchClients();
            fetchOperators();
        }
    }, [activeTab]);

    const handleClientUpdated = (updatedClient) => {
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        setShowEditModal(false);
        setActiveClient(null);
    };

    const handleOperatorUpdated = (updatedOperator) => {
        setOperators(operators.map(o => o.id === updatedOperator.id ? updatedOperator : o));
        setShowEditModal(false);
        setActiveOperator(null);
    };

    const handleEdit = (client) => {
        setActiveClient(client);
        setActiveOperator(null); // Ensure operator is null when editing client
        setShowEditModal(true);
    };

    const handleEditOperator = (operator) => {
        setActiveOperator(operator);
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setActiveClient(null);
        setActiveOperator(null);
        setShowAddModal(true);
    };

    const handleClientAdded = (newClient) => {
        setClients([...clients, newClient]);
        setShowAddModal(false);
    };

    const handleOperatorSubmit = async (operatorData) => {
        try {
            if (activeOperator) {
                // Update existing operator
                await api.patch(`/operators/${activeOperator.id}`, operatorData);
                alert('Operador atualizado com sucesso!');
            } else {
                // Create new operator
                await api.post('/operators/', operatorData);
                alert('Operador cadastrado com sucesso!');
            }
            fetchOperators();
            setShowAddModal(false);
            setShowEditModal(false);
            setActiveOperator(null);
        } catch (error) {
            console.error('Erro ao salvar operador', error);
            if (error.response?.data?.detail) {
                alert(`Erro: ${error.response.data.detail}`);
            } else {
                alert('Erro ao salvar operador');
            }
        }
    };

    const handleDeleteClient = async (client) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
            try {
                await api.delete(`/clients/${client.id}`);
                alert('Cliente excluído com sucesso!');
                fetchClients();
            } catch (error) {
                console.error("Error deleting client", error);
                alert("Erro ao excluir cliente.");
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {activeTab === 'overview' && <DashboardOverview />}

                {activeTab === 'plants' && (
                    <PlantsPage />
                )}

                {activeTab === 'clients' && (
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-black text-[#1e293b] tracking-tight">CADASTROS</h2>
                            <button
                                onClick={handleAdd}
                                className="bg-[#1e293b] text-white px-6 py-3 rounded-2xl font-black shadow-[0_10px_25px_rgba(30,41,59,0.2)] hover:bg-black hover:scale-105 transition-all active:scale-95 flex items-center gap-2 text-sm uppercase tracking-wider"
                            >
                                + {cadastroTab === 'clientes' ? 'Cadastrar Cliente' : 'Cadastrar Operador'}
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-4 border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setCadastroTab('clientes')}
                                className={`pb-3 px-4 font-black text-sm uppercase tracking-wider transition-all relative ${cadastroTab === 'clientes'
                                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Users size={16} className="inline mr-2" />
                                Clientes
                            </button>
                            <button
                                onClick={() => setCadastroTab('operadores')}
                                className={`pb-3 px-4 font-black text-sm uppercase tracking-wider transition-all relative ${cadastroTab === 'operadores'
                                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Users size={16} className="inline mr-2" />
                                Operadores
                            </button>
                        </div>

                        {/* Tab Content */}
                        {cadastroTab === 'clientes' && (
                            <ClientTable clients={clients} onRefresh={fetchClients} onEdit={handleEdit} onDelete={handleDeleteClient} />
                        )}

                        {cadastroTab === 'operadores' && (
                            <OperatorTable operators={operators} onRefresh={fetchOperators} onEdit={handleEditOperator} />
                        )}

                        {/* Add Modal */}
                        {showAddModal && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl p-4 transition-all">
                                <div className="bg-white rounded-[3rem] shadow-[0_60px_150px_rgba(0,0,0,0.7)] w-full max-w-4xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-500">
                                    <div className="p-10 border-b border-gray-50 bg-blue-600 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight">
                                                {cadastroTab === 'clientes' ? 'Novo Cliente' : 'Novo Operador'}
                                            </h3>
                                            <p className="text-blue-100 font-bold text-xs mt-2 uppercase tracking-[0.3em]">
                                                {cadastroTab === 'clientes' ? 'Cadastrando novo acesso ao sistema' : 'Cadastrando novo operador'}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowAddModal(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all shadow-xl">
                                            <X size={32} />
                                        </button>
                                    </div>
                                    <div className="p-10 overflow-y-auto max-h-[80vh]">
                                        {cadastroTab === 'clientes' ? (
                                            <ClientForm
                                                onCancel={() => setShowAddModal(false)}
                                                onClientAdded={handleClientAdded}
                                            />
                                        ) : (
                                            <OperatorForm
                                                onCancel={() => setShowAddModal(false)}
                                                onSubmit={handleOperatorSubmit}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit Modal */}
                        {showEditModal && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl p-4 transition-all">
                                <div className="bg-white rounded-[3rem] shadow-[0_60px_150px_rgba(0,0,0,0.7)] w-full max-w-4xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-500">
                                    <div className="p-10 border-b border-gray-50 bg-green-600 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tight">
                                                {activeClient ? 'Editar Cliente' : 'Editar Operador'}
                                            </h3>
                                            <p className="text-green-100 font-bold text-xs mt-2 uppercase tracking-[0.3em]">
                                                {activeClient ? 'Atualizando informações do cliente' : 'Atualizando informações do operador'}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowEditModal(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all shadow-xl">
                                            <X size={32} />
                                        </button>
                                    </div>
                                    <div className="p-10 overflow-y-auto max-h-[80vh]">
                                        {activeClient ? (
                                            <ClientForm
                                                initialData={activeClient}
                                                onCancel={() => setShowEditModal(false)}
                                                onClientUpdated={handleClientUpdated}
                                            />
                                        ) : (
                                            <OperatorForm
                                                initialData={activeOperator}
                                                onCancel={() => setShowEditModal(false)}
                                                onSubmit={handleOperatorSubmit}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'production' && (
                    <div className="space-y-6">
                        {/* <h2 className="text-2xl font-bold text-gray-800">Produção e Financeiro</h2> */}
                        <CreditSystem />

                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">Lançamento de Faturas e Produção</h3>
                            <ProductionForm />
                            <InvoiceTable />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
