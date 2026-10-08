import React, { useState } from 'react';
import { District, FacilityProfile, User } from '../types';
import { StorageService } from '../services/storage';
import {
  Home,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  UserCheck,
  Building2,
  Menu,
  X,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'register' | 'rekapitulasi' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'register' | 'rekapitulasi' | 'admin') => void;
  currentUser: User | null;
  facility: FacilityProfile;
  districts?: District[];
  onSelectDistrict?: (districtName: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  facility,
  districts: propDistricts,
  onSelectDistrict,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const districts = propDistricts || StorageService.getDistricts();

  const getRoleLabel = (user: User | null) => {
    if (!user) return 'Tamu';
    switch (user.role) {
      case 'admin_induk':
      case 'admin_kabupaten':
        return 'Admin Induk Kabupaten';
      case 'admin_kecamatan':
        return `Kec. ${user.district || facility.district}`;
      case 'admin_desa':
      case 'bidan_desa':
        return `Desa ${user.village || ''}`;
    }
  };

  const navItems = (() => {
    if (currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa') {
      return [
        { id: 'register', label: 'Entri Pasien KB', icon: Users, short: 'Entri KB' },
        { id: 'dashboard', label: 'Beranda Desa', icon: Home, short: 'Beranda' },
      ] as const;
    }

    if (currentUser?.role === 'admin_kecamatan') {
      return [
        { id: 'dashboard', label: 'Beranda', icon: Home, short: 'Beranda' },
        { id: 'register', label: 'Data Pasien KB', icon: Users, short: 'Pasien KB' },
        { id: 'rekapitulasi', label: 'Laporan R/I/KB', icon: FileSpreadsheet, short: 'R/I/KB' },
        { id: 'admin', label: 'Profil Kecamatan', icon: Building2, short: 'Profil Kec.' },
      ] as const;
    }

    return [
      { id: 'dashboard', label: 'Beranda', icon: Home, short: 'Beranda' },
      { id: 'register', label: 'Data Pasien KB', icon: Users, short: 'Pasien KB' },
      { id: 'rekapitulasi', label: 'Laporan R/I/KB', icon: FileSpreadsheet, short: 'R/I/KB' },
      { id: 'admin', label: 'Pengaturan', icon: Settings, short: 'Pengaturan' },
    ] as const;
  })();

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand Identity */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center text-left focus:outline-none group cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    SIM Pelayanan KB
                  </span>
                  <span className="hidden sm:inline text-slate-300">·</span>
                  <span className="hidden sm:inline text-xs font-medium text-emerald-700">
                    {currentUser?.role === 'admin_kecamatan'
                      ? `Kec. ${currentUser.district || facility.district}`
                      : 'Dinas P3AKB Bojonegoro'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {currentUser?.role === 'admin_kecamatan'
                    ? `${facility.name} · Kode Register ${facility.k0kbCode}`
                    : 'Sistem Informasi Register Pelayanan KB (R/I/KB)'}
                </p>
              </div>
            </button>

            {/* Minimal Segmented Desktop Navigation */}
            <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: User Profile */}
            <div className="flex items-center space-x-2">
              {currentUser ? (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={onOpenLogin}
                    className="flex items-center space-x-2.5 py-1.5 px-2.5 hover:bg-slate-100/80 rounded-xl transition text-left cursor-pointer"
                    title="Ganti Akun Pengguna"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-slate-900 line-clamp-1 leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        {getRoleLabel(currentUser)}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onLogout}
                    title="Keluar"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              )}

              {/* Mobile Hamburger */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-lg">
            {currentUser && (
              <div className="p-3 mb-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{getRoleLabel(currentUser)}</p>
                </div>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-slate-700 font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Ganti Akun
                </button>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1.5 px-2 grid grid-cols-4 gap-1 md:hidden print:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[11px] mt-1 leading-tight truncate max-w-full">{item.short}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
