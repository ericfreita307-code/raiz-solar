import React, { useState } from 'react';

const OperatorForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        cpf: initialData?.cpf || '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const validateCPF = (cpf) => {
        // Remove non-numeric characters
        const cleanCPF = cpf.replace(/\D/g, '');
        return cleanCPF.length === 11;
    };

    const formatCPF = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 11) {
            return cleaned
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return value;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setFormData({ ...formData, [name]: formatCPF(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Nome completo é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.cpf.trim()) {
            newErrors.cpf = 'CPF é obrigatório';
        } else if (!validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
        }

        if (!initialData) { // Only validate password for new operators
            if (!formData.password) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem';
            }
        } else if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const submitData = {
                full_name: formData.full_name,
                email: formData.email,
                cpf: formData.cpf.replace(/\D/g, ''), // Remove formatting
            };

            // Only include password if it's set
            if (formData.password) {
                submitData.password = formData.password;
            }

            onSubmit(submitData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Completo */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nome Completo</label>
                <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.full_name ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    placeholder="Ex: João da Silva"
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    placeholder="Ex: joao@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
            </div>

            {/* CPF */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">CPF</label>
                <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength="14"
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.cpf ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    placeholder="Ex: 123.456.789-00"
                />
                {errors.cpf && <p className="text-red-500 text-xs mt-1 font-bold">{errors.cpf}</p>}
            </div>

            {/* Senha */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                    Senha {initialData && <span className="text-gray-300">(deixe em branco para não alterar)</span>}
                </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    placeholder="Mínimo 6 caracteres"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Confirmar Senha</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-100'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold`}
                    placeholder="Repita a senha"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all text-sm uppercase tracking-wider"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#1e293b] text-white rounded-2xl font-black shadow-[0_10px_25px_rgba(30,41,59,0.2)] hover:bg-black hover:scale-105 transition-all active:scale-95 text-sm uppercase tracking-wider"
                >
                    {initialData ? 'Atualizar' : 'Cadastrar'}
                </button>
            </div>
        </form>
    );
};

export default OperatorForm;
