import React, { useState, useMemo, useEffect } from 'react';
import { ContraceptiveMethod, FacilityProfile, PatientRecord, User, Village } from '../types';
import {
  METHOD_SHORT_LABELS,
  STATUS_LABELS,
  ACTION_LABELS,
  ALOKON_LABELS,
} from '../data/initialData';
import {
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  X,
  Stethoscope,
  UserCheck,
  Heart,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

interface RegisterTableProps {
  records: PatientRecord[];
  villages: Village[];
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>(
    isUserDesa && currentUser?.village ? currentUser.village : 'SEMUA'
  );
  const [selectedMethod, setSelectedMethod] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [detailRecord, setDetailRecord] = useState<PatientRecord | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Otomatis sinkronkan filter wilayah saat berganti akun
  useEffect(() => {
    if (isUserDesa && currentUser?.village) {
      setSelectedVillage(currentUser.village);
    } else {
      setSelectedVillage('SEMUA');
    }
  }, [currentUser, isUserDesa]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedVillage !== 'SEMUA' && r.village.toLowerCase() !== selectedVillage.toLowerCase()) {
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
        const matchName = r.wifeName.toLowerCase().includes(q) || (r.husbandName && r.husbandName.toLowerCase().includes(q));
        const matchNik = (r.wifeNik && r.wifeNik.includes(q)) || (r.husbandNik && r.husbandNik.includes(q));
        const matchReg = r.registerNumber.toLowerCase().includes(q);
        const matchAddr = r.address && r.address.toLowerCase().includes(q);
        if (!matchName && !matchNik && !matchReg && !matchAddr) return false;
      }
      return true;
    });
  }, [records, selectedVillage, selectedMethod, selectedStatus, selectedMonth, selectedYear, searchTerm]);

  // Aggregate summaries for bottom row
  const summary = useMemo(() => {
    let totalAnakL = 0;
    let totalAnakP = 0;
    let totalBaru = 0;
    let totalKbpp = 0;
    let totalGantiCara = 0;
    let totalUlangan = 0;
    let totalApbn = 0;
    let totalMandiri = 0;

    filteredRecords.forEach((r) => {
      totalAnakL += r.aliveChildrenMale || 0;
      totalAnakP += r.aliveChildrenFemale || 0;
      if (r.participantStatus === 'BARU_PASCA_SALIN') {
        totalKbpp += 1;
      } else if (r.participantStatus === 'BARU_BUKAN_PASCA' || r.participantStatus === 'BARU_PASCA_GUGUR') {
        totalBaru += 1;
      } else if (r.participantStatus === 'GANTI_CARA') {
        totalGantiCara += 1;
      } else if (r.participantStatus === 'ULANGAN') {
        totalUlangan += 1;
      }

      if (r.alokonSource === 'APBN') {
        totalApbn += 1;
      } else {
        totalMandiri += 1;
      }
    });

    return {
      total: filteredRecords.length,
      totalAnakL,
      totalAnakP,
      totalBaru,
      totalKbpp,
      totalGantiCara,
      totalUlangan,
      totalApbn,
      totalMandiri,
    };
  }, [filteredRecords]);

  const getStatusLabelPlain = (status: string) => {
    switch (status) {
      case 'BARU_PASCA_SALIN':
        return 'KBPP';
      case 'BARU_BUKAN_PASCA':
        return 'Baru';
      case 'BARU_PASCA_GUGUR':
        return 'Pasca Gugur';
      case 'GANTI_CARA':
        return 'Ganti Cara';
      case 'ULANGAN':
        return 'Ulangan';
      default:
        return status;
    }
  };

  // Download Excel dengan tampilan dan struktur tabel sama persis seperti di aplikasi
  const handleDownloadExcel = () => {
    const periodLabel = `${selectedMonth > 0 ? monthNames[selectedMonth - 1].toUpperCase() : 'SEMUA BULAN'} ${selectedYear || 'SEMUA TAHUN'}`;
    const regionLabel = selectedVillage === 'SEMUA' ? 'SELURUH DESA' : `DESA ${selectedVillage.toUpperCase()}`;

    const rowsHtml = filteredRecords
      .map((r, index) => {
        const bgRow = index % 2 === 1 ? '#f8fafc' : '#ffffff';
        const statusText = getStatusLabelPlain(r.participantStatus);
        const statusBg =
          r.participantStatus === 'BARU_PASCA_SALIN'
            ? '#d1fae5'
            : r.participantStatus === 'BARU_BUKAN_PASCA'
            ? '#ccfbf1'
            : r.participantStatus === 'GANTI_CARA'
            ? '#fef3c7'
            : r.participantStatus === 'ULANGAN'
            ? '#dbeafe'
            : '#f1f5f9';
        const sideEffectText =
          r.complications && r.complications !== 'Tidak Ada'
            ? r.complications
            : r.sideEffects && r.sideEffects !== 'Tidak Ada'
            ? r.sideEffects
            : '-';

        return `
          <tr style="background-color:${bgRow};">
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; font-weight:bold;">${index + 1}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; mso-number-format:'\\@';">${r.serviceDate || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; font-weight:bold; mso-number-format:'\\@';">${r.registerNumber || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; font-family:Consolas,monospace; font-weight:bold; mso-number-format:'\\@';">${r.wifeNik || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; font-weight:bold;">${r.wifeName || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace;">${r.wifeAge}</td>
            <td style="border:1px solid #475569; padding:5px;">${r.husbandName || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; font-family:Consolas,monospace; mso-number-format:'\\@';">${r.husbandNik || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; font-weight:600;">Desa ${r.village}</td>
            <td style="border:1px solid #475569; padding:5px;">${r.address || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; font-weight:bold;">${r.aliveChildrenMale}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; font-weight:bold;">${r.aliveChildrenFemale}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace;">${r.youngestChildAgeMonths > 0 ? `${r.youngestChildAgeMonths} bln` : '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-weight:bold; background-color:${statusBg};">${statusText}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-weight:bold; color:#064e3b;">${METHOD_SHORT_LABELS[r.method] || r.method}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-weight:bold;">${r.alokonSource}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center;">${ACTION_LABELS[r.actionType] || r.actionType}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; mso-number-format:'\\@';">${r.bloodPressure || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace;">${r.weightKg > 0 ? r.weightKg : '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center; font-family:Consolas,monospace; mso-number-format:'\\@';">${r.hpht || '-'}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center;">${sideEffectText}</td>
            <td style="border:1px solid #475569; padding:5px; text-align:center;">${r.referralStatus === 'TIDAK' ? 'Tidak' : 'Rujuk'}</td>
            <td style="border:1px solid #475569; padding:5px;">${r.officerName || '-'}</td>
          </tr>
        `;
      })
      .join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Register Pelayanan KB</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="font-family:Arial,sans-serif; font-size:10pt; color:#0f172a;">
        <table style="border-collapse:collapse; width:100%;">
          <tr>
            <td colspan="10" style="font-family:Consolas,monospace; font-size:9pt; font-weight:bold; padding:2px;">
              KODE REGISTER: ${facility.k0kbCode} &bull; FORMULIR R/I/KB
            </td>
            <td colspan="13" style="font-family:Consolas,monospace; font-size:9pt; font-weight:bold; text-align:right; padding:2px;">
              PROVINSI: ${facility.province.toUpperCase()} &bull; KABUPATEN: ${facility.regency.toUpperCase()} &bull; KECAMATAN: ${facility.district.toUpperCase()}
            </td>
          </tr>
          <tr>
            <td colspan="23" style="text-align:center; font-size:13pt; font-weight:bold; padding-top:6px;">
              REGISTER PELAYANAN KELUARGA BERENCANA FASILITAS KESEHATAN
            </td>
          </tr>
          <tr>
            <td colspan="23" style="text-align:center; font-size:11pt; font-weight:bold;">
              ${facility.name.toUpperCase()}
            </td>
          </tr>
          <tr>
            <td colspan="23" style="text-align:center; font-size:9.5pt; font-weight:bold; padding-bottom:10px;">
              PERIODE LAPORAN: ${periodLabel} &bull; CAKUPAN WILAYAH: ${regionLabel}
            </td>
          </tr>
        </table>

        <table style="border-collapse:collapse; width:100%; font-size:9.5pt;">
          <thead>
            <tr style="background-color:#e2e8f0; text-align:center; font-weight:bold;">
              <th rowspan="2" style="border:1px solid #334155; padding:6px;">NO</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px;">TANGGAL PELAYANAN</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px;">NO. REGISTER / SERI KARTU</th>
              <th colspan="3" style="border:1px solid #334155; padding:6px; background-color:#d1fae5; color:#022c22;">IDENTITAS PESERTA KB (ISTRI)</th>
              <th colspan="2" style="border:1px solid #334155; padding:6px; background-color:#ccfbf1; color:#042f2e;">IDENTITAS SUAMI</th>
              <th colspan="2" style="border:1px solid #334155; padding:6px; background-color:#e0f2fe; color:#082f49;">ALAMAT DOMISILI</th>
              <th colspan="2" style="border:1px solid #334155; padding:6px; background-color:#dbeafe; color:#172554;">JUMLAH ANAK HIDUP</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#eff6ff;">UMUR ANAK TERKECIL</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#fef3c7; color:#451a03;">STATUS PESERTA KB</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#d1fae5; color:#022c22;">METODE KONTRASEPSI</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#f3e8ff; color:#3b0764;">SUMBER ALOKON</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#e0e7ff; color:#1e1b4b;">JENIS TINDAKAN</th>
              <th colspan="3" style="border:1px solid #334155; padding:6px; background-color:#ffe4e6; color:#4c0519;">PENAPISAN / PEMERIKSAAN MEDIS</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px; background-color:#fff1f2;">EFEK SAMPING / KOMPLIKASI</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px;">RUJUKAN</th>
              <th rowspan="2" style="border:1px solid #334155; padding:6px;">PEMBERI PELAYANAN / PETUGAS</th>
            </tr>
            <tr style="background-color:#f1f5f9; text-align:center; font-weight:bold; font-size:9pt;">
              <th style="border:1px solid #334155; padding:5px; background-color:#ecfdf5;">NIK Istri (16 Digit)</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#ecfdf5;">Nama Lengkap Istri</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#ecfdf5;">Umur (Thn)</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#f0fdfa;">Nama Suami</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#f0fdfa;">NIK Suami</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#f0f9ff;">Desa / Kel.</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#f0f9ff;">RT/RW / Alamat</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#eff6ff;">L</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#eff6ff;">P</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#fff1f2;">TD (mmHg)</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#fff1f2;">BB (kg)</th>
              <th style="border:1px solid #334155; padding:5px; background-color:#fff1f2;">HPHT</th>
            </tr>
            <tr style="background-color:#f8fafc; text-align:center; font-family:Consolas,monospace; font-size:8.5pt; color:#475569;">
              <th style="border:1px solid #334155; padding:3px;">(1)</th>
              <th style="border:1px solid #334155; padding:3px;">(2)</th>
              <th style="border:1px solid #334155; padding:3px;">(3)</th>
              <th style="border:1px solid #334155; padding:3px;">(4)</th>
              <th style="border:1px solid #334155; padding:3px;">(5)</th>
              <th style="border:1px solid #334155; padding:3px;">(6)</th>
              <th style="border:1px solid #334155; padding:3px;">(7)</th>
              <th style="border:1px solid #334155; padding:3px;">(8)</th>
              <th style="border:1px solid #334155; padding:3px;">(9)</th>
              <th style="border:1px solid #334155; padding:3px;">(10)</th>
              <th style="border:1px solid #334155; padding:3px;">(11)</th>
              <th style="border:1px solid #334155; padding:3px;">(12)</th>
              <th style="border:1px solid #334155; padding:3px;">(13)</th>
              <th style="border:1px solid #334155; padding:3px;">(14)</th>
              <th style="border:1px solid #334155; padding:3px;">(15)</th>
              <th style="border:1px solid #334155; padding:3px;">(16)</th>
              <th style="border:1px solid #334155; padding:3px;">(17)</th>
              <th style="border:1px solid #334155; padding:3px;">(18)</th>
              <th style="border:1px solid #334155; padding:3px;">(19)</th>
              <th style="border:1px solid #334155; padding:3px;">(20)</th>
              <th style="border:1px solid #334155; padding:3px;">(21)</th>
              <th style="border:1px solid #334155; padding:3px;">(22)</th>
              <th style="border:1px solid #334155; padding:3px;">(23)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color:#e2e8f0; font-weight:bold; text-align:center;">
              <td colspan="10" style="border:1px solid #334155; padding:6px; text-align:right;">
                JUMLAH / TOTAL TERLAYANI (${summary.total} PASIEN) :
              </td>
              <td style="border:1px solid #334155; padding:6px; font-family:Consolas,monospace;">${summary.totalAnakL}</td>
              <td style="border:1px solid #334155; padding:6px; font-family:Consolas,monospace;">${summary.totalAnakP}</td>
              <td style="border:1px solid #334155; padding:6px;">-</td>
              <td style="border:1px solid #334155; padding:6px;">
                Baru: ${summary.totalBaru} | KBPP: ${summary.totalKbpp} | Ganti: ${summary.totalGantiCara} | Ulang: ${summary.totalUlangan}
              </td>
              <td style="border:1px solid #334155; padding:6px; color:#064e3b;">${summary.total} Akseptor</td>
              <td style="border:1px solid #334155; padding:6px;">APBN: ${summary.totalApbn}</td>
              <td colspan="7" style="border:1px solid #334155; padding:6px; text-align:left; color:#475569;">
                Kondisi: Terdata Lengkap
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', excelHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const monthStr = selectedMonth > 0 ? monthNames[selectedMonth - 1] : 'Semua_Bulan';
    link.download = `Register_Pelayanan_KB_${monthStr}_${selectedYear || 'Semua'}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BARU_PASCA_SALIN':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            KBPP
          </span>
        );
      case 'BARU_BUKAN_PASCA':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
            Baru
          </span>
        );
      case 'BARU_PASCA_GUGUR':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            Pasca Gugur
          </span>
        );
      case 'GANTI_CARA':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Ganti Cara
          </span>
        );
      case 'ULANGAN':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">
            Ulangan
          </span>
        );
      default:
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

    const isBidanDesa = currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';
    const isAdminKecamatan = currentUser?.role === 'admin_kecamatan';
    const isAdminInduk = currentUser?.role === 'admin_induk' || currentUser?.role === 'admin_kabupaten' || !currentUser;

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
              <span>Formulir R/I/KB</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {isBidanDesa
                ? `Register Pelayanan KB Desa ${currentUser?.village || ''}`
                : isAdminKecamatan
                ? `Register Pelayanan KB Kecamatan ${facility.district}`
                : 'Register Pelayanan KB Kabupaten Bojonegoro'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBidanDesa
                ? `Pencatatan akseptor KB wilayah Desa ${currentUser?.village || ''}`
                : isAdminKecamatan
                ? `Supervisi data pelayanan KB seluruh desa di Kecamatan ${facility.district}`
                : 'Basis data terpadu pelayanan KB Dinas P3AKB Kabupaten Bojonegoro'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Add New Record - Full width primary CTA on mobile */}
            <button
              onClick={onAddNew}
              className={`col-span-2 sm:order-3 inline-flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-xs sm:text-xs font-bold text-white rounded-xl shadow-sm transition active:scale-98 cursor-pointer ${
                isBidanDesa
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isBidanDesa ? `+ Entri Pasien Desa ${currentUser?.village || ''}` : '+ Entri Pasien KB Baru'}</span>
            </button>

            {/* Print/PDF */}
            <button
              onClick={onOpenPrint}
              className="sm:order-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
              title="Cetak atau Simpan PDF format landscape resmi BKKBN"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak / PDF</span>
            </button>

            {/* Download Excel */}
            <button
              onClick={handleDownloadExcel}
              className="sm:order-2 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
              title="Download tabel ke format Microsoft Excel (.xls) persis seperti di aplikasi"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Unduh Excel</span>
            </button>

            {/* Clear records button (Hanya Admin Induk) */}
            {isAdminInduk && records.length > 0 && onClearRecords && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data register pelayanan KB? Seluruh data pasien akan dihapus menjadi 0 data.'
                    )
                  ) {
                    onClearRecords();
                  }
                }}
                className="col-span-2 sm:order-4 inline-flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                title="Kosongkan seluruh data register"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {/* Search Box */}
          <div className="col-span-2 lg:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Istri, Suami, NIK 16 digit..."
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

          {/* Filter Bulan */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value={0}>Semua Bulan</option>
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Bulan: {name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              <option value={0}>Semua Tahun</option>
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
            </select>
          </div>

          {/* Filter Desa */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={isUserDesa}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-75"
            >
              {!isUserDesa && <option value="SEMUA">Semua Desa</option>}
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  Desa {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Metode KB (termasuk MOW dan MOP) */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-2.5 sm:py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="SEMUA">Semua Metode KB</option>
              {Object.entries(METHOD_SHORT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredRecords.length === 0 && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Pasien</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {records.length === 0
              ? 'Daftar register saat ini masih kosong (0 data). Silakan klik tombol di bawah untuk memulai entri data akseptor baru.'
              : `Tidak ada data akseptor yang tercatat pada filter: ${selectedMonth > 0 ? monthNames[selectedMonth - 1] : ''} ${selectedYear || ''} ${selectedVillage !== 'SEMUA' ? `Desa ${selectedVillage}` : ''}.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Pasien Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE SWITCHER FOR MOBILE & TABLET */}
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
              Tampilan HP
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
              Tabel 23 Kolom
            </button>
          </div>
        </div>
      )}

      {/* MOBILE CARD LIST VIEW (SANGAT NYAMAN DI HP TANPA GESER TABEL LEBAR) */}
      {filteredRecords.length > 0 && mobileViewMode === 'cards' && (
        <div className="md:hidden space-y-3">
          {filteredRecords.map((r, index) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                    <span className="font-bold text-slate-700">#{index + 1}</span>
                    <span>•</span>
                    <span>{r.serviceDate}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{r.registerNumber}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {r.wifeName}{' '}
                    <span className="text-xs font-normal text-slate-500">({r.wifeAge} thn)</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    NIK: <span className="font-mono font-semibold">{r.wifeNik || '-'}</span> • Suami:{' '}
                    <span className="font-medium">{r.husbandName || '-'}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {METHOD_SHORT_LABELS[r.method] || r.method}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Domisili:</span>
                  <span className="font-semibold text-slate-800">Desa {r.village}</span>
                  {r.address && <span className="text-[11px] text-slate-500 block truncate">{r.address}</span>}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status & Alokon:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getStatusBadge(r.participantStatus)}
                    <span className="text-[11px] font-semibold text-slate-700">• {r.alokonSource}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => setDetailRecord(r)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-98 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-98 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Hapus data register ${r.wifeName} (${r.registerNumber})?`)) {
                      onDelete(r.id);
                    }
                  }}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center active:scale-98 transition"
                  title="Hapus Data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OFFICIAL BKKBN TABLE VIEW (SESUAI DOKUMEN LAPORAN KB AGUSTUS 2026) */}
      {filteredRecords.length > 0 && (
        <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden`}>
          {/* Official Document Kop Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-300 text-center">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2 text-[11px] font-mono">
              <div className="text-left text-slate-700">
                <div>KODE REGISTER: <b className="text-slate-900">{facility.k0kbCode}</b></div>
              </div>
              <div className="px-2.5 py-0.5 border border-slate-800 rounded font-bold text-xs bg-white text-slate-900">
                FORMULIR R/I/KB
              </div>
              <div className="text-right text-slate-600">
                <div>PROVINSI: <b className="text-slate-900">{facility.province.toUpperCase()}</b></div>
                <div>KABUPATEN: <b className="text-slate-900">{facility.regency.toUpperCase()}</b></div>
                <div>KECAMATAN: <b className="text-slate-900">{facility.district.toUpperCase()}</b></div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-wider">
                REGISTER PELAYANAN KELUARGA BERENCANA FASILITAS KESEHATAN
              </h3>
              <h4 className="text-xs font-bold uppercase text-slate-800">
                {facility.name}
              </h4>
              <div className="mt-1 text-xs text-slate-700 font-semibold flex items-center justify-center gap-3">
                <span>
                  PERIODE LAPORAN: <b>{selectedMonth > 0 ? monthNames[selectedMonth - 1].toUpperCase() : 'SEMUA BULAN'} {selectedYear}</b>
                </span>
                <span>•</span>
                <span>
                  CAKUPAN WILAYAH: <b>{selectedVillage === 'SEMUA' ? 'SELURUH DESA' : `DESA ${selectedVillage.toUpperCase()}`}</b>
                </span>
              </div>
            </div>
          </div>

          {/* The Exact Official Table (23 BKKBN Columns + 1 Action Column) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-slate-600 text-slate-900 min-w-[1280px]">
              {/* Table Header: Grouped Multi-level Rows + Column Numbers (1) to (23) */}
              <thead>
                {/* Header Row 1: Grouped categories */}
                <tr className="bg-slate-200/90 text-center font-bold text-slate-900 border-b border-slate-600">
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-9">
                    NO
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-20">
                    TANGGAL PELAYANAN
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-24">
                    NO. REGISTER / SERI KARTU
                  </th>
                  <th colSpan={3} className="border border-slate-600 p-1.5 bg-emerald-100/70 text-emerald-950">
                    IDENTITAS PESERTA KB (ISTRI)
                  </th>
                  <th colSpan={2} className="border border-slate-600 p-1.5 bg-teal-100/70 text-teal-950">
                    IDENTITAS SUAMI
                  </th>
                  <th colSpan={2} className="border border-slate-600 p-1.5 bg-sky-100/70 text-sky-950">
                    ALAMAT DOMISILI
                  </th>
                  <th colSpan={2} className="border border-slate-600 p-1.5 bg-blue-100/70 text-blue-950">
                    JUMLAH ANAK HIDUP
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-16 bg-blue-50">
                    UMUR ANAK TERKECIL
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-24 bg-amber-100/70 text-amber-950">
                    STATUS PESERTA KB
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-24 bg-emerald-100/70 text-emerald-950">
                    METODE KONTRASEPSI
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-16 bg-purple-100/70 text-purple-950">
                    SUMBER ALOKON
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-20 bg-indigo-100/70 text-indigo-950">
                    JENIS TINDAKAN
                  </th>
                  <th colSpan={3} className="border border-slate-600 p-1.5 bg-rose-100/70 text-rose-950">
                    PENAPISAN / PEMERIKSAAN MEDIS
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-20 bg-rose-50">
                    EFEK SAMPING / KOMPLIKASI
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-14">
                    RUJUKAN
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-28">
                    PEMBERI PELAYANAN / PETUGAS
                  </th>
                  <th rowSpan={2} className="border border-slate-600 p-1.5 w-20 text-center bg-slate-300">
                    AKSI
                  </th>
                </tr>

                {/* Header Row 2: Sub-headers */}
                <tr className="bg-slate-100 text-center font-bold text-slate-800 text-[10px] border-b border-slate-600">
                  <th className="border border-slate-600 p-1 w-32 bg-emerald-50">NIK Istri (16 Digit)</th>
                  <th className="border border-slate-600 p-1 w-32 bg-emerald-50">Nama Lengkap Istri</th>
                  <th className="border border-slate-600 p-1 w-12 bg-emerald-50">Umur (Thn)</th>
                  <th className="border border-slate-600 p-1 w-28 bg-teal-50">Nama Suami</th>
                  <th className="border border-slate-600 p-1 w-32 bg-teal-50">NIK Suami</th>
                  <th className="border border-slate-600 p-1 w-24 bg-sky-50">Desa / Kel.</th>
                  <th className="border border-slate-600 p-1 w-32 bg-sky-50">RT/RW / Alamat</th>
                  <th className="border border-slate-600 p-1 w-8 bg-blue-50">L</th>
                  <th className="border border-slate-600 p-1 w-8 bg-blue-50">P</th>
                  <th className="border border-slate-600 p-1 w-16 bg-rose-50">TD (mmHg)</th>
                  <th className="border border-slate-600 p-1 w-12 bg-rose-50">BB (kg)</th>
                  <th className="border border-slate-600 p-1 w-16 bg-rose-50">HPHT</th>
                </tr>

                {/* Header Row 3: Official BKKBN Column Numbers (1) to (23) */}
                <tr className="bg-slate-50 text-center text-[9px] text-slate-600 font-mono border-b border-slate-600">
                  <th className="border border-slate-600 p-0.5">(1)</th>
                  <th className="border border-slate-600 p-0.5">(2)</th>
                  <th className="border border-slate-600 p-0.5">(3)</th>
                  <th className="border border-slate-600 p-0.5">(4)</th>
                  <th className="border border-slate-600 p-0.5">(5)</th>
                  <th className="border border-slate-600 p-0.5">(6)</th>
                  <th className="border border-slate-600 p-0.5">(7)</th>
                  <th className="border border-slate-600 p-0.5">(8)</th>
                  <th className="border border-slate-600 p-0.5">(9)</th>
                  <th className="border border-slate-600 p-0.5">(10)</th>
                  <th className="border border-slate-600 p-0.5">(11)</th>
                  <th className="border border-slate-600 p-0.5">(12)</th>
                  <th className="border border-slate-600 p-0.5">(13)</th>
                  <th className="border border-slate-600 p-0.5">(14)</th>
                  <th className="border border-slate-600 p-0.5">(15)</th>
                  <th className="border border-slate-600 p-0.5">(16)</th>
                  <th className="border border-slate-600 p-0.5">(17)</th>
                  <th className="border border-slate-600 p-0.5">(18)</th>
                  <th className="border border-slate-600 p-0.5">(19)</th>
                  <th className="border border-slate-600 p-0.5">(20)</th>
                  <th className="border border-slate-600 p-0.5">(21)</th>
                  <th className="border border-slate-600 p-0.5">(22)</th>
                  <th className="border border-slate-600 p-0.5">(23)</th>
                  <th className="border border-slate-600 p-0.5 bg-slate-200">Aksi</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-300">
                {filteredRecords.map((r, index) => (
                  <tr
                    key={r.id}
                    className="hover:bg-amber-50/50 even:bg-slate-50/60 transition-colors"
                  >
                    {/* (1) NO */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono font-semibold text-slate-700">
                      {index + 1}
                    </td>

                    {/* (2) TANGGAL PELAYANAN */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono whitespace-nowrap">
                      {r.serviceDate}
                    </td>

                    {/* (3) NO. REGISTER */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                      {r.registerNumber}
                    </td>

                    {/* (4) NIK ISTRI (16 DIGIT) */}
                    <td className="border border-slate-500 p-1.5 font-mono text-[10px] text-slate-900 tracking-tight whitespace-nowrap">
                      {r.wifeNik ? (
                        <span className="font-semibold">{r.wifeNik}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* (5) NAMA LENGKAP ISTRI */}
                    <td className="border border-slate-500 p-1.5 font-semibold text-slate-900">
                      {r.wifeName}
                    </td>

                    {/* (6) UMUR ISTRI */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono">
                      {r.wifeAge}
                    </td>

                    {/* (7) NAMA SUAMI */}
                    <td className="border border-slate-500 p-1.5 text-slate-800">
                      {r.husbandName || '-'}
                    </td>

                    {/* (8) NIK SUAMI */}
                    <td className="border border-slate-500 p-1.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                      {r.husbandNik || '-'}
                    </td>

                    {/* (9) DESA / KELURAHAN */}
                    <td className="border border-slate-500 p-1.5 font-medium text-slate-900">
                      Desa {r.village}
                    </td>

                    {/* (10) RT/RW / ALAMAT */}
                    <td className="border border-slate-500 p-1.5 text-[10px] text-slate-700 truncate max-w-[140px]" title={r.address}>
                      {r.address || '-'}
                    </td>

                    {/* (11) JUMLAH ANAK L */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono font-semibold">
                      {r.aliveChildrenMale}
                    </td>

                    {/* (12) JUMLAH ANAK P */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono font-semibold">
                      {r.aliveChildrenFemale}
                    </td>

                    {/* (13) UMUR ANAK TERKECIL */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono text-[10px]">
                      {r.youngestChildAgeMonths > 0 ? `${r.youngestChildAgeMonths} bln` : '-'}
                    </td>

                    {/* (14) STATUS PESERTA KB */}
                    <td className="border border-slate-500 p-1.5 text-center whitespace-nowrap">
                      {getStatusBadge(r.participantStatus)}
                    </td>

                    {/* (15) METODE KONTRASEPSI */}
                    <td className="border border-slate-500 p-1.5 text-center font-bold text-emerald-900 whitespace-nowrap">
                      {METHOD_SHORT_LABELS[r.method] || r.method}
                    </td>

                    {/* (16) SUMBER ALOKON */}
                    <td className="border border-slate-500 p-1.5 text-center font-semibold text-[10px]">
                      <span className={r.alokonSource === 'APBN' ? 'text-purple-800' : 'text-slate-700'}>
                        {r.alokonSource}
                      </span>
                    </td>

                    {/* (17) JENIS TINDAKAN */}
                    <td className="border border-slate-500 p-1.5 text-center text-[10px]">
                      {ACTION_LABELS[r.actionType] || r.actionType}
                    </td>

                    {/* (18) TD (mmHg) */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono text-[10px] whitespace-nowrap">
                      {r.bloodPressure || '-'}
                    </td>

                    {/* (19) BB (kg) */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono text-[10px]">
                      {r.weightKg > 0 ? `${r.weightKg}` : '-'}
                    </td>

                    {/* (20) HPHT */}
                    <td className="border border-slate-500 p-1.5 text-center font-mono text-[10px] whitespace-nowrap">
                      {r.hpht || '-'}
                    </td>

                    {/* (21) EFEK SAMPING / KOMPLIKASI */}
                    <td className="border border-slate-500 p-1.5 text-center text-[10px]">
                      {r.complications && r.complications !== 'Tidak Ada' ? (
                        <span className="text-rose-700 font-bold">{r.complications}</span>
                      ) : r.sideEffects && r.sideEffects !== 'Tidak Ada' ? (
                        <span className="text-amber-700">{r.sideEffects}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* (22) RUJUKAN */}
                    <td className="border border-slate-500 p-1.5 text-center text-[10px]">
                      {r.referralStatus === 'TIDAK' ? 'Tidak' : (
                        <span className="text-rose-600 font-bold">Rujuk</span>
                      )}
                    </td>

                    {/* (23) PETUGAS PELAYANAN */}
                    <td className="border border-slate-500 p-1.5 text-[10px] font-medium text-slate-800 truncate max-w-[120px]" title={r.officerName}>
                      {r.officerName}
                    </td>

                    {/* (AKSI) */}
                    <td className="border border-slate-500 p-1.5 text-center whitespace-nowrap bg-slate-50">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setDetailRecord(r)}
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="Lihat Detail Pasien"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(r)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data register ${r.wifeName} (${r.registerNumber})?`)) {
                              onDelete(r.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Summary / Total Footer Row */}
              <tfoot>
                <tr className="bg-slate-200/90 font-bold text-slate-900 border-t-2 border-slate-600 text-center">
                  <td colSpan={10} className="border border-slate-600 p-2 text-right uppercase">
                    JUMLAH / TOTAL TERLAYANI ({summary.total} PASIEN) :
                  </td>
                  <td className="border border-slate-600 p-2 font-mono">{summary.totalAnakL}</td>
                  <td className="border border-slate-600 p-2 font-mono">{summary.totalAnakP}</td>
                  <td className="border border-slate-600 p-2 text-[10px] text-slate-600">-</td>
                  <td className="border border-slate-600 p-2 text-[10px]">
                    Baru: {summary.totalBaru} | KBPP: {summary.totalKbpp} | Ganti: {summary.totalGantiCara} | Ulang: {summary.totalUlangan}
                  </td>
                  <td className="border border-slate-600 p-2 text-[10px] text-emerald-900">
                    {summary.total} Akseptor
                  </td>
                  <td className="border border-slate-600 p-2 text-[10px]">
                    APBN: {summary.totalApbn}
                  </td>
                  <td colSpan={8} className="border border-slate-600 p-2 text-left text-[10px] text-slate-600">
                    Kondisi: Terdata Lengkap
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (SIMPEL & JELAS) */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-200 uppercase tracking-wider">
                  No. Register: {detailRecord.registerNumber}
                </span>
                <h3 className="text-lg font-bold mt-0.5">{detailRecord.wifeName}</h3>
                <p className="text-xs text-emerald-100">
                  Usia: {detailRecord.wifeAge} Tahun • Suami: {detailRecord.husbandName || '-'}
                </p>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Identitas Pasien */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identitas Akseptor & Suami</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">NIK Istri:</span>
                    <span className="font-mono font-bold text-slate-900">{detailRecord.wifeNik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">NIK Suami:</span>
                    <span className="font-mono font-bold text-slate-900">{detailRecord.husbandNik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Lahir Istri:</span>
                    <span className="font-medium text-slate-800">{detailRecord.wifeDob || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">No. JKN / BPJS:</span>
                    <span className="font-mono font-medium text-slate-800">{detailRecord.bpjsNumber || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Alamat / Desa:</span>
                    <span className="font-medium text-slate-800">
                      {detailRecord.address}, Desa {detailRecord.village}, Kec. {detailRecord.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jumlah Anak Hidup:</span>
                    <span className="font-medium text-slate-800">
                      {detailRecord.aliveChildrenMale} Laki-laki / {detailRecord.aliveChildrenFemale} Perempuan
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Usia Anak Terkecil:</span>
                    <span className="font-medium text-slate-800">
                      {detailRecord.youngestChildAgeMonths > 0 ? `${detailRecord.youngestChildAgeMonths} Bulan` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Pelayanan KB */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Layanan Kontrasepsi</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Metode Kontrasepsi:</span>
                    <span className="font-bold text-emerald-800 text-xs">
                      {METHOD_SHORT_LABELS[detailRecord.method]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status Kepesertaan:</span>
                    <span className="font-semibold text-slate-800">
                      {STATUS_LABELS[detailRecord.participantStatus] || detailRecord.participantStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sumber Alokon:</span>
                    <span className="font-medium text-slate-800">{ALOKON_LABELS[detailRecord.alokonSource] || detailRecord.alokonSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Tindakan:</span>
                    <span className="font-medium text-slate-800">{ACTION_LABELS[detailRecord.actionType] || detailRecord.actionType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Dilayani:</span>
                    <span className="font-medium text-slate-800">{detailRecord.serviceDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tempat Layanan:</span>
                    <span className="font-medium text-slate-800">{detailRecord.servicePlace}</span>
                  </div>
                </div>
              </div>

              {/* Skrining Medis */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pemeriksaan Medis / Penapisan</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Tekanan Darah:</span>
                    <span className="font-mono font-bold text-slate-800">{detailRecord.bloodPressure || '-'} mmHg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Berat Badan:</span>
                    <span className="font-mono font-bold text-slate-800">{detailRecord.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">HPHT:</span>
                    <span className="font-mono text-slate-800">{detailRecord.hpht || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status Rujukan:</span>
                    <span className="font-medium text-slate-800">{detailRecord.referralStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Efek Samping:</span>
                    <span className="font-medium text-slate-800">{detailRecord.sideEffects || 'Tidak Ada'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Komplikasi:</span>
                    <span className="font-medium text-slate-800">{detailRecord.complications || 'Tidak Ada'}</span>
                  </div>
                </div>
              </div>

              {/* Petugas */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Bidan / Petugas: <b className="text-slate-800">{detailRecord.officerName}</b></span>
                <span>Diinput: <b className="text-slate-800">{detailRecord.createdByUsername}</b></span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  const r = detailRecord;
                  setDetailRecord(null);
                  onEdit(r);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Data Ini</span>
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
