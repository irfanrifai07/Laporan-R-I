import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { KeyRound, Eye, EyeOff, CheckCircle2, X, ShieldCheck, Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  targetUser: User | null;
  onClose: () => void;
  onConfirmChange: (user: User, newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  targetUser,
  onClose,
  onConfirmChange,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'saving' | 'success'>('form');

  useEffect(() => {
    if (isOpen && targetUser) {
      setNewPassword('');
      setConfirmPassword('');
      setShowNew(false);
      setShowConfirm(false);
      setErrorMsg(null);
      setStep('form');
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Belum diisi', color: 'bg-slate-200', text: 'text-slate-400' };
    if (pwd.length < 4) return { score: 1, label: 'Mudah diingat (Pendek)', color: 'bg-amber-500', text: 'text-amber-600' };
    if (pwd.length < 7) return { score: 2, label: 'Cukup Kuat', color: 'bg-blue-500', text: 'text-blue-600' };
    return { score: 3, label: 'Sangat Kuat', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setErrorMsg('Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setErrorMsg(null);
    setStep('saving');

    setTimeout(() => {
      onConfirmChange(targetUser, cleanNew);
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1350);
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/90 overflow-hidden animate-modal-spring">
        {step === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-check-pop shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1 animate-slide-up">
              <h3 className="text-base font-bold text-slate-900">
                Password Berhasil Diperbarui!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kata sandi untuk akun <strong className="text-slate-800">{targetUser.name}</strong> (
                <span className="font-mono">@{targetUser.username}</span>) telah tersimpan dan langsung aktif di Cloud Firebase.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tersinkronisasi Otomatis</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ubah Kata Sandi</h3>
                  <p className="text-[11px] text-slate-500">
                    {targetUser.name} · <span className="font-mono font-semibold text-slate-700">@{targetUser.username}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={step === 'saving'}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Password Saat Ini:</span>
                <code className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800">
                  {targetUser.password}
                </code>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-slide-up">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Masukkan password baru..."
                    autoFocus
                    required
                    disabled={step === 'saving'}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Animated Strength Bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= lvl ? strength.color : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Indikator Keamanan</span>
                    <span className={`font-semibold transition-colors duration-200 ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ulangi Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Ketik ulang password baru..."
                    required
                    disabled={step === 'saving'}
                    className={`w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-mono transition ${
                      confirmPassword && confirmPassword === newPassword
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center space-x-1 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Password cocok</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === 'saving'}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={step === 'saving'}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {step === 'saving' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
