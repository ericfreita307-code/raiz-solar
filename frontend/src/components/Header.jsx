import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10 text-white py-4 px-8 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xl">R</span>
                </div>
                <h1 className="text-xl font-bold tracking-wider text-white">RAIZ SOLAR</h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/login?type=client')}
                    className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition text-sm font-semibold uppercase tracking-wide"
                >
                    Área do Cliente
                </button>
                <button
                    onClick={() => navigate('/login?type=admin')}
                    className="px-6 py-2 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition text-sm font-bold uppercase tracking-wide"
                >
                    Administração
                </button>
            </div>
        </header>
    );
};

export default Header;
