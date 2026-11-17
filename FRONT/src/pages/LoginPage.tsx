import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../api/authService';
import { Modal } from '../components/Modal';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  LogIn,
  CheckCircle2,
  HelpCircle,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (password.length < 6) {
        setError('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }

      setLoading(true);
      try {
        await authService.register({ email, password });
        setSuccessMessage('Conta de Editor criada com sucesso! Realizando login automático...');
        // Auto login right after register
        await login({ email, password });
        setTimeout(() => navigate('/vehicles'), 800);
      } catch (err: any) {
        const messages = err.response?.data?.messages;
        if (Array.isArray(messages) && messages.length > 0) {
          setError(messages[0]);
        } else {
          setError('Erro ao criar conta. Verifique se o e-mail já está cadastrado.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login Mode
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
    }
  };

  const handleFillCredentials = (emailVal: string, pwdVal: string) => {
    setMode('login');
    setEmail(emailVal);
    setPassword(pwdVal);
    setError(null);
    setSuccessMessage(null);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#20242B]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
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
        <div className="bg-[#282D36] border border-[#3A4250] rounded-2xl shadow-2xl p-7 backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#20242B] rounded-xl border border-[#3A4250] mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#F28C28] text-white shadow-md'
                  : 'text-[#9BA3AF] hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acessar conta</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#F28C28] text-white shadow-md'
                  : 'text-[#9BA3AF] hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar conta</span>
            </button>
          </div>

          <h2 className="text-lg font-bold text-white mb-2 tracking-wide">
            {mode === 'login' ? 'Identifique-se para continuar' : 'Cadastre-se na plataforma'}
          </h2>

          {mode === 'register' && (
            <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-sky-400" />
              <span>
                Novas contas são criadas com o perfil de <strong>Editor</strong> (acesso ao catálogo e cadastro de veículos).
              </span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF] mb-1.5">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSent(false);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] text-[#F28C28] hover:text-[#D9771E] font-medium transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
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

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF] mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA3AF]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28] focus:ring-1 focus:ring-[#F28C28] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-[#F28C28] hover:bg-[#D9771E] active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 flex items-center justify-center gap-2 text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Criar conta e acessar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helpers (Only in login mode) */}
          {mode === 'login' && (
            <div className="mt-6 pt-5 border-t border-[#3A4250]/70 text-xs text-[#9BA3AF]">
              <div className="flex items-center gap-1.5 font-semibold text-white mb-2">
                <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
                <span>Contas de demonstração para testes:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('administrador@teste.com', '123456')}
                  className="p-2 rounded-lg bg-[#20242B] hover:bg-[#20242B]/80 border border-[#3A4250] text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-[#F28C28] group-hover:underline">Perfil admin</div>
                  <div className="text-[10px] text-[#9BA3AF]/80 truncate">administrador@teste.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials('editor@teste.com', '123456')}
                  className="p-2 rounded-lg bg-[#20242B] hover:bg-[#20242B]/80 border border-[#3A4250] text-left transition-colors cursor-pointer group"
                >
                  <div className="font-bold text-sky-400 group-hover:underline">Perfil editor</div>
                  <div className="text-[10px] text-[#9BA3AF]/80 truncate">editor@teste.com</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Recuperação de senha"
      >
        {forgotSent ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#F28C28] mx-auto" />
            <h4 className="text-base font-bold text-white">Solicitação registrada</h4>
            <p className="text-xs text-[#9BA3AF] leading-relaxed">
              Em um ambiente corporativo com serviço de e-mail (AWS SES / SendGrid), uma mensagem com token seguro de redefinição expirável seria disparada para <strong>{forgotEmail || 'seu e-mail'}</strong>.
            </p>
            <div className="p-3 bg-[#20242B] border border-[#3A4250] rounded-xl text-left text-xs text-[#9BA3AF] mt-3">
              <p className="font-semibold text-white mb-1">Como resolver no ambiente de testes:</p>
              Faça login com a conta mestre <strong className="text-[#F28C28]">administrador@teste.com</strong> (senha: <code className="text-white">123456</code>) ou use o botão de cadastro para criar uma nova conta.
            </div>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="mt-4 px-5 py-2 bg-[#F28C28] text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                Informe o seu e-mail cadastrado para receber instruções de recuperação de acesso.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9BA3AF] mb-1.5">
                E-mail cadastrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white text-sm focus:outline-none focus:border-[#F28C28]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A4250]">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white hover:bg-[#3A4250] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771E] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Enviar instruções
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
