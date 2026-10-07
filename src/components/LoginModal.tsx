import React, { useState } from 'react';
import { District, FacilityProfile, User, Village } from '../types';
import { StorageService } from '../services/storage';
import {
  AlertCircle,
  Building2,
  Check,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  X,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  isPortal?: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  onUserRegistered?: (user: User) => void;
  users?: User[];
  villages?: Village[];
  districts?: District[];
  facility?: FacilityProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  isPortal = false,
  onClose,
  onLoginSuccess,
  users: propUsers,
  districts: propDistricts,
  facility: propFacility,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target district selector for Admin Induk Kabupaten
  const [targetDistrictForInduk, setTargetDistrictForInduk] = useState<string>('SEMUA');

  if (!isOpen) return null;

  const facility = propFacility || StorageService.getFacilityProfile();
  const districts = propDistricts || StorageService.getDistricts();

  const allUsers = propUsers && propUsers.length > 0 ? propUsers : StorageService.getUsers();
  const kecamatanUsers = allUsers.filter((u) => u.role === 'admin_kecamatan');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputUser = username.trim().toLowerCase();
    const cleanInputUser = inputUser.replace(/[\s_-]/g, '');
    const inputPass = password.trim();

    const userMatch = allUsers.find((u) => {
      const uName = (u.username || '').trim().toLowerCase();
      const cleanUName = uName.replace(/[\s_-]/g, '');
      return uName === inputUser || cleanUName === cleanInputUser;
    });

    if (!userMatch) {
      setErrorMessage(
        `Username "${username.trim()}" tidak ditemukan. Pastikan username Anda sudah terdaftar pada sistem.`
      );
      return;
    }

    const savedPass = (userMatch.password || '').trim();
    if (savedPass !== inputPass) {
      setErrorMessage(
        `Kata sandi untuk username "${userMatch.username}" tidak cocok. Silakan periksa kembali ketikan password Anda.`
      );
      return;
    }

    const targetDistrict =
      userMatch.role === 'admin_induk' || userMatch.role === 'admin_kabupaten'
        ? targetDistrictForInduk === 'SEMUA'
          ? undefined
          : targetDistrictForInduk
        : userMatch.district;

    const finalUser: User = {
      ...userMatch,
      district: targetDistrict,
    };

    StorageService.setCurrentUser(finalUser);
    StorageService.logActivity(
      finalUser.username,
      'LOGIN',
      `Pengguna ${finalUser.name} (${finalUser.username}) berhasil masuk${targetDistrict ? ` (Wilayah Kec: ${targetDistrict})` : ''}`
    );
    onLoginSuccess(finalUser);
    if (onClose) onClose();
  };

  return (
    <div
      className={
        isPortal
          ? 'min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 font-sans relative overflow-hidden'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto'
      }
    >
      {isPortal && (
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08), transparent 55%)',
          }}
        />
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_-12px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden my-4 relative z-10">
        {/* Clean Minimalist Header */}
        <div className="px-7 pt-8 pb-5 text-center relative border-b border-slate-100">
          {!isPortal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            {facility.name}
          </h1>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-rose-700 text-xs flex items-start space-x-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username akun"
                  required
                  autoFocus
                  className="w-full py-2.5 pl-9 pr-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 font-mono text-sm sm:text-xs text-slate-900 transition"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full py-2.5 pl-9 pr-10 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 text-sm sm:text-xs text-slate-900 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 sm:top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Pilihan Khusus: Admin Induk Menentukan Wilayah Kecamatan */}
            {username.trim().toLowerCase() === 'admin' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">
                    Cakupan Wilayah Pengawasan
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Admin Induk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setTargetDistrictForInduk('SEMUA')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      targetDistrictForInduk === 'SEMUA'
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">Seluruh Kecamatan</div>
                      <div
                        className={`text-[10px] ${
                          targetDistrictForInduk === 'SEMUA' ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        Se-Kabupaten
                      </div>
                    </div>
                    {targetDistrictForInduk === 'SEMUA' && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>

                  {districts.map((d) => {
                    const isSel = targetDistrictForInduk === d.name;
                    const adminKecUser = kecamatanUsers.find(
                      (u) => (u.district || '').toLowerCase() === d.name.toLowerCase()
                    );
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setTargetDistrictForInduk(d.name)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs">Kec. {d.name}</div>
                          <div
                            className={`text-[10px] ${
                              isSel ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {adminKecUser ? `@${adminKecUser.username}` : 'Koordinator KB'}
                          </div>
                        </div>
                        {isSel && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer text-sm mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          </form>

          {!isPortal && onClose && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {isPortal && (
        <div className="text-center text-slate-400 text-xs mt-3 relative z-10">
          Dinas Pemberdayaan Perempuan, Perlindungan Anak dan KB Kabupaten Bojonegoro
        </div>
      )}
    </div>
  );
};
