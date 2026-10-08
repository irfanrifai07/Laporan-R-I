import React, { useState, useMemo, useEffect } from 'react';
import { District, FacilityProfile, PatientRecord, User, Village } from '../types';
import { StorageService } from '../services/storage';
import { Printer, Calendar, FileSpreadsheet, Building2, Download, MapPin } from 'lucide-react';

interface RekapitulasiF2KBProps {
  facility: FacilityProfile;
  villages: Village[];
  districts?: District[];
  onSelectDistrict?: (districtName: string) => void;
  records?: PatientRecord[];
  currentUser?: User | null;
}

export const RekapitulasiF2KB: React.FC<RekapitulasiF2KBProps> = ({
  facility,
  villages,
  districts = [],
  onSelectDistrict,
  records,
  currentUser,
}) => {
  const isUserDesa =
    currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';
  const isAdminInduk =
    currentUser?.role === 'admin_induk' ||
    currentUser?.role === 'admin_kabupaten' ||
    !currentUser;
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // September by default
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedVillage, setSelectedVillage] = useState<string>(
    isUserDesa && currentUser?.village ? currentUser.village : 'SEMUA'
  );

  useEffect(() => {
    if (isUserDesa && currentUser?.village) {
      setSelectedVillage(currentUser.village);
    } else {
      setSelectedVillage('SEMUA');
    }
  }, [isUserDesa, currentUser?.village, currentUser?.district]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate table data (recalculates automatically when realtime Firebase records or villages update)
  const matrixData = useMemo(() => {
    return StorageService.calculateMonthlyF2KB(
      selectedMonth,
      selectedYear,
      selectedVillage,
      currentUser?.district
    );
  }, [selectedMonth, selectedYear, selectedVillage, currentUser?.district, records, villages]);

  // Calculate totals
  const totalSum = useMemo(() => {
    return matrixData.reduce(
      (acc, row) => ({
        baruBukanPasca: acc.baruBukanPasca + row.baruBukanPasca,
        baruPascaSalin: acc.baruPascaSalin + row.baruPascaSalin,
        baruPascaGugur: acc.baruPascaGugur + row.baruPascaGugur,
        totalBaru: acc.totalBaru + row.totalBaru,
        gantiCara: acc.gantiCara + row.gantiCara,
        ulangan: acc.ulangan + row.ulangan,
        totalPelayanan: acc.totalPelayanan + row.totalPelayanan,
        apbn: acc.apbn + row.apbn,
        nonApbn: acc.nonApbn + row.nonApbn,
        komplikasi: acc.komplikasi + row.komplikasi,
        kegagalan: acc.kegagalan + row.kegagalan,
        cabutAlokon: acc.cabutAlokon + row.cabutAlokon,
      }),
      {
        baruBukanPasca: 0,
        baruPascaSalin: 0,
        baruPascaGugur: 0,
        totalBaru: 0,
        gantiCara: 0,
        ulangan: 0,
        totalPelayanan: 0,
        apbn: 0,
        nonApbn: 0,
        komplikasi: 0,
        kegagalan: 0,
        cabutAlokon: 0,
      }
    );
  }, [matrixData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    const periodLabel = `${monthNames[selectedMonth - 1].toUpperCase()} ${selectedYear}`;
    const regionLabel =
      selectedVillage === 'SEMUA'
        ? currentUser?.district
          ? `SELURUH DESA KECAMATAN ${facility.district.toUpperCase()}`
          : 'SELURUH KABUPATEN BOJONEGORO (DINAS P3AKB)'
        : `DESA ${selectedVillage.toUpperCase()} - KEC. ${facility.district.toUpperCase()}`;

    const rowsHtml = matrixData
      .map(
        (row, idx) => `
          <tr style="text-align:center; font-family:Consolas,monospace;">
            <td style="border:1px solid #64748b; padding:6px; font-weight:bold; color:#475569;">${idx + 1}</td>
            <td style="border:1px solid #64748b; padding:6px; text-align:left; font-family:Arial,sans-serif; font-weight:bold; color:#1e293b;">${row.methodLabel}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.baruBukanPasca || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.baruPascaSalin || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.baruPascaGugur || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; font-weight:bold; background-color:#ecfdf5; color:#064e3b;">${row.totalBaru || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; background-color:#fffbeb; color:#78350f;">${row.gantiCara || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; background-color:#eff6ff; color:#1e3a8a;">${row.ulangan || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; font-weight:bold; background-color:#f1f5f9; color:#0f172a; font-size:10.5pt;">${row.totalPelayanan || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.apbn || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.nonApbn || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; color:#be123c;">${row.komplikasi || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px; color:#be123c;">${row.kegagalan || '-'}</td>
            <td style="border:1px solid #64748b; padding:6px;">${row.cabutAlokon || '-'}</td>
          </tr>
        `
      )
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
                <x:Name>Formulir R-I-KB</x:Name>
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
            <td colspan="7" style="font-family:Consolas,monospace; font-size:9.5pt; font-weight:bold; padding:2px;">
              KODE REGISTER: ${facility.k0kbCode}
            </td>
            <td colspan="7" style="text-align:right; font-size:10pt; font-weight:bold; padding:2px;">
              FORMULIR R/I/KB
            </td>
          </tr>
          <tr>
            <td colspan="14" style="text-align:center; font-size:13pt; font-weight:bold; padding-top:6px;">
              REKAPITULASI PELAYANAN KONTRASEPSI BULANAN
            </td>
          </tr>
          <tr>
            <td colspan="14" style="text-align:center; font-size:11pt; font-weight:bold;">
              ${facility.name.toUpperCase()}
            </td>
          </tr>
          <tr>
            <td colspan="14" style="text-align:center; font-size:9.5pt; color:#475569;">
              ${facility.regency}, Provinsi ${facility.province}
            </td>
          </tr>
          <tr>
            <td colspan="14" style="text-align:center; font-size:9.5pt; font-weight:bold; padding-top:4px; padding-bottom:10px;">
              PERIODE LAPORAN: ${periodLabel} &bull; CAKUPAN WILAYAH: ${regionLabel}
            </td>
          </tr>
        </table>

        <table style="border-collapse:collapse; width:100%; font-size:9.5pt;">
          <thead>
            <tr style="background-color:#f1f5f9; text-align:center; font-weight:bold;">
              <th rowspan="3" style="border:1px solid #475569; padding:6px;">NO</th>
              <th rowspan="3" style="border:1px solid #475569; padding:6px; text-align:left;">METODE KONTRASEPSI</th>
              <th colspan="4" style="border:1px solid #475569; padding:6px; background-color:#ecfdf5;">PESERTA KB BARU</th>
              <th rowspan="3" style="border:1px solid #475569; padding:6px; background-color:#fffbeb;">GANTI CARA</th>
              <th rowspan="3" style="border:1px solid #475569; padding:6px; background-color:#eff6ff;">ULANGAN</th>
              <th rowspan="3" style="border:1px solid #475569; padding:6px; background-color:#e2e8f0; font-weight:bold;">TOTAL PELAYANAN</th>
              <th colspan="2" style="border:1px solid #475569; padding:6px; background-color:#faf5ff;">SUMBER ALOKON</th>
              <th colspan="3" style="border:1px solid #475569; padding:6px; background-color:#fff1f2;">INDIKATOR KHUSUS</th>
            </tr>
            <tr style="background-color:#f1f5f9; text-align:center; font-weight:bold; font-size:9pt;">
              <th style="border:1px solid #475569; padding:5px; background-color:#ecfdf5;">Bukan Pasca Salin</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#ecfdf5;">Pasca Salin</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#ecfdf5;">Pasca Gugur</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#d1fae5; font-weight:bold;">Jumlah Baru</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#faf5ff;">APBN</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#faf5ff;">Non-APBN</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#fff1f2;">Komplikasi</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#fff1f2;">Kegagalan</th>
              <th style="border:1px solid #475569; padding:5px; background-color:#fff1f2;">Cabut Alokon</th>
            </tr>
            <tr style="background-color:#f8fafc; text-align:center; font-family:Consolas,monospace; font-size:8.5pt; color:#64748b;">
              <th style="border:1px solid #475569; padding:3px;">(1)</th>
              <th style="border:1px solid #475569; padding:3px;">(2)</th>
              <th style="border:1px solid #475569; padding:3px;">(3)</th>
              <th style="border:1px solid #475569; padding:3px;">(4=1+2+3)</th>
              <th style="border:1px solid #475569; padding:3px;">(5)</th>
              <th style="border:1px solid #475569; padding:3px;">(6)</th>
              <th style="border:1px solid #475569; padding:3px;">(7=4+5+6)</th>
              <th style="border:1px solid #475569; padding:3px;">(8)</th>
              <th style="border:1px solid #475569; padding:3px;">(9)</th>
              <th style="border:1px solid #475569; padding:3px;">(10)</th>
              <th style="border:1px solid #475569; padding:3px;">(11)</th>
              <th style="border:1px solid #475569; padding:3px;">(12)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background-color:#e2e8f0; font-weight:bold; text-align:center; font-family:Consolas,monospace;">
              <td colspan="2" style="border:1px solid #1e293b; padding:7px; text-align:right; font-family:Arial,sans-serif;">
                JUMLAH TOTAL PELAYANAN
              </td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.baruBukanPasca}</td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.baruPascaSalin}</td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.baruPascaGugur}</td>
              <td style="border:1px solid #1e293b; padding:7px; background-color:#a7f3d0; color:#022c22;">${totalSum.totalBaru}</td>
              <td style="border:1px solid #1e293b; padding:7px; background-color:#fde68a; color:#451a03;">${totalSum.gantiCara}</td>
              <td style="border:1px solid #1e293b; padding:7px; background-color:#bfdbfe; color:#172554;">${totalSum.ulangan}</td>
              <td style="border:1px solid #1e293b; padding:7px; background-color:#cbd5e1; color:#020617; font-size:11pt;">${totalSum.totalPelayanan}</td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.apbn}</td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.nonApbn}</td>
              <td style="border:1px solid #1e293b; padding:7px; color:#9f1239;">${totalSum.komplikasi}</td>
              <td style="border:1px solid #1e293b; padding:7px; color:#9f1239;">${totalSum.kegagalan}</td>
              <td style="border:1px solid #1e293b; padding:7px;">${totalSum.cabutAlokon}</td>
            </tr>
          </tbody>
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
    link.download = `Rekapitulasi_RIKB_${monthNames[selectedMonth - 1]}_${selectedYear}_${selectedVillage}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control & Filter Bar (hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Rekapitulasi Pelayanan Kontrasepsi Bulanan (Format R/I/KB)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan agregasi bulanan resmi pelayanan KB Dinas P3AKB Bojonegoro sesuai standar BKKBN (R/I/KB)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Month selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 ml-1"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* District selector for Admin Induk */}
          {isAdminInduk && (
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={currentUser?.district || 'SEMUA'}
                onChange={(e) => {
                  setSelectedVillage('SEMUA');
                  if (onSelectDistrict) onSelectDistrict(e.target.value);
                }}
                className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 cursor-pointer"
              >
                <option value="SEMUA">Semua Kecamatan</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>
                    Kecamatan {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Village selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={isUserDesa}
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800 disabled:opacity-80 cursor-pointer"
            >
              {!isUserDesa && (
                <option value="SEMUA">
                  {currentUser?.district
                    ? `Semua Desa (Kec. ${facility.district})`
                    : 'Semua Desa (Se-Kabupaten)'}
                </option>
              )}
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  Desa {v.name}{!currentUser?.district && v.district ? ` (${v.district})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Form R/I/KB</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL R/I/KB SHEET */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none font-sans">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-4 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="text-left text-[11px] font-mono font-semibold text-slate-600">
              <div>KODE REGISTER: <b className="text-slate-900">{facility.k0kbCode}</b></div>
            </div>
            <div className="px-2.5 py-1 border border-slate-800 rounded font-bold text-xs bg-slate-50 text-slate-900">
              FORMULIR R/I/KB
            </div>
          </div>

          <h1 className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-wide">
            REKAPITULASI PELAYANAN KONTRASEPSI BULANAN
          </h1>
          <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800">
            {facility.name}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {currentUser?.district ? `Kecamatan ${facility.district}, ` : ''}{facility.regency}, Provinsi {facility.province}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-800 bg-slate-50 py-1.5 px-4 rounded-lg border border-slate-200 inline-block">
            <span>PERIODE LAPORAN: <b>{monthNames[selectedMonth - 1].toUpperCase()} {selectedYear}</b></span>
            <span>•</span>
            <span>
              CAKUPAN WILAYAH:{' '}
              <b>
                {selectedVillage === 'SEMUA'
                  ? currentUser?.district
                    ? `SELURUH DESA KECAMATAN ${facility.district.toUpperCase()}`
                    : 'SELURUH KABUPATEN BOJONEGORO (DINAS P3AKB)'
                  : `DESA ${selectedVillage.toUpperCase()} - KEC. ${facility.district.toUpperCase()}`}
              </b>
            </span>
          </div>
        </div>

        {/* F/II/KB Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-400 text-slate-900">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th rowSpan={3} className="border border-slate-400 p-2 w-10">NO</th>
                <th rowSpan={3} className="border border-slate-400 p-2 text-left">METODE KONTRASEPSI</th>
                <th colSpan={4} className="border border-slate-400 p-1.5 bg-emerald-50">PESERTA KB BARU</th>
                <th rowSpan={3} className="border border-slate-400 p-1.5 w-16 bg-amber-50">GANTI CARA</th>
                <th rowSpan={3} className="border border-slate-400 p-1.5 w-16 bg-blue-50">ULANGAN</th>
                <th rowSpan={3} className="border border-slate-400 p-2 w-20 bg-slate-200 font-extrabold">TOTAL PELAYANAN</th>
                <th colSpan={2} className="border border-slate-400 p-1.5 bg-purple-50">SUMBER ALOKON</th>
                <th colSpan={3} className="border border-slate-400 p-1.5 bg-rose-50">INDIKATOR KHUSUS</th>
              </tr>
              <tr className="bg-slate-100 text-center font-semibold text-[11px]">
                <th className="border border-slate-400 p-1 w-14 bg-emerald-50">Bukan Pasca Salin</th>
                <th className="border border-slate-400 p-1 w-14 bg-emerald-50">Pasca Salin</th>
                <th className="border border-slate-400 p-1 w-14 bg-emerald-50">Pasca Gugur</th>
                <th className="border border-slate-400 p-1 w-16 font-bold bg-emerald-100">Jumlah Baru</th>
                <th className="border border-slate-400 p-1 w-16 bg-purple-50">APBN</th>
                <th className="border border-slate-400 p-1 w-16 bg-purple-50">Non-APBN</th>
                <th className="border border-slate-400 p-1 w-14 bg-rose-50">Komplikasi</th>
                <th className="border border-slate-400 p-1 w-14 bg-rose-50">Kegagalan</th>
                <th className="border border-slate-400 p-1 w-14 bg-rose-50">Cabut Alokon</th>
              </tr>
              <tr className="bg-slate-50 text-center text-[10px] text-slate-500 font-mono">
                <th className="border border-slate-400 p-0.5">(1)</th>
                <th className="border border-slate-400 p-0.5">(2)</th>
                <th className="border border-slate-400 p-0.5">(3)</th>
                <th className="border border-slate-400 p-0.5">(4=1+2+3)</th>
                <th className="border border-slate-400 p-0.5">(5)</th>
                <th className="border border-slate-400 p-0.5">(6)</th>
                <th className="border border-slate-400 p-0.5">(7=4+5+6)</th>
                <th className="border border-slate-400 p-0.5">(8)</th>
                <th className="border border-slate-400 p-0.5">(9)</th>
                <th className="border border-slate-400 p-0.5">(10)</th>
                <th className="border border-slate-400 p-0.5">(11)</th>
                <th className="border border-slate-400 p-0.5">(12)</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, idx) => (
                <tr key={row.methodKey} className="hover:bg-slate-50 text-center font-mono">
                  <td className="border border-slate-400 p-2 font-semibold text-slate-600">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 text-left font-sans font-medium text-slate-800">
                    {row.methodLabel}
                  </td>
                  <td className="border border-slate-400 p-2">{row.baruBukanPasca || '-'}</td>
                  <td className="border border-slate-400 p-2">{row.baruPascaSalin || '-'}</td>
                  <td className="border border-slate-400 p-2">{row.baruPascaGugur || '-'}</td>
                  <td className="border border-slate-400 p-2 font-bold bg-emerald-50/50 text-emerald-900">
                    {row.totalBaru || '-'}
                  </td>
                  <td className="border border-slate-400 p-2 bg-amber-50/40 text-amber-900">{row.gantiCara || '-'}</td>
                  <td className="border border-slate-400 p-2 bg-blue-50/40 text-blue-900">{row.ulangan || '-'}</td>
                  <td className="border border-slate-400 p-2 font-bold bg-slate-100 text-slate-900 text-sm">
                    {row.totalPelayanan || '-'}
                  </td>
                  <td className="border border-slate-400 p-2">{row.apbn || '-'}</td>
                  <td className="border border-slate-400 p-2">{row.nonApbn || '-'}</td>
                  <td className="border border-slate-400 p-2 text-rose-700">{row.komplikasi || '-'}</td>
                  <td className="border border-slate-400 p-2 text-rose-700">{row.kegagalan || '-'}</td>
                  <td className="border border-slate-400 p-2">{row.cabutAlokon || '-'}</td>
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="bg-slate-200 font-extrabold text-center font-mono border-t-2 border-slate-800">
                <td colSpan={2} className="border border-slate-400 p-2.5 text-right font-sans uppercase">
                  JUMLAH TOTAL PELAYANAN
                </td>
                <td className="border border-slate-400 p-2">{totalSum.baruBukanPasca}</td>
                <td className="border border-slate-400 p-2">{totalSum.baruPascaSalin}</td>
                <td className="border border-slate-400 p-2">{totalSum.baruPascaGugur}</td>
                <td className="border border-slate-400 p-2 bg-emerald-200/70 text-emerald-950 font-black">
                  {totalSum.totalBaru}
                </td>
                <td className="border border-slate-400 p-2 bg-amber-200/70 text-amber-950">{totalSum.gantiCara}</td>
                <td className="border border-slate-400 p-2 bg-blue-200/70 text-blue-950">{totalSum.ulangan}</td>
                <td className="border border-slate-400 p-2 bg-slate-300 text-slate-950 text-base font-black">
                  {totalSum.totalPelayanan}
                </td>
                <td className="border border-slate-400 p-2">{totalSum.apbn}</td>
                <td className="border border-slate-400 p-2">{totalSum.nonApbn}</td>
                <td className="border border-slate-400 p-2 text-rose-800">{totalSum.komplikasi}</td>
                <td className="border border-slate-400 p-2 text-rose-800">{totalSum.kegagalan}</td>
                <td className="border border-slate-400 p-2">{totalSum.cabutAlokon}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Highlights summary badge under the table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 print:hidden">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-medium">Akseptor Baru</span>
            <div className="text-xl font-bold text-emerald-900">{totalSum.totalBaru}</div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Pasca Salin (KBPP): {totalSum.baruPascaSalin}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[11px] text-amber-700 font-medium">Ganti Cara</span>
            <div className="text-xl font-bold text-amber-900">{totalSum.gantiCara}</div>
            <span className="text-[10px] text-amber-600 font-medium">
              Proporsi: {totalSum.totalPelayanan > 0 ? Math.round((totalSum.gantiCara / totalSum.totalPelayanan) * 100) : 0}%
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] text-blue-700 font-medium">Ulangan / Rutin</span>
            <div className="text-xl font-bold text-blue-900">{totalSum.ulangan}</div>
            <span className="text-[10px] text-blue-600 font-medium">
              Proporsi: {totalSum.totalPelayanan > 0 ? Math.round((totalSum.ulangan / totalSum.totalPelayanan) * 100) : 0}%
            </span>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-[11px] text-purple-700 font-medium">Alokon APBN</span>
            <div className="text-xl font-bold text-purple-900">{totalSum.apbn}</div>
            <span className="text-[10px] text-purple-600 font-medium">
              Non-APBN/Mandiri: {totalSum.nonApbn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
