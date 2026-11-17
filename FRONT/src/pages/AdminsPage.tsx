import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../api/adminService';
import type { Admin, AdminDTO } from '../types/admin';
import { Modal } from '../components/Modal';
import { Users, UserPlus, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AdminDTO>({
    email: '',
    password: '',
    profile: 'Editor',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAll(page);
      setAdmins(data);
    } catch {
      showToast('Erro ao carregar administradores.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleOpenCreateModal = () => {
    setFormData({
      email: '',
      password: '',
      profile: 'Editor',
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    const errors: string[] = [];
    if (!formData.email.trim()) errors.push('O e-mail é obrigatório.');
    if (!formData.password.trim()) errors.push('A senha é obrigatória.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await adminService.create(formData);
      showToast('Novo usuário cadastrado com sucesso!');
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      const backendMessages = err.response?.data?.messages;
      if (Array.isArray(backendMessages)) {
        setFormErrors(backendMessages);
      } else {
        setFormErrors(['Erro ao cadastrar usuário. Verifique se o e-mail já existe.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#282D36] border border-[#F28C28] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#F28C28]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
            <Users className="w-7 h-7 text-[#F28C28]" />
            Controle de Acessos & Usuários
          </h1>
          <p className="text-sm text-[#9BA3AF] mt-1">
            Gerenciamento de contas com permissões administrativas e de edição
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771E] active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 text-sm tracking-wide transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-[#282D36] border border-[#3A4250] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#F28C28] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#9BA3AF]">Carregando usuários...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-20 text-center">
            <Shield className="w-12 h-12 text-[#9BA3AF]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Nenhum administrador encontrado</h3>
            <p className="text-xs text-[#9BA3AF]">Cadastre um novo usuário pelo botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3A4250] bg-[#20242B]/60 text-xs uppercase tracking-wider text-[#9BA3AF]">
                  <th className="py-3.5 px-6 font-bold">ID</th>
                  <th className="py-3.5 px-6 font-bold">E-mail</th>
                  <th className="py-3.5 px-6 font-bold">Perfil de Acesso (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4250]/60 text-sm">
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-[#20242B]/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-[#9BA3AF]">
                      #{admin.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {admin.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          admin.profile === 'Admin'
                            ? 'bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/40'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {admin.profile}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-[#3A4250] bg-[#20242B]/40 flex items-center justify-between">
          <span className="text-xs text-[#9BA3AF]">
            Página atual: <strong className="text-white">{page}</strong> (10 itens por página)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 rounded-lg bg-[#20242B] border border-[#3A4250] text-xs font-semibold text-white hover:bg-[#3A4250] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <button
              disabled={admins.length < 10 || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3.5 py-1.5 rounded-lg bg-[#20242B] border border-[#3A4250] text-xs font-semibold text-white hover:bg-[#3A4250] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Criação de Administrador */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Usuário / Administrador"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-1">
              {formErrors.map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-1.5">
              E-mail do Usuário
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="exemplo@empresa.com"
              className="w-full px-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-1.5">
              Senha Inicial
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Senha segura..."
              className="w-full px-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
            />
            <span className="text-[11px] text-[#9BA3AF]/70 mt-1 block">
              A senha será automaticamente hasheada com PBKDF2 no backend.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-1.5">
              Perfil de Acesso (Role)
            </label>
            <select
              value={formData.profile}
              onChange={(e) => setFormData({ ...formData, profile: e.target.value as any })}
              className="w-full px-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white text-sm focus:outline-none focus:border-[#F28C28]"
            >
              <option value="Editor">Editor (Cadastro e consulta de veículos)</option>
              <option value="Admin">Admin (Acesso total + Gestão de Usuários)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A4250]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white hover:bg-[#3A4250] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771E] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
