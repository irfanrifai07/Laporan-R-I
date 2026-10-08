import React, { useState, useMemo } from 'react';
import { FacilityProfile, PatientRecord, Village } from '../types';
import { deriveR1KBRow, exportRegisterR1KBToExcel } from '../data/initialData';
import { Printer, X, Download } from 'lucide-react';

interface PrintRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PatientRecord[];
  facility: FacilityProfile;
  villages: Village[];
}

export const PrintRegisterModal: React.FC<PrintRegisterModalProps> = ({
  isOpen,
  onClose,
  records,
  facility,
  villages,
}) => {
  const [filterVillage, setFilterVillage] = useState<string>(
    villages.length === 1 ? villages[0].name : 'SEMUA'
  );
  const [filterMonth, setFilterMonth] = useState<number>(9); // Default September
  const [filterYear, setFilterYear] = useState<number>(2026);

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

  const printableRecords = useMemo(() => {
    return records.filter((r) => {
      if (
        filterVillage !== 'SEMUA' &&
        r.village.toLowerCase() !== filterVillage.toLowerCase()
      )
        return false;
      if (r.serviceDate) {
        const [y, m] = r.serviceDate.split('-').map(Number);
        if (filterYear !== 0 && y !== filterYear) return false;
        if (filterMonth !== 0 && m !== filterMonth) return false;
      }
      return true;
    });
  }, [records, filterVillage, filterMonth, filterYear]);

  if (!isOpen) return null;

  const faskesDisplayName =
    filterVillage !== 'SEMUA'
      ? `Pustu ${filterVillage}`
      : villages.length === 1
      ? `Pustu ${villages[0].name}`
      : facility.name;

  const handlePrintNow = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    const monthStr = filterMonth > 0 ? monthNames[filterMonth - 1] : 'Semua_Bulan';
    exportRegisterR1KBToExcel({
      records: printableRecords,
      faskesName: faskesDisplayName,
      selectedMonth: filterMonth,
      selectedYear: filterYear || 2026,
      filename: `Register_RIKB20_${monthStr}_${filterYear || 2026}.xls`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs overflow-y-auto flex flex-col items-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Top Action Control Bar */}
      <div className="w-full max-w-7xl bg-slate-900 text-white rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-slate-700 print:hidden">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            Pratinjau Cetak R/I/KB/20 (Landscape)
          </span>
          <h2 className="text-base font-bold mt-1">
            Cetak / Simpan PDF Register Pelayanan KB (24 Kolom Resmi)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium"
          >
            <option value={0}>Semua Bulan</option>
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Bulan: {m}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium"
          >
            <option value={0}>Semua Tahun</option>
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>

          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            disabled={villages.length === 1}
            className="text-xs bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium disabled:opacity-80"
          >
            {villages.length !== 1 && <option value="SEMUA">Semua Desa</option>}
            {villages.map((v) => (
              <option key={v.id} value={v.name}>
                Desa {v.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.xls)</span>
          </button>

          <button
            onClick={handlePrintNow}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (R/I/KB/20) */}
      <div className="w-full max-w-7xl bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-2xl print:shadow-none print:p-0 print:w-full overflow-x-auto">
        {/* KOP FORMULIR R/I/KB/20 */}
        <div className="flex items-end justify-between gap-4 pb-3 text-xs">
          <div className="space-y-2">
            <div className="border border-slate-900 px-3 py-1.5 w-44 text-[11px] leading-tight">
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
              <span className="border-b border-slate-900 px-2 pb-0.5 min-w-[180px] font-semibold">
                {faskesDisplayName}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-normal uppercase tracking-wide mb-2">
              REGISTER PELAYANAN KB
            </h1>
            <div className="flex items-start gap-2 text-center font-mono text-xs">
              <div>
                <div className="flex border border-slate-900">
                  <span className="w-6 h-6 flex items-center justify-center border-r border-slate-900 font-bold">
                    3
                  </span>
                  <span className="w-6 h-6 flex items-center justify-center font-bold">5</span>
                </div>
                <span className="text-[9px] font-sans block mt-0.5">Kode Provinsi</span>
              </div>
              <div>
                <div className="flex border border-slate-900">
                  <span className="w-6 h-6 flex items-center justify-center border-r border-slate-900 font-bold">
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
                <div className="flex border border-slate-900">
                  <span className="w-6 h-6 flex items-center justify-center border-r border-slate-900 font-bold">
                    0
                  </span>
                  <span className="w-6 h-6 flex items-center justify-center border-r border-slate-900 font-bold">
                    0
                  </span>
                  <span className="w-6 h-6 flex items-center justify-center font-bold">4</span>
                </div>
                <span className="text-[9px] font-sans block mt-0.5">No. Register Faskes</span>
              </div>
              <div>
                <div className="flex border border-slate-900">
                  <span className="w-6 h-6 flex items-center justify-center border-r border-slate-900 font-bold">
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

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-end space-x-4">
              <div className="bg-black text-white font-bold px-3 py-1 text-xs">R/I/KB/20</div>
              <div className="text-[11px]">
                Lembar <span className="border-b border-slate-900 px-3">1</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span>Bulan :</span>
              <div className="border border-slate-900 text-[10px] font-mono">
                <div className="grid grid-cols-6 border-b border-slate-900">
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <span
                      key={m}
                      className="w-5 h-4 flex items-center justify-center border-r last:border-r-0 border-slate-900"
                    >
                      {filterMonth === m ? 'V' : m}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-6">
                  {[7, 8, 9, 10, 11, 12].map((m) => (
                    <span
                      key={m}
                      className="w-5 h-4 flex items-center justify-center border-r last:border-r-0 border-slate-900 font-bold"
                    >
                      {filterMonth === m || (filterMonth === 0 && m === 9) ? 'V' : m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border border-slate-900 px-2.5 py-1.5 font-mono font-bold text-xs">
                {filterYear || 2026}
              </div>
            </div>
          </div>
        </div>

        {/* 24-COLUMN TABLE */}
        <table className="w-full text-left text-[10px] border-collapse border border-slate-900 text-slate-950">
          <thead>
            <tr className="text-center font-normal">
              <th rowSpan={3} className="border border-slate-900 p-1 w-7">
                NO.
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-18">
                TANGGAL
              </th>
              <th colSpan={21} className="border border-slate-900 p-1">
                PESERTA KB
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-8">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[9px] leading-tight py-1">
                  STATUS PESERTA KB (Kode)
                </div>
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-7">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[9px] leading-tight py-1">
                  INFORMED CONSENT
                </div>
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-7">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[9px] leading-tight py-1">
                  PASCA PERSALINAN
                </div>
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-7">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[9px] leading-tight py-1">
                  PASCA KEGUGURAN
                </div>
              </th>
              <th colSpan={3} rowSpan={2} className="border border-slate-900 p-1">
                JENIS TINDAKAN
                <br />
                (Kode)
              </th>
              <th colSpan={2} rowSpan={2} className="border border-slate-900 p-1">
                Kasus
                <br />
                (Kode)
              </th>
              <th colSpan={3} rowSpan={2} className="border border-slate-900 p-1">
                PENGGUNAAN
                <br />
                ASURANSI
              </th>
              <th colSpan={3} rowSpan={2} className="border border-slate-900 p-1">
                SUMBER ALOKON
              </th>
              <th rowSpan={3} className="border border-slate-900 p-1 w-7">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-[9px] leading-tight py-1">
                  PELAYANAN BERGERAK
                </div>
              </th>
            </tr>
            <tr className="text-center font-normal">
              <th rowSpan={2} className="border border-slate-900 p-1">
                NAMA SUAMI
              </th>
              <th colSpan={18} className="border border-slate-900 p-1">
                ISTRI
              </th>
              <th rowSpan={2} className="border border-slate-900 p-1">
                ALAMAT
              </th>
              <th rowSpan={2} className="border border-slate-900 p-1">
                NO. HANDPHONE
              </th>
            </tr>
            <tr className="text-center font-normal text-[9px]">
              <th colSpan={16} className="border border-slate-900 p-1">
                NIK (NOMOR INDUK KEPENDUDUKAN)
              </th>
              <th className="border border-slate-900 p-1">NAMA</th>
              <th className="border border-slate-900 p-1">
                TANGGAL
                <br />
                LAHIR
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  OPERATIF / PEMBERIAN / PEMASANGAN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  PENCABUTAN DAN PEMASANGAN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  PENCABUTAN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  KOMPLIKASI BERAT
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  KEGAGALAN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  BPJS KESEHATAN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  LAINNYA
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  TIDAK
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  APBN
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  APBD
                </div>
              </th>
              <th className="border border-slate-900 p-1">
                <div className="[writing-mode:vertical-rl] rotate-180 mx-auto leading-tight py-1">
                  MANDIRI
                </div>
              </th>
            </tr>
            <tr className="text-center text-[9px] font-normal">
              <th className="border border-slate-900 py-0.5">1</th>
              <th className="border border-slate-900 py-0.5">2</th>
              <th className="border border-slate-900 py-0.5">3</th>
              <th colSpan={16} className="border border-slate-900 py-0.5">
                4
              </th>
              <th className="border border-slate-900 py-0.5">5</th>
              <th className="border border-slate-900 py-0.5">6</th>
              <th className="border border-slate-900 py-0.5">7</th>
              <th className="border border-slate-900 py-0.5">8</th>
              <th className="border border-slate-900 py-0.5">9</th>
              <th className="border border-slate-900 py-0.5">10</th>
              <th className="border border-slate-900 py-0.5">11</th>
              <th className="border border-slate-900 py-0.5">12</th>
              <th className="border border-slate-900 py-0.5">13</th>
              <th className="border border-slate-900 py-0.5">14</th>
              <th className="border border-slate-900 py-0.5">15</th>
              <th className="border border-slate-900 py-0.5">16</th>
              <th className="border border-slate-900 py-0.5">17</th>
              <th className="border border-slate-900 py-0.5">18</th>
              <th className="border border-slate-900 py-0.5">19</th>
              <th className="border border-slate-900 py-0.5">20</th>
              <th className="border border-slate-900 py-0.5">21</th>
              <th className="border border-slate-900 py-0.5">22</th>
              <th className="border border-slate-900 py-0.5">23</th>
              <th className="border border-slate-900 py-0.5">24</th>
            </tr>
          </thead>
          <tbody>
            {printableRecords.map((r, index) => {
              const d = deriveR1KBRow(r);
              return (
                <tr key={r.id}>
                  <td className="border border-slate-900 p-1 text-center">{index + 1}</td>
                  <td className="border border-slate-900 p-1 text-center whitespace-nowrap">
                    {d.tanggalFormatted}
                  </td>
                  <td className="border border-slate-900 p-1 uppercase">{d.husbandName}</td>
                  {d.nikDigits.map((digit, dIdx) => (
                    <td
                      key={dIdx}
                      className="border border-slate-900 px-0.5 py-1 text-center font-mono text-[9px] w-3.5"
                    >
                      {digit}
                    </td>
                  ))}
                  <td className="border border-slate-900 p-1 uppercase">{d.wifeName}</td>
                  <td className="border border-slate-900 p-1 text-center whitespace-nowrap">
                    {d.wifeDobFormatted}
                  </td>
                  <td className="border border-slate-900 p-1 uppercase">{d.alamat}</td>
                  <td className="border border-slate-900 p-1 text-center font-mono">{d.phone}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col9}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col10}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col11}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col12}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col13}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col14}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col15}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col16}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col17}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col18}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col19}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col20}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col21}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col22}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col23}</td>
                  <td className="border border-slate-900 p-1 text-center">{d.col24}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* KETERANGAN KODE */}
        <div className="pt-3 space-y-1.5 text-[10px] text-slate-950">
          <div>1) Keterangan Kode</div>
          <table className="border-collapse border border-slate-900 text-[9.5px] w-full max-w-5xl">
            <thead>
              <tr className="text-center font-medium">
                <th colSpan={2} className="border border-slate-900 py-1 px-2 w-1/3">
                  STATUS PESERTA KB
                </th>
                <th colSpan={6} className="border border-slate-900 py-1 px-2">
                  KODE JENIS ALOKON (Diisi Pada Jenis Tindakan dan Kasus)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-l border-slate-900 py-0.5 px-2">1 : Peserta KB Baru</td>
                <td className="border-r border-slate-900 py-0.5 px-2">3 : Peserta KB Ulangan</td>
                <td className="py-0.5 px-2">1 : Suntikan 1 Bulanan</td>
                <td className="py-0.5 px-2">3 : Suntikan 3 Bulanan</td>
                <td className="py-0.5 px-2">5 : Pil Progestin</td>
                <td className="py-0.5 px-2">7 : Implan 1 Batang</td>
                <td className="py-0.5 px-2">9 : IUD</td>
                <td className="border-r border-slate-900 py-0.5 px-2">11 : Tubektomi</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border-l border-slate-900 py-0.5 px-2">2 : Peserta KB Ganti</td>
                <td className="border-r border-slate-900 py-0.5 px-2">4 : Komplikasi</td>
                <td className="py-0.5 px-2">2 : Suntikan 3 Bulanan</td>
                <td className="py-0.5 px-2">4 : Pil Kombinasi</td>
                <td className="py-0.5 px-2">6 : Kondom</td>
                <td className="py-0.5 px-2">8 : Implan 2 Batang</td>
                <td className="py-0.5 px-2" colSpan={2}>
                  10 : Vasektomi
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            2) SELAIN STATUS PESERTA KB, JENIS TINDAKAN DAN KASUS DIISI TANDA CENTANG (V)
          </div>
        </div>
      </div>
    </div>
  );
};
