import { LayoutDashboard, Users, Banknote, LogOut, Factory } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'clients', label: 'Cadastros', icon: Users },
        { id: 'plants', label: 'Usinas', icon: Factory },
        { id: 'production', label: 'Financeiro', icon: Banknote },
    ];

    return (
        <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 text-gray-800">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">R</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">RAIZ SOLAR</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-yellow-50 text-yellow-700 font-semibold shadow-sm border border-yellow-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
