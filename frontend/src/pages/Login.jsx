import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type') || 'client'; // 'client' or 'admin'

    const [formData, setFormData] = useState({ identifier: '', password: '' });

    const isClient = type === 'client';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password,
                    user_type: type // 'client' or 'admin'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user info if needed, e.g., in localStorage
                localStorage.setItem('user', JSON.stringify(data));

                if (isClient) navigate('/client');
                else navigate('/admin');
            } else {
                alert(data.detail || 'Credenciais incorretas!');
            }
        } catch (error) {
            console.error("Login error:", error);
            alert('Erro ao conectar ao servidor. Verifique se o backend está rodando.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-500 mb-2">
                        {isClient ? 'Área do Cliente' : 'Administração'}
                    </h1>
                    <p className="text-gray-400">Entre com suas credenciais para acessar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            E-mail
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition text-white"
                            placeholder="E-mail ou Login"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition text-white"
                            placeholder="*************"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition transform hover:scale-[1.02]"
                    >
                        {isClient ? 'ACESSAR PAINEL' : 'ENTRAR NO ADMIN'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-white transition underline"
                    >
                        Voltar para o início
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
