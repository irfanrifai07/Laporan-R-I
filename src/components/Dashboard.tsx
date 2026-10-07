import React, { useState, useMemo, useEffect } from 'react';
import { ContraceptiveMethod, District, FacilityProfile, PatientRecord, User, Village } from '../types';
import { METHOD_SHORT_LABELS, METHOD_LABELS } from '../data/initialData';
import { StorageService } from '../services/storage';
import {
  Calendar,
  Plus,
  ArrowRight,
  ClipboardList,
  Building2,
  Baby,
  RefreshCw,
  Sparkles,
  Heart,
  ShieldCheck,
  FileSpreadsheet,
  MapPin,
  TrendingUp,
  UserCheck,
  CheckCircle,
  Clock,
  Shield,
  Eye,
  Edit3,
  Save,
} from 'lucide-react';

interface DashboardProps {
  records: PatientRecord[];
  villages: Village[];
  districts?: District[];
  onUpdateDistricts?: (d: District[]) => void;
  facility: FacilityProfile;
  currentUser?: User | null;
  onNavigateRegister: () => void;
  onNavigateRekap: () => void;
  onNavigateAdmin?: () => void;
  onAddNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  villages,
  districts: propDistricts,
  onUpdateDistricts,
  facility,
  currentUser,
  onNavigateRegister,
  onNavigateRekap,
  onNavigateAdmin,
  onAddNew,
}) => {
  const isBidanDesa = currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';
  const isAdminKecamatan = currentUser?.role === 'admin_kecamatan';
  const isAdminInduk = currentUser?.role === 'admin_induk' || currentUser?.role === 'admin_kabupaten' || !currentUser;
  const districts = propDistricts || StorageService.getDistricts();

  const activeDistrictName = currentUser?.district || facility.district;
  const activeDistrictObj = districts.find(
    (d) => d.name.toLowerCase() === activeDistrictName.toLowerCase()
  );
  const [isEditingKecProfile, setIsEditingKecProfile] = useState(false);
  const [kecSaveSuccess, setKecSaveSuccess] = useState(false);

  const handleKecProfileFieldChange = (
    field: 'institutionName' | 'k0kbCode' | 'address' | 'regency' | 'province',
    value: string
  ) => {
    if (!activeDistrictObj) return;
    const updatedDist: District = {
      ...activeDistrictObj,
      [field]: value,
    };
    const updatedList = districts.map((d) => (d.id === activeDistrictObj.id ? updatedDist : d));
    if (onUpdateDistricts) onUpdateDistricts(updatedList);
    StorageService.saveSingleDistrict(updatedDist);
    setKecSaveSuccess(true);
    setTimeout(() => setKecSaveSuccess(false), 2000);
  };

  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedVillage, setSelectedVillage] = useState<string>(
    isBidanDesa && currentUser?.village ? currentUser.village : 'SEMUA'
  );

  useEffect(() => {
    if (isBidanDesa && currentUser?.village) {
      setSelectedVillage(currentUser.village);
    } else {
      setSelectedVillage('SEMUA');
    }
  }, [isBidanDesa, currentUser?.village]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filter records based on selected period and village
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedVillage !== 'SEMUA' && r.village.toLowerCase() !== selectedVillage.toLowerCase()) {
        return false;
      }
      if (r.serviceDate) {
        const [y, m] = r.serviceDate.split('-').map(Number);
        if (selectedYear !== 0 && y !== selectedYear) return false;
        if (selectedMonth !== 0 && m !== selectedMonth) return false;
      }
      return true;
    });
  }, [records, selectedMonth, selectedYear, selectedVillage]);

  // Status Metrics (KBPP dan Ulangan dipisah secara tegas)
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const baruBukanPasca = filteredRecords.filter((r) => r.participantStatus === 'BARU_BUKAN_PASCA').length;
    const kbpp = filteredRecords.filter((r) => r.participantStatus === 'BARU_PASCA_SALIN').length; // KBPP dipisah
    const baruPascaGugur = filteredRecords.filter((r) => r.participantStatus === 'BARU_PASCA_GUGUR').length;
    const gantiCara = filteredRecords.filter((r) => r.participantStatus === 'GANTI_CARA').length;
    const ulangan = filteredRecords.filter((r) => r.participantStatus === 'ULANGAN').length; // Ulangan dipisah
    const apbn = filteredRecords.filter((r) => r.alokonSource === 'APBN').length;
    const apbd = filteredRecords.filter((r) => r.alokonSource === 'NON_APBN').length;
    const mandiri = filteredRecords.filter((r) => r.alokonSource === 'MANDIRI').length;

    return {
      total,
      baruBukanPasca,
      kbpp,
      baruPascaGugur,
      totalBaruSemua: baruBukanPasca + kbpp + baruPascaGugur,
      gantiCara,
      ulangan,
      apbn,
      apbd,
      mandiri,
    };
  }, [filteredRecords]);

  // Method Breakdown Matrix (KBPP dan Ulangan dipisah per kolom)
  const methodList: ContraceptiveMethod[] = [
    'SUNTIK_3_BLN',
    'SUNTIK_1_BLN',
    'IMPLAN_2_BATANG',
    'IMPLAN_1_BATANG',
    'IUD',
    'PIL',
    'KONDOM',
    'MOW',
    'MOP',
  ];

  const methodMatrix = useMemo(() => {
    return methodList.map((m) => {
      const recs = filteredRecords.filter((r) => r.method === m);
      const baru = recs.filter((r) => r.participantStatus === 'BARU_BUKAN_PASCA').length;
      const kbpp = recs.filter((r) => r.participantStatus === 'BARU_PASCA_SALIN').length; // KBPP
      const pascaGugur = recs.filter((r) => r.participantStatus === 'BARU_PASCA_GUGUR').length;
      const gantiCara = recs.filter((r) => r.participantStatus === 'GANTI_CARA').length;
      const ulangan = recs.filter((r) => r.participantStatus === 'ULANGAN').length; // Ulangan
      const apbn = recs.filter((r) => r.alokonSource === 'APBN').length;
      const apbd = recs.filter((r) => r.alokonSource === 'NON_APBN').length;
      const mandiri = recs.filter((r) => r.alokonSource === 'MANDIRI').length;

      return {
        key: m,
        label: METHOD_SHORT_LABELS[m] || m,
        fullLabel: METHOD_LABELS[m] || m,
        total: recs.length,
        baru,
        kbpp,
        pascaGugur,
        gantiCara,
        ulangan,
        apbn,
        apbd,
        mandiri,
      };
    });
  }, [filteredRecords]);

  // Village Breakdown Matrix (KBPP dan Ulangan dipisah)
  const villageMatrix = useMemo(() => {
    const targetVillages =
      isBidanDesa && currentUser?.village
        ? villages.filter((v) => v.name.toLowerCase() === currentUser.village!.toLowerCase())
        : selectedVillage !== 'SEMUA'
        ? villages.filter((v) => v.name.toLowerCase() === selectedVillage.toLowerCase())
        : villages;

    return targetVillages.map((v) => {
      const recs = filteredRecords.filter(
        (r) => r.village.toLowerCase() === v.name.toLowerCase()
      );
      const baru = recs.filter((r) => r.participantStatus === 'BARU_BUKAN_PASCA').length;
      const kbpp = recs.filter((r) => r.participantStatus === 'BARU_PASCA_SALIN').length;
      const gantiCara = recs.filter((r) => r.participantStatus === 'GANTI_CARA').length;
      const ulangan = recs.filter((r) => r.participantStatus === 'ULANGAN').length;

      return {
        id: v.id,
        name: v.name,
        assignedBidan: v.assignedBidanName || '-',
        total: recs.length,
        baru,
        kbpp,
        gantiCara,
        ulangan,
      };
    });
  }, [villages, filteredRecords, isBidanDesa, currentUser?.village, selectedVillage]);

  // Recent entries
  const recentRecords = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
      .slice(0, 5);
  }, [filteredRecords]);

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* HEADER REKAP DATA & FILTER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-emerald-700 font-semibold">
              {isAdminInduk
                ? `Admin Induk Dinas P3AKB${currentUser?.district ? ` · Kec. ${currentUser.district}` : ' · Semua Kecamatan'}`
                : isAdminKecamatan
                ? `Admin Kecamatan ${currentUser?.district || facility.district}`
                : `Admin Desa ${currentUser?.village || ''}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{facility.name}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
            {isBidanDesa
              ? `Ringkasan Pelayanan KB Desa ${currentUser?.village || ''}`
              : isAdminKecamatan
              ? `Monitoring Pelayanan KB Kecamatan ${facility.district}`
              : 'Ringkasan Eksekutif Pelayanan KB Kabupaten Bojonegoro'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBidanDesa
              ? `Data pelayanan akseptor KB wilayah Desa ${currentUser?.village || ''}`
              : isAdminKecamatan
              ? `Rekapitulasi dan kepatuhan pelaporan desa di wilayah Kecamatan ${facility.district}`
              : 'Rekapitulasi capaian pelayanan KB seluruh kecamatan dan desa se-Kabupaten Bojonegoro'}
          </p>
        </div>

        {/* Filter Periode & Wilayah */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Pilih Bulan */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value={0}>Semua Bulan</option>
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <span className="text-slate-300">·</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 cursor-pointer"
            >
              <option value={0}>Semua Tahun</option>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Pilih Wilayah */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={isBidanDesa}
              className="text-xs font-medium bg-transparent border-none focus:outline-none text-slate-800 disabled:opacity-80 cursor-pointer"
            >
              {!isBidanDesa && (
                <option value="SEMUA">
                  {isAdminKecamatan ? 'Semua Desa (Se-Kecamatan)' : 'Semua Desa'}
                </option>
              )}
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  Desa {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PROFIL KECAMATAN WIDGET (TAMPIL SAAT LOGIN USER KECAMATAN) */}
      {isAdminKecamatan && activeDistrictObj && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Profil Kecamatan {activeDistrictObj.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Identitas Resmi Kecamatan
                  </span>
                  {kecSaveSuccess && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Tersimpan Otomatis!</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identitas ini digunakan pada Kop Register Pelayanan KB, Laporan R/I/KB, Cetak PDF, dan Download Excel wilayah Kecamatan {activeDistrictObj.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsEditingKecProfile(!isEditingKecProfile)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border ${
                  isEditingKecProfile
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {isEditingKecProfile ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Selesai Edit Profil</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profil Kecamatan</span>
                  </>
                )}
              </button>
              {onNavigateAdmin && (
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Menu Lengkap &rarr;
                </button>
              )}
            </div>
          </div>

          {isEditingKecProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 animate-fade-in">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Instansi / Balai Penyuluhan KB Kecamatan
                </label>
                <input
                  type="text"
                  value={
                    activeDistrictObj.institutionName ??
                    `BALAI PENYULUHAN KB KECAMATAN ${activeDistrictObj.name.toUpperCase()}`
                  }
                  onChange={(e) => handleKecProfileFieldChange('institutionName', e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Register
                </label>
                <input
                  type="text"
                  value={activeDistrictObj.k0kbCode ?? facility.k0kbCode}
                  onChange={(e) => handleKecProfileFieldChange('k0kbCode', e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kecamatan
                </label>
                <input
                  type="text"
                  value={activeDistrictObj.name}
                  disabled
                  className="w-full text-xs py-2 px-3 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={activeDistrictObj.regency ?? facility.regency}
                  onChange={(e) => handleKecProfileFieldChange('regency', e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={activeDistrictObj.province ?? facility.province}
                  onChange={(e) => handleKecProfileFieldChange('province', e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor Kecamatan / Balai Penyuluhan KB
                </label>
                <input
                  type="text"
                  value={
                    activeDistrictObj.address ??
                    `Kecamatan ${activeDistrictObj.name}, Kabupaten ${facility.regency}, ${facility.province}`
                  }
                  onChange={(e) => handleKecProfileFieldChange('address', e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nama Instansi / Balai Penyuluhan KB
                </span>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                  {activeDistrictObj.institutionName ||
                    `BALAI PENYULUHAN KB KECAMATAN ${activeDistrictObj.name.toUpperCase()}`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activeDistrictObj.address ||
                    `Kecamatan ${activeDistrictObj.name}, ${activeDistrictObj.regency || facility.regency}`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Kode Register
                </span>
                <div className="text-sm font-mono font-black text-blue-950 mt-0.5">
                  {activeDistrictObj.k0kbCode || facility.k0kbCode}
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Kecamatan {activeDistrictObj.name}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Wilayah Administrasi
                </span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {activeDistrictObj.regency || facility.regency}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Provinsi {activeDistrictObj.province || facility.province}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPECIAL WIDGET FOR ADMIN KECAMATAN: MONITORING DESA BINAAN */}
      {isAdminKecamatan && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-4 sm:p-5 space-y-3 bg-gradient-to-br from-blue-50/40 via-white to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monitoring Kepatuhan Entri {villages.length} Desa Binaan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pantau desa mana saja yang sudah aktif mengentri dan desa yang belum melaporkan
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200">
              Kecamatan {facility.district}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {villages.map((v) => {
              const villageRecords = records.filter(
                (r) => r.village.toLowerCase() === v.name.toLowerCase()
              );
              const hasEntries = villageRecords.length > 0;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVillage(v.name)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                    selectedVillage === v.name
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Desa {v.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasEntries ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-black">{villageRecords.length}</span>
                    <span
                      className={`text-[10px] ${
                        selectedVillage === v.name ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      akseptor
                    </span>
                  </div>
                  <div
                    className={`text-[10px] truncate mt-1 ${
                      selectedVillage === v.name ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    Bidan: {v.assignedBidanName ? v.assignedBidanName.replace(/Bd\.\s*/, '') : 'Belum Ada'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KARTU REKAPITULASI STATUS MINIMALIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Pelayanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Pelayanan</span>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">{stats.total}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Seluruh tindakan KB</span>
          </div>
        </div>

        {/* 2. Peserta KB Baru (Bukan Pasca Salin) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">KB Baru (Bukan Pasca)</span>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-teal-700 font-mono tabular-nums">{stats.baruBukanPasca}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Akseptor pertama kali</span>
          </div>
        </div>

        {/* 3. KBPP (Pasca Persalinan) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">KBPP (Pasca Salin)</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">{stats.kbpp}</div>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Ibu pasca bersalin</span>
          </div>
        </div>

        {/* 4. Ulangan (Kunjungan Rutin) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Kunjungan Ulangan</span>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">{stats.ulangan}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Suntik / kontrol rutin</span>
          </div>
        </div>

        {/* 5. Ganti Cara */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-500">Ganti Cara</span>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">{stats.gantiCara}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Beralih metode KB</span>
          </div>
        </div>
      </div>

      {/* METRIK ALOKON (SUMBER LOGISTIK: APBN, APBD, MANDIRI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800">Alokon APBN</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Logistik program BKKBN pusat</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{stats.apbn}</span>
            <span className="text-[11px] text-slate-400 block">Akseptor</span>
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800">Alokon APBD</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Logistik pengadaan pemerintah daerah</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{stats.apbd}</span>
            <span className="text-[11px] text-slate-400 block">Akseptor</span>
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800">Alokon Mandiri</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Pengadaan mandiri atau mitra faskes</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{stats.mandiri}</span>
            <span className="text-[11px] text-slate-400 block">Akseptor</span>
          </div>
        </div>
      </div>

      {/* TABEL 1: REKAPITULASI PER METODE KONTRASEPSI (KOLOM KBPP & ULANGAN DIPISAH) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Rekapitulasi Pelayanan Berdasarkan Metode Kontrasepsi</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Rincian capaian setiap metode dengan kolom <b>KBPP</b> dan <b>Ulangan</b> dipisah secara jelas
            </p>
          </div>
          <button
            onClick={onNavigateRekap}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1"
          >
            <span>Formulir R/I/KB</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-center font-bold text-slate-800 border-b border-slate-300">
                <th className="border border-slate-300 p-2 w-10">No</th>
                <th className="border border-slate-300 p-2 text-left">Metode Kontrasepsi</th>
                <th className="border border-slate-300 p-2 w-20 bg-teal-50 text-teal-900">
                  Baru (Bukan)
                </th>
                {/* KOLOM KBPP DIPISAH */}
                <th className="border border-slate-300 p-2 w-24 bg-emerald-100 text-emerald-950 font-black">
                  KBPP (Pasca Salin)
                </th>
                <th className="border border-slate-300 p-2 w-20 bg-amber-50 text-amber-900">
                  Ganti Cara
                </th>
                {/* KOLOM ULANGAN DIPISAH */}
                <th className="border border-slate-300 p-2 w-20 bg-blue-100 text-blue-950 font-black">
                  Ulangan
                </th>
                <th className="border border-slate-300 p-2 w-24 bg-slate-200 font-extrabold text-slate-950">
                  Total Layanan
                </th>
                <th className="border border-slate-300 p-2 w-16 text-purple-900 bg-purple-50">APBN</th>
                <th className="border border-slate-300 p-2 w-16 text-indigo-900 bg-indigo-50">APBD</th>
                <th className="border border-slate-300 p-2 w-16 bg-slate-50">Mandiri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {methodMatrix.map((row, idx) => (
                <tr
                  key={row.key}
                  className="hover:bg-slate-50 even:bg-slate-50/50 text-center font-mono transition-colors"
                >
                  <td className="border border-slate-300 p-2 text-slate-500 font-sans">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 text-left font-sans font-bold text-slate-900">
                    {row.label}
                  </td>
                  <td className="border border-slate-300 p-2 bg-teal-50/40 text-teal-950">
                    {row.baru}
                  </td>
                  {/* CELL KBPP */}
                  <td className="border border-slate-300 p-2 bg-emerald-50 text-emerald-950 font-black">
                    {row.kbpp > 0 ? (
                      <span className="text-emerald-700 font-bold">{row.kbpp}</span>
                    ) : (
                      <span className="text-slate-300 font-normal">0</span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-2 bg-amber-50/40 text-amber-950">
                    {row.gantiCara}
                  </td>
                  {/* CELL ULANGAN */}
                  <td className="border border-slate-300 p-2 bg-blue-50 text-blue-950 font-black">
                    {row.ulangan > 0 ? (
                      <span className="text-blue-700 font-bold">{row.ulangan}</span>
                    ) : (
                      <span className="text-slate-300 font-normal">0</span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-2 font-bold bg-slate-100 text-slate-900">
                    {row.total}
                  </td>
                  <td className="border border-slate-300 p-2 text-purple-900 font-semibold">{row.apbn}</td>
                  <td className="border border-slate-300 p-2 text-indigo-900 font-semibold">{row.apbd}</td>
                  <td className="border border-slate-300 p-2 text-slate-600">{row.mandiri}</td>
                </tr>
              ))}
            </tbody>
            {/* TOTAL FOOTER ROW */}
            <tfoot>
              <tr className="bg-slate-200 font-black text-slate-950 text-center border-t-2 border-slate-400">
                <td colSpan={2} className="border border-slate-300 p-2 text-right uppercase font-sans">
                  JUMLAH TOTAL :
                </td>
                <td className="border border-slate-300 p-2 font-mono text-teal-950">{stats.baruBukanPasca}</td>
                <td className="border border-slate-300 p-2 font-mono bg-emerald-200 text-emerald-950 font-black">
                  {stats.kbpp}
                </td>
                <td className="border border-slate-300 p-2 font-mono text-amber-950">{stats.gantiCara}</td>
                <td className="border border-slate-300 p-2 font-mono bg-blue-200 text-blue-950 font-black">
                  {stats.ulangan}
                </td>
                <td className="border border-slate-300 p-2 font-mono bg-slate-300 text-slate-950 font-black">
                  {stats.total}
                </td>
                <td className="border border-slate-300 p-2 font-mono text-purple-950">{stats.apbn}</td>
                <td className="border border-slate-300 p-2 font-mono text-indigo-950">{stats.apbd}</td>
                <td className="border border-slate-300 p-2 font-mono text-slate-800">{stats.mandiri}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* TABEL 2: REKAPITULASI PER DESA (KBPP & ULANGAN DIPISAH) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>
              {isBidanDesa && currentUser?.village
                ? `Rekapitulasi Pelayanan Desa ${currentUser.village}`
                : 'Rekapitulasi Pelayanan per Desa Binaan'}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">
            {isBidanDesa && currentUser?.village
              ? `Capaian akseptor KB khusus wilayah binaan Desa ${currentUser.village} (${facility.name})`
              : `Sebaran capaian akseptor di masing-masing desa wilayah kerja ${facility.name}`}
          </p>
        </div>

        {villageMatrix.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 text-slate-500 text-xs space-y-1">
            <p className="font-semibold text-slate-700">Belum ada data desa binaan</p>
            <p className="text-[11px] text-slate-400">Seluruh desa telah dikosongkan. Anda dapat menambahkan desa baru pada menu Pengaturan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-center font-bold text-slate-800 border-b border-slate-300">
                <th className="border border-slate-300 p-2 w-10">No</th>
                <th className="border border-slate-300 p-2 text-left">Nama Desa</th>
                <th className="border border-slate-300 p-2 text-left">Bidan Desa Penanggung Jawab</th>
                <th className="border border-slate-300 p-2 w-20 bg-teal-50 text-teal-900">Baru</th>
                <th className="border border-slate-300 p-2 w-24 bg-emerald-100 text-emerald-950 font-black">
                  KBPP
                </th>
                <th className="border border-slate-300 p-2 w-20 bg-amber-50 text-amber-900">Ganti Cara</th>
                <th className="border border-slate-300 p-2 w-20 bg-blue-100 text-blue-950 font-black">
                  Ulangan
                </th>
                <th className="border border-slate-300 p-2 w-24 bg-slate-200 font-extrabold text-slate-950">
                  Total Layanan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {villageMatrix.map((v, i) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-50 even:bg-slate-50/50 text-center font-mono transition-colors"
                >
                  <td className="border border-slate-300 p-2 text-slate-500 font-sans">{i + 1}</td>
                  <td className="border border-slate-300 p-2 text-left font-sans font-bold text-slate-900">
                    Desa {v.name}
                  </td>
                  <td className="border border-slate-300 p-2 text-left font-sans text-slate-600 text-[11px]">
                    {v.assignedBidan}
                  </td>
                  <td className="border border-slate-300 p-2 bg-teal-50/40">{v.baru}</td>
                  <td className="border border-slate-300 p-2 bg-emerald-50 font-bold text-emerald-900">
                    {v.kbpp}
                  </td>
                  <td className="border border-slate-300 p-2 bg-amber-50/40">{v.gantiCara}</td>
                  <td className="border border-slate-300 p-2 bg-blue-50 font-bold text-blue-900">
                    {v.ulangan}
                  </td>
                  <td className="border border-slate-300 p-2 bg-slate-100 font-bold text-slate-900">
                    {v.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 font-black text-slate-950 text-center border-t-2 border-slate-400">
                <td colSpan={3} className="border border-slate-300 p-2 text-right uppercase font-sans">
                  {isBidanDesa && currentUser?.village
                    ? `TOTAL DESA ${currentUser.village.toUpperCase()} :`
                    : 'TOTAL SELURUH DESA :'}
                </td>
                <td className="border border-slate-300 p-2 font-mono text-teal-950">{stats.baruBukanPasca}</td>
                <td className="border border-slate-300 p-2 font-mono bg-emerald-200 text-emerald-950 font-black">
                  {stats.kbpp}
                </td>
                <td className="border border-slate-300 p-2 font-mono text-amber-950">{stats.gantiCara}</td>
                <td className="border border-slate-300 p-2 font-mono bg-blue-200 text-blue-950 font-black">
                  {stats.ulangan}
                </td>
                <td className="border border-slate-300 p-2 font-mono bg-slate-300 text-slate-950 font-black">
                  {stats.total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
