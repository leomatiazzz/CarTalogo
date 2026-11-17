import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { vehicleService } from '../api/vehicleService';
import type { Vehicle, VehicleDTO } from '../types/vehicle';
import { Modal } from '../components/Modal';
import {
  Car,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState<VehicleDTO>({
    name: '',
    brand: '',
    year: new Date().getFullYear(),
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll({
        page,
        name: nameFilter || undefined,
        brand: brandFilter || undefined,
      });
      setVehicles(data);
    } catch {
      showToast('Erro ao carregar lista de veículos.');
    } finally {
      setLoading(false);
    }
  }, [page, nameFilter, brandFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedVehicle(null);
    setFormData({
      name: '',
      brand: '',
      year: new Date().getFullYear(),
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      brand: vehicle.brand,
      year: vehicle.year,
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Client-side quick check
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('O nome do veículo é obrigatório.');
    if (!formData.brand.trim()) errors.push('A marca do veículo é obrigatória.');
    const maxYear = new Date().getFullYear() + 1;
    if (formData.year < 1886 || formData.year > maxYear) {
      errors.push(`O ano deve estar entre 1886 e ${maxYear}.`);
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await vehicleService.create(formData);
        showToast('Veículo cadastrado com sucesso!');
      } else if (selectedVehicle) {
        await vehicleService.update(selectedVehicle.id, formData);
        showToast('Veículo atualizado com sucesso!');
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      const backendMessages = err.response?.data?.messages;
      if (Array.isArray(backendMessages)) {
        setFormErrors(backendMessages);
      } else {
        setFormErrors(['Ocorreu um erro ao salvar o veículo.']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    setSubmitting(true);
    try {
      await vehicleService.delete(vehicleToDelete.id);
      showToast('Veículo removido com sucesso!');
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch {
      showToast('Erro ao excluir veículo.');
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

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
            <Car className="w-7 h-7 text-[#F28C28]" />
            Catálogo de veículos
          </h1>
          <p className="text-sm text-[#9BA3AF] mt-1">
            Gerencie e consulte todos os automóveis cadastrados no sistema
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771E] active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 text-sm tracking-wide transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo veículo</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#282D36] border border-[#3A4250] rounded-2xl p-5 mb-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-2">
              Buscar por nome / modelo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9BA3AF]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Ex: Fiesta, Civic, Onix..."
                className="w-full pl-9 pr-3 py-2 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-2">
              Buscar por marca
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9BA3AF]">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Ex: Ford, Honda, Toyota..."
                className="w-full pl-9 pr-3 py-2 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setNameFilter('');
                setBrandFilter('');
                setPage(1);
              }}
              className="w-full py-2 px-4 bg-[#20242B] hover:bg-[#20242B]/70 border border-[#3A4250] text-[#9BA3AF] hover:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-[#282D36] border border-[#3A4250] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#F28C28] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#9BA3AF]">Carregando catálogo...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-20 text-center">
            <Car className="w-12 h-12 text-[#9BA3AF]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Nenhum veículo encontrado</h3>
            <p className="text-xs text-[#9BA3AF]">
              {nameFilter || brandFilter
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Cadastre o primeiro veículo clicando no botão acima.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3A4250] bg-[#20242B]/60 text-xs uppercase tracking-wider text-[#9BA3AF]">
                  <th className="py-3.5 px-6 font-bold">ID</th>
                  <th className="py-3.5 px-6 font-bold">Modelo / nome</th>
                  <th className="py-3.5 px-6 font-bold">Marca</th>
                  <th className="py-3.5 px-6 font-bold">Ano</th>
                  <th className="py-3.5 px-6 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4250]/60 text-sm">
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-[#20242B]/40 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-[#9BA3AF]">
                      #{v.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {v.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#20242B] border border-[#3A4250] text-xs font-medium text-[#E9EDF2]">
                        {v.brand}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#9BA3AF]">
                      {v.year}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              title="Editar veículo"
                              className="p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(v)}
                              title="Excluir veículo"
                              className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#9BA3AF]/60 italic">
                            Leitura
                          </span>
                        )}
                      </div>
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
              disabled={vehicles.length < 10 || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3.5 py-1.5 rounded-lg bg-[#20242B] border border-[#3A4250] text-xs font-semibold text-white hover:bg-[#3A4250] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Cadastrar novo veículo' : `Editar veículo #${selectedVehicle?.id}`}
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
              Nome / modelo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Corolla XEi"
              className="w-full px-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-1.5">
              Marca
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Toyota"
              className="w-full px-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white placeholder-[#9BA3AF]/50 text-sm focus:outline-none focus:border-[#F28C28]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9BA3AF] uppercase tracking-wider mb-1.5">
              Ano de fabricação
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9BA3AF]">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                required
                min={1886}
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#20242B] border border-[#3A4250] rounded-xl text-white text-sm focus:outline-none focus:border-[#F28C28]"
              />
            </div>
            <span className="text-[11px] text-[#9BA3AF]/70 mt-1 block">
              Permitido entre 1886 e {new Date().getFullYear() + 1}.
            </span>
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
              className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#D9771E] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#F28C28]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Salvando...' : modalMode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar exclusão"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#E9EDF2]">
            Tem certeza que deseja excluir o veículo{' '}
            <strong className="text-white">
              "{vehicleToDelete?.name} ({vehicleToDelete?.brand} - {vehicleToDelete?.year})"
            </strong>
            ?
          </p>
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            Esta operação é permanente e não poderá ser desfeita.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white hover:bg-[#3A4250] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmDelete}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
