import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/vehicles');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.');
      } else {
        setError('Erro ao conectar com o servidor. Verifique se a API está em execução.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (emailVal: string, pwdVal: string) => {
    setEmail(emailVal);
    setPassword(pwdVal);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#20242B]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/assets/logo-full.png"
              alt="CarTálogo"
              className="h-14 w-auto object-contain drop-shadow-md"
            />
          </div>
          <p className="text-sm text-[#9BA3AF] font-medium">
            Gestão moderna e catálogo inteligente de veículos
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#282D36] border border-[#3A4250] rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6 tracking-wide">
            Acessar Plataforma
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF] mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF] mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#F28C28] hover:bg-[#D9771E] active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 flex items-center justify-center gap-2 text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helpers */}
          <div className="mt-8 pt-6 border-t border-[#3A4250]/70 text-xs text-[#9BA3AF]">
            <div className="flex items-center gap-1.5 font-semibold text-white mb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
              <span>Contas de demonstração para testes:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('administrador@teste.com', '123456')}
                className="p-2.5 rounded-lg bg-[#20242B] hover:bg-[#20242B]/80 border border-[#3A4250] text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-[#F28C28] group-hover:underline">Perfil Admin</div>
                <div className="text-[11px] text-[#9BA3AF]/80 truncate">administrador@teste.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('editor@teste.com', '123456')}
                className="p-2.5 rounded-lg bg-[#20242B] hover:bg-[#20242B]/80 border border-[#3A4250] text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-sky-400 group-hover:underline">Perfil Editor</div>
                <div className="text-[11px] text-[#9BA3AF]/80 truncate">editor@teste.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
