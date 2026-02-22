import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-500 selection:text-black font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 sm:px-12 min-h-screen flex flex-col justify-center items-center text-center overflow-hidden">

                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <span className="text-yellow-500 font-semibold tracking-widest uppercase text-sm">Energia Sustentável</span>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
                        Invista no futuro <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                            com a Raiz Solar
                        </span>
                    </h1>

                    <p className="text-gray-200 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
                        Transforme a luz do sol em economia real. Gerencie seus créditos de energia de forma simples, transparente e eficiente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <button
                            onClick={() => navigate('/login?type=client')}
                            className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition transform hover:scale-105 shadow-lg shadow-yellow-500/20"
                        >
                            ACESSAR MINHA CONTA
                        </button>
                        <button
                            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition"
                        >
                            SAIBA MAIS
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Preview (Optional visual filler) */}
            <section className="py-20 px-6 border-t border-white/5 bg-black/50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition">
                        <div className="text-yellow-500 mb-4">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Alta Performance</h3>
                        <p className="text-gray-400">Acompanhe sua geração de energia em tempo real com gráficos detalhados.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition">
                        <div className="text-yellow-500 mb-4">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Economia Garantida</h3>
                        <p className="text-gray-400">Reduza sua conta de luz e visualize seus descontos mensalmente.</p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition">
                        <div className="text-yellow-500 mb-4">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Transparência Total</h3>
                        <p className="text-gray-400">Acesse suas faturas e histórico de pagamento a qualquer momento.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default Landing;
