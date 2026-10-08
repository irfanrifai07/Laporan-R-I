import React, { useState, useMemo, useEffect } from 'react';
import { District, FacilityProfile, PatientRecord, User, Village } from '../types';
import {
  METHOD_SHORT_LABELS,
  ALOKON_KODE_OPTIONS,
  STATUS_PESERTA_KODE_LABELS,
  deriveR1KBRow,
  exportRegisterR1KBToExcel,
} from '../data/initialData';
import {
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  Edit2,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';

interface RegisterTableProps {
  records: PatientRecord[];
  villages: Village[];
  districts?: District[];
  onSelectDistrict?: (districtName: string) => void;
  facility: FacilityProfile;
  currentUser: User | null;
  onAddNew: () => void;
  onEdit: (record: PatientRecord) => void;
  onDelete: (id: string) => void;
  onOpenPrint: () => void;
  onClearRecords?: () => void;
}

export const RegisterTable: React.FC<RegisterTableProps> = ({
  records,
  villages,
  districts = [],
  onSelectDistrict,
  facility,
  currentUser,
  onAddNew,
  onEdit,
  onDelete,
  onOpenPrint,
  onClearRecords,
}) => {
  const isUserDesa =
    currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';
  const isAdminKecamatan = currentUser?.role === 'admin_kecamatan';
  const isAdminInduk =
    currentUser?.role === 'admin_induk' ||
    currentUser?.role === 'admin_kabupaten' ||
    !currentUser;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>(
    isUserDesa && currentUser?.village ? currentUser.village : 'SEMUA'
  );
  const [selectedMethod, setSelectedMethod] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [detailRecord, setDetailRecord] = useState<PatientRecord | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('table');

  useEffect(() => {
    if (isUserDesa && currentUser?.village) {
      setSelectedVillage(currentUser.village);
    } else {
      setSelectedVillage('SEMUA');
    }
  }, [currentUser?.village, currentUser?.district, isUserDesa]);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (
        selectedVillage !== 'SEMUA' &&
        r.village.toLowerCase() !== selectedVillage.toLowerCase()
      ) {
        return false;
      }
      if (selectedMethod !== 'SEMUA' && r.method !== selectedMethod) {
        return false;
      }
      if (selectedStatus !== 'SEMUA' && r.participantStatus !== selectedStatus) {
        return false;
      }
      if (r.serviceDate) {
        const [rYear, rMonth] = r.serviceDate.split('-').map(Number);
        if (selectedYear !== 0 && rYear !== selectedYear) return false;
        if (selectedMonth !== 0 && rMonth !== selectedMonth) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName =
          r.wifeName.toLowerCase().includes(q) ||
          (r.husbandName && r.husbandName.toLowerCase().includes(q));
        const matchNik =
          (r.wifeNik && r.wifeNik.includes(q)) ||
          (r.husbandNik && r.husbandNik.includes(q));
        const matchAddr = r.address && r.address.toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchAddr) return false;
      }
      return true;
    });
  }, [
    records,
    selectedVillage,
    selectedMethod,
    selectedStatus,
    selectedMonth,
    selectedYear,
    searchTerm,
  ]);

  const faskesDisplayName =
    selectedVillage !== 'SEMUA'
      ? `Pustu ${selectedVillage}`
      : isUserDesa && currentUser?.village
      ? `Pustu ${currentUser.village}`
      : facility.name;

  // Download Excel persis format Cetak PDF 24 Kolom R/I/KB/20
  const handleDownloadExcel = () => {
    const monthStr = selectedMonth > 0 ? monthNames[selectedMonth - 1] : 'Semua_Bulan';
    exportRegisterR1KBToExcel({
      records: filteredRecords,
      faskesName: faskesDisplayName,
      selectedMonth,
      selectedYear: selectedYear || 2026,
      filename: `Register_RIKB20_${monthStr}_${selectedYear || 'Semua'}.xls`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-0.5">
            <span className="text-emerald-700 font-semibold">
              {isAdminInduk
                ? `Admin Induk Dinas P3AKB${currentUser?.district ? ` · Kec. ${currentUser.district}` : ''}`
                : isAdminKecamatan
                ? `Admin Kecamatan ${currentUser?.district || facility.district}`
                : `Admin Desa ${currentUser?.village || ''}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-slate-900">R/I/KB/20</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {isUserDesa
              ? `Register Pelayanan KB Desa ${currentUser?.village || ''}`
              : isAdminKecamatan
              ? `Register Pelayanan KB Kecamatan ${facility.district}`
              : 'Register Pelayanan KB Kabupaten Bojonegoro'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulir Register Pelayanan KB Resmi BKKBN (24 Kolom Standar R/I/KB/20)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onAddNew}
            className="col-span-2 sm:order-3 inline-flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isUserDesa
                ? `+ Entri Pasien Desa ${currentUser?.village || ''}`
                : '+ Entri Register R/I/KB'}
            </span>
          </button>

          <button
            onClick={onOpenPrint}
            className="sm:order-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="sm:order-2 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Excel</span>
          </button>

          {isAdminInduk && records.length > 0 && onClearRecords && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data register pelayanan KB?'
                  )
                ) {
                  onClearRecords();
                }
              }}
              className="col-span-2 sm:order-4 inline-flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div
          className={`grid grid-cols-2 sm:grid-cols-2 ${
            isAdminInduk ? 'lg:grid-cols-7' : 'lg:grid-cols-6'
          } gap-2`}
        >
          <div className="col-span-2 lg:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Suami, Nama Istri, NIK 16 digit, Alamat..."
              className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 sm:top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
            >
              <option value={0}>Semua Bulan</option>
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Bulan: {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
            >
              <option value={0}>Semua Tahun</option>
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
            </select>
          </div>

          {isAdminInduk && (
            <div>
              <select
                value={currentUser?.district || 'SEMUA'}
                onChange={(e) => {
                  setSelectedVillage('SEMUA');
                  if (onSelectDistrict) onSelectDistrict(e.target.value);
                }}
                className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-semibold rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="SEMUA">Semua Kecamatan</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>
                    Kec. {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={isUserDesa}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 font-medium rounded-xl focus:bg-white focus:outline-none disabled:opacity-75"
            >
              {!isUserDesa && (
                <option value="SEMUA">
                  {currentUser?.district ? `Semua Desa (${currentUser.district})` : 'Semua Desa'}
                </option>
              )}
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  Desa {v.name}{!currentUser?.district && v.district ? ` (${v.district})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="SEMUA">Semua Metode KB</option>
              {Object.entries(METHOD_SHORT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  Metode: {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs my-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {records.length === 0
              ? 'Belum Ada Data Register Pelayanan KB'
              : 'Tidak Ada Data yang Sesuai Filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Silakan klik tombol di bawah untuk mengentri data pelayanan KB baru sesuai format R/I/KB/20 (Kolom 1 s/d 24).
          </p>
          <button
            onClick={onAddNew}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Entri Data Pasien KB Baru</span>
          </button>
        </div>
      )}

      {/* VIEW MODE SWITCHER FOR MOBILE */}
      {filteredRecords.length > 0 && (
        <div className="md:hidden flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-700 pl-1">
            Total: <span className="text-emerald-700">{filteredRecords.length} Pasien</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMobileViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mobileViewMode === 'cards'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Kartu HP
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mobileViewMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Tabel R/I/KB (24 Kolom)
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {filteredRecords.length > 0 && mobileViewMode === 'cards' && (
        <div className="md:hidden space-y-3">
          {filteredRecords.map((r, index) => {
            const d = deriveR1KBRow(r);
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span className="font-bold text-slate-800">#{index + 1}</span>
                      <span>•</span>
                      <span>{d.tanggalFormatted}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Kode Status: {d.col9}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{d.wifeName}</h4>
                    <p className="text-xs text-slate-600">
                      NIK: <span className="font-mono font-semibold">{r.wifeNik || '-'}</span> • Tgl Lahir:{' '}
                      <span className="font-mono">{d.wifeDobFormatted}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Suami: <span className="font-semibold text-slate-800">{d.husbandName}</span> • Alamat:{' '}
                      <span className="font-semibold">{d.alamat}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white font-mono">
                      Kode Alokon: {d.col13 || d.col14 || d.col15}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailRecord(r)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Hapus data register ${r.wifeName}?`)) {
                        onDelete(r.id);
                      }
                    }}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFICIAL BKKBN R/I/KB/20 TABLE (PERSIS 24 KOLOM SEPERTI GAMBAR) */}
      {filteredRecords.length > 0 && (
        <div
          className={`${
            mobileViewMode === 'cards' ? 'hidden md:block' : 'block'
          } bg-white rounded-2xl border border-slate-400 shadow-xs overflow-hidden p-3 sm:p-5 space-y-3`}
        >
          {/* KOP FORMULIR R/I/KB/20 PERSIS DOKUMEN */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 pb-2 text-xs text-slate-900">
            {/* Left: 1. Petugas Entri Data & Nama Faskes */}
            <div className="space-y-2">
              <div className="border border-slate-800 px-3 py-1.5 w-44 text-[11px] font-medium leading-tight">
                1. Petugas Entri
                <br />
                Data
              </div>
              <div className="flex items-baseline space-x-2 text-xs">
                <span className="font-semibold uppercase leading-tight">
                  NAMA FASKES/
                  <br />
                  JARINGAN/JEJARING
                </span>
                <span>:</span>
                <span className="border-b border-slate-800 px-2 pb-0.5 min-w-[180px] font-semibold">
                  {faskesDisplayName}
                </span>
              </div>
            </div>

            {/* Center: REGISTER PELAYANAN KB + Kotak Kode */}
            <div className="flex flex-col items-center mx-auto">
              <h3 className="text-lg sm:text-xl font-normal tracking-wide uppercase text-slate-950 mb-2">
                REGISTER PELAYANAN KB
              </h3>
              <div className="flex items-start gap-2 text-center font-mono text-xs">
                <div>
                  <div className="flex border border-slate-800">
                    <span className="w-6 h-6 flex items-center justify-center border-r border-slate-800 font-bold">
                      3
                    </span>
                    <span className="w-6 h-6 flex items-center justify-center font-bold">5</span>
                  </div>
                  <span className="text-[9px] font-sans block mt-0.5">Kode Provinsi</span>
                </div>
                <div>
                  <div className="flex border border-slate-800">
                    <span className="w-6 h-6 flex items-center justify-center border-r border-slate-800 font-bold">
                      2
                    </span>
                    <span className="w-6 h-6 flex items-center justify-center font-bold">2</span>
                  </div>
                  <span className="text-[9px] font-sans block mt-0.5 leading-tight">
                    Kode
                    <br />
                    Kabupaten/Kota
                  </span>
                </div>
                <div>
                  <div className="flex border border-slate-800">
                    <span className="w-6 h-6 flex items-center justify-center border-r border-slate-800 font-bold">
                      0
                    </span>
                    <span className="w-6 h-6 flex items-center justify-center border-r border-slate-800 font-bold">
                      0
                    </span>
                    <span className="w-6 h-6 flex items-center justify-center font-bold">4</span>
                  </div>
                  <span className="text-[9px] font-sans block mt-0.5">No. Register Faskes</span>
                </div>
                <div>
                  <div className="flex border border-slate-800">
                    <span className="w-6 h-6 flex items-center justify-center border-r border-slate-800 font-bold">
                      0
                    </span>
                    <span className="w-6 h-6 flex items-center justify-center font-bold">2</span>
                  </div>
                  <span className="text-[9px] font-sans block mt-0.5 leading-tight">
                    No. Jaringan/
                    <br />
                    Jejaring Faskes
                  </span>
                </div>
              </div>
            </div>

            {/* Right: R/I/KB/20, Lembar, Bulan & Tahun */}
            <div className="flex flex-col items-end space-y-2 self-end">
              <div className="flex items-end space-x-4">
                <div className="bg-black text-white font-bold px-3 py-1 text-xs tracking-wider">
                  R/I/KB/20
                </div>
                <div className="text-[11px]">
                  Lembar <span className="border-b border-slate-800 px-3">1</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <span>Bulan :</span>
                <div className="border border-slate-800 text-[10px] font-mono">
                  <div className="grid grid-cols-6 border-b border-slate-800">
                    {[1, 2, 3, 4, 5, 6].map((m) => (
                      <span
                        key={m}
                        className="w-5 h-4 flex items-center justify-center border-r last:border-r-0 border-slate-800"
                      >
                        {selectedMonth === m ? 'V' : m}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-6">
                    {[7, 8, 9, 10, 11, 12].map((m) => (
                      <span
                        key={m}
                        className="w-5 h-4 flex items-center justify-center border-r last:border-r-0 border-slate-800 font-bold"
                      >
                        {selectedMonth === m || (selectedMonth === 0 && m === 9) ? 'V' : m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border border-slate-800 px-2.5 py-1.5 font-mono font-bold text-xs">
                  {selectedYear || 2026}
                </div>
              </div>
            </div>
          </div>

          {/* TABEL 24 KOLOM R/I/KB/20 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-slate-800 text-slate-950 min-w-[1440px]">
              <thead>
                {/* ROW 1 HEADER */}
                <tr className="text-center font-normal bg-white">
                  <th rowSpan={3} className="border border-slate-800 p-1 w-8">
                    NO.
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-20">
                    TANGGAL
                  </th>
                  <th colSpan={21} className="border border-slate-800 p-1">
                    PESERTA KB
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-9">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[10px] leading-tight py-1">
                      STATUS PESERTA KB (Kode)
                    </div>
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[10px] leading-tight py-1">
                      INFORMED CONSENT
                    </div>
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[10px] leading-tight py-1">
                      PASCA PERSALINAN
                    </div>
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[10px] leading-tight py-1">
                      PASCA KEGUGURAN
                    </div>
                  </th>
                  <th colSpan={3} rowSpan={2} className="border border-slate-800 p-1">
                    JENIS TINDAKAN
                    <br />
                    (Kode)
                  </th>
                  <th colSpan={2} rowSpan={2} className="border border-slate-800 p-1">
                    Kasus
                    <br />
                    (Kode)
                  </th>
                  <th colSpan={3} rowSpan={2} className="border border-slate-800 p-1">
                    PENGGUNAAN
                    <br />
                    ASURANSI
                  </th>
                  <th colSpan={3} rowSpan={2} className="border border-slate-800 p-1">
                    SUMBER ALOKON
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[10px] leading-tight py-1">
                      PELAYANAN BERGERAK
                    </div>
                  </th>
                  <th rowSpan={3} className="border border-slate-800 p-1 w-16 bg-slate-100 print:hidden">
                    AKSI
                  </th>
                </tr>

                {/* ROW 2 HEADER */}
                <tr className="text-center font-normal bg-white">
                  <th rowSpan={2} className="border border-slate-800 p-1.5 w-32">
                    NAMA SUAMI
                  </th>
                  <th colSpan={18} className="border border-slate-800 p-1">
                    ISTRI
                  </th>
                  <th rowSpan={2} className="border border-slate-800 p-1.5 w-32">
                    ALAMAT
                  </th>
                  <th rowSpan={2} className="border border-slate-800 p-1.5 w-24">
                    NO. HANDPHONE
                  </th>
                </tr>

                {/* ROW 3 HEADER */}
                <tr className="text-center font-normal bg-white text-[10px]">
                  <th colSpan={16} className="border border-slate-800 p-1">
                    NIK (NOMOR INDUK KEPENDUDUKAN)
                  </th>
                  <th className="border border-slate-800 p-1 w-32">NAMA</th>
                  <th className="border border-slate-800 p-1 w-20">
                    TANGGAL
                    <br />
                    LAHIR
                  </th>
                  {/* 13, 14, 15 */}
                  <th className="border border-slate-800 p-1 w-10">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      OPERATIF / PEMBERIAN / PEMASANGAN
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-9">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      PENCABUTAN DAN PEMASANGAN
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      PENCABUTAN
                    </div>
                  </th>
                  {/* 16, 17 */}
                  <th className="border border-slate-800 p-1 w-9">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      KOMPLIKASI BERAT
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      KEGAGALAN
                    </div>
                  </th>
                  {/* 18, 19, 20 */}
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      BPJS KESEHATAN
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      LAINNYA
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      TIDAK
                    </div>
                  </th>
                  {/* 21, 22, 23 */}
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      APBN
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      APBD
                    </div>
                  </th>
                  <th className="border border-slate-800 p-1 w-8">
                    <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                      MANDIRI
                    </div>
                  </th>
                </tr>

                {/* ROW 4: NOMOR KOLOM 1 s/d 24 */}
                <tr className="text-center text-[10px] font-normal bg-white border-b border-slate-800">
                  <th className="border border-slate-800 py-0.5">1</th>
                  <th className="border border-slate-800 py-0.5">2</th>
                  <th className="border border-slate-800 py-0.5">3</th>
                  <th colSpan={16} className="border border-slate-800 py-0.5">
                    4
                  </th>
                  <th className="border border-slate-800 py-0.5">5</th>
                  <th className="border border-slate-800 py-0.5">6</th>
                  <th className="border border-slate-800 py-0.5">7</th>
                  <th className="border border-slate-800 py-0.5">8</th>
                  <th className="border border-slate-800 py-0.5">9</th>
                  <th className="border border-slate-800 py-0.5">10</th>
                  <th className="border border-slate-800 py-0.5">11</th>
                  <th className="border border-slate-800 py-0.5">12</th>
                  <th className="border border-slate-800 py-0.5">13</th>
                  <th className="border border-slate-800 py-0.5">14</th>
                  <th className="border border-slate-800 py-0.5">15</th>
                  <th className="border border-slate-800 py-0.5">16</th>
                  <th className="border border-slate-800 py-0.5">17</th>
                  <th className="border border-slate-800 py-0.5">18</th>
                  <th className="border border-slate-800 py-0.5">19</th>
                  <th className="border border-slate-800 py-0.5">20</th>
                  <th className="border border-slate-800 py-0.5">21</th>
                  <th className="border border-slate-800 py-0.5">22</th>
                  <th className="border border-slate-800 py-0.5">23</th>
                  <th className="border border-slate-800 py-0.5">24</th>
                  <th className="border border-slate-800 py-0.5 bg-slate-100 print:hidden">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((r, index) => {
                  const d = deriveR1KBRow(r);
                  return (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* 1: NO */}
                      <td className="border border-slate-800 p-1.5 text-center">{index + 1}</td>
                      {/* 2: TANGGAL */}
                      <td className="border border-slate-800 p-1.5 text-center whitespace-nowrap">
                        {d.tanggalFormatted}
                      </td>
                      {/* 3: NAMA SUAMI */}
                      <td className="border border-slate-800 p-1.5 uppercase">{d.husbandName}</td>
                      {/* 4: 16 KOTAK DIGIT NIK ISTRI */}
                      {d.nikDigits.map((digit, dIdx) => (
                        <td
                          key={dIdx}
                          className="border border-slate-800 px-1 py-1.5 text-center font-mono text-[10px] w-4"
                        >
                          {digit}
                        </td>
                      ))}
                      {/* 5: NAMA ISTRI */}
                      <td className="border border-slate-800 p-1.5 uppercase">{d.wifeName}</td>
                      {/* 6: TANGGAL LAHIR */}
                      <td className="border border-slate-800 p-1.5 text-center whitespace-nowrap">
                        {d.wifeDobFormatted}
                      </td>
                      {/* 7: ALAMAT */}
                      <td className="border border-slate-800 p-1.5 uppercase">{d.alamat}</td>
                      {/* 8: NO. HANDPHONE */}
                      <td className="border border-slate-800 p-1.5 text-center font-mono text-[10px]">
                        {d.phone}
                      </td>
                      {/* 9: STATUS PESERTA KB (Kode) */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col9}</td>
                      {/* 10: INFORMED CONSENT */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col10}</td>
                      {/* 11: PASCA PERSALINAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col11}</td>
                      {/* 12: PASCA KEGUGURAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col12}</td>
                      {/* 13: OPERATIF / PEMBERIAN / PEMASANGAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col13}</td>
                      {/* 14: PENCABUTAN DAN PEMASANGAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col14}</td>
                      {/* 15: PENCABUTAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col15}</td>
                      {/* 16: KOMPLIKASI BERAT */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col16}</td>
                      {/* 17: KEGAGALAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col17}</td>
                      {/* 18: BPJS KESEHATAN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col18}</td>
                      {/* 19: LAINNYA */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col19}</td>
                      {/* 20: TIDAK */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col20}</td>
                      {/* 21: APBN */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col21}</td>
                      {/* 22: APBD */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col22}</td>
                      {/* 23: MANDIRI */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col23}</td>
                      {/* 24: PELAYANAN BERGERAK */}
                      <td className="border border-slate-800 p-1.5 text-center">{d.col24}</td>

                      {/* AKSI */}
                      <td className="border border-slate-800 p-1 text-center whitespace-nowrap bg-slate-50 print:hidden">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setDetailRecord(r)}
                            className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                            title="Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data register ${r.wifeName}?`)) {
                                onDelete(r.id);
                              }
                            }}
                            className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* KETERANGAN KODE PERSIS SEPERTI DOKUMEN R/I/KB/20 */}
          <div className="pt-2 space-y-2 text-[11px] text-slate-900">
            <div className="font-medium">1) Keterangan Kode</div>
            <table className="border-collapse border border-slate-800 text-[10px] w-full max-w-5xl">
              <thead>
                <tr className="text-center font-medium">
                  <th colSpan={2} className="border border-slate-800 py-1 px-3 w-1/3">
                    STATUS PESERTA KB
                  </th>
                  <th colSpan={6} className="border border-slate-800 py-1 px-3">
                    KODE JENIS ALOKON (Diisi Pada Jenis Tindakan dan Kasus)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-l border-slate-800 py-1 px-3">1 : Peserta KB Baru</td>
                  <td className="border-r border-slate-800 py-1 px-3">3 : Peserta KB Ulangan</td>
                  <td className="py-1 px-2">1 : Suntikan 1 Bulanan</td>
                  <td className="py-1 px-2">3 : Suntikan 3 Bulanan</td>
                  <td className="py-1 px-2">5 : Pil Progestin</td>
                  <td className="py-1 px-2">7 : Implan 1 Batang</td>
                  <td className="py-1 px-2">9 : IUD</td>
                  <td className="border-r border-slate-800 py-1 px-2">11 : Tubektomi</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="border-l border-slate-800 py-1 px-3">2 : Peserta KB Ganti</td>
                  <td className="border-r border-slate-800 py-1 px-3">4 : Komplikasi</td>
                  <td className="py-1 px-2">2 : Suntikan 3 Bulanan</td>
                  <td className="py-1 px-2">4 : Pil Kombinasi</td>
                  <td className="py-1 px-2">6 : Kondom</td>
                  <td className="py-1 px-2">8 : Implan 2 Batang</td>
                  <td className="py-1 px-2" colSpan={2}>
                    10 : Vasektomi
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="font-medium">
              2) SELAIN STATUS PESERTA KB, JENIS TINDAKAN DAN KASUS DIISI TANDA CENTANG (V)
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                  FORMULIR R/I/KB/20 • {detailRecord.serviceDate}
                </span>
                <h3 className="text-lg font-bold mt-0.5 uppercase">{detailRecord.wifeName}</h3>
                <p className="text-xs text-slate-300">
                  Suami: {detailRecord.husbandName || '-'} • Alamat: {detailRecord.address}
                </p>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const d = deriveR1KBRow(detailRecord);
              const alokonLabel =
                ALOKON_KODE_OPTIONS.find(
                  (o) => o.code === Number(d.col13 || d.col14 || d.col15)
                )?.label || detailRecord.method;
              return (
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rincian Kolom 1 s/d 24 (R/I/KB/20)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">(2) Tanggal:</span>
                        <span className="font-bold text-slate-900">{d.tanggalFormatted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(3) Nama Suami:</span>
                        <span className="font-bold text-slate-900">{d.husbandName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">(4) NIK Istri (16 Digit):</span>
                        <span className="font-mono font-bold text-slate-900 tracking-widest">
                          {detailRecord.wifeNik || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(5) Nama Istri:</span>
                        <span className="font-bold text-slate-900">{d.wifeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(6) Tanggal Lahir:</span>
                        <span className="font-bold text-slate-900">{d.wifeDobFormatted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(7) Alamat:</span>
                        <span className="font-bold text-slate-900">{d.alamat}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(8) No. Handphone:</span>
                        <span className="font-mono font-bold text-slate-900">{d.phone || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(9) Status Peserta KB:</span>
                        <span className="font-bold text-emerald-700">
                          {STATUS_PESERTA_KODE_LABELS[d.col9] || d.col9}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(13-15) Jenis Tindakan:</span>
                        <span className="font-bold text-slate-900">{alokonLabel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(18-20) Asuransi:</span>
                        <span className="font-bold text-slate-900">
                          {d.col18 ? 'BPJS Kesehatan' : d.col19 ? 'Lainnya' : 'Tidak'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">(21-23) Sumber Alokon:</span>
                        <span className="font-bold text-slate-900">
                          {d.col21 ? 'APBN' : d.col22 ? 'APBD' : 'MANDIRI'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  const rec = detailRecord;
                  setDetailRecord(null);
                  onEdit(rec);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Edit Data
              </button>
              <button
                onClick={() => setDetailRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
