import {
  ContraceptiveMethod,
  District,
  FacilityProfile,
  PatientRecord,
  User,
  Village,
} from '../types';

export const METHOD_LABELS: Record<ContraceptiveMethod, string> = {
  SUNTIK_1_BLN: 'Suntik 1 Bulan (Kombinasi)',
  SUNTIK_3_BLN: 'Suntik 3 Bulan (Depo/Progestin)',
  PIL: 'Pil KB (Kombinasi / Progestin)',
  KONDOM: 'Kondom',
  IUD: 'IUD / AKDR (CuT 380A)',
  IMPLAN_1_BATANG: 'Implan 1 Batang (Etonogestrel)',
  IMPLAN_2_BATANG: 'Implan 2 Batang (Levonorgestrel)',
  MOW: 'MOW (Tubektomi)',
  MOP: 'MOP (Vasektomi)',
};

export const METHOD_SHORT_LABELS: Record<ContraceptiveMethod, string> = {
  SUNTIK_1_BLN: 'Suntik 1 Bln',
  SUNTIK_3_BLN: 'Suntik 3 Bln',
  PIL: 'Pil KB',
  KONDOM: 'Kondom',
  IUD: 'IUD / AKDR',
  IMPLAN_1_BATANG: 'Implan 1 Batang',
  IMPLAN_2_BATANG: 'Implan 2 Batang',
  MOW: 'MOW',
  MOP: 'MOP',
};

export const STATUS_LABELS: Record<string, string> = {
  BARU_BUKAN_PASCA: 'Baru (Bukan Pasca Salin/Gugur)',
  BARU_PASCA_SALIN: 'Baru Pasca Salin (KBPP)',
  BARU_PASCA_GUGUR: 'Baru Pasca Keguguran',
  GANTI_CARA: 'Ganti Cara',
  ULANGAN: 'Ulangan / Kunjungan Rutin',
};

export const ALOKON_LABELS: Record<string, string> = {
  APBN: 'APBN (BKKBN/Pemerintah)',
  NON_APBN: 'Non-APBN (Dinkes/APBD)',
  MANDIRI: 'Mandiri / Swasta',
};

export const ACTION_LABELS: Record<string, string> = {
  PASANG_BARU: 'Pasang Baru',
  PEMBERIAN_ULANG: 'Pemberian Ulang / Suntik',
  PENCABUTAN: 'Pencabutan',
  CABUT_PASANG: 'Cabut & Pasang Kembali',
};

export const SERVICE_PLACE_LABELS: Record<string, string> = {
  PUSKESMAS: 'Puskesmas Induk',
  PUSTU: 'Puskesmas Pembantu (Pustu)',
  POLINDES_POSKESDES: 'Poskesdes / Polindes',
  PMB: 'Praktik Mandiri Bidan (PMB)',
  MOBIL_PELAYANAN: 'Mobil Pelayanan KB (Muyan)',
};

// Keterangan Kode R/I/KB/20 Resmi BKKBN
export const STATUS_PESERTA_KODE_LABELS: Record<number, string> = {
  1: '1 : Peserta KB Baru',
  2: '2 : Peserta KB Ganti',
  3: '3 : Peserta KB Ulangan',
  4: '4 : Komplikasi',
};

export const ALOKON_KODE_OPTIONS: { code: number; label: string; shortLabel: string; method: ContraceptiveMethod }[] = [
  { code: 1, label: '1 : Suntikan 1 Bulanan', shortLabel: 'Suntikan 1 Bulanan', method: 'SUNTIK_1_BLN' },
  { code: 2, label: '2 : Suntikan 3 Bulanan Kombinasi', shortLabel: 'Suntikan 3 Bulanan', method: 'SUNTIK_3_BLN' },
  { code: 3, label: '3 : Suntikan 3 Bulanan Progestin', shortLabel: 'Suntikan 3 Bulanan', method: 'SUNTIK_3_BLN' },
  { code: 4, label: '4 : Pil Kombinasi', shortLabel: 'Pil Kombinasi', method: 'PIL' },
  { code: 5, label: '5 : Pil Progestin', shortLabel: 'Pil Progestin', method: 'PIL' },
  { code: 6, label: '6 : Kondom', shortLabel: 'Kondom', method: 'KONDOM' },
  { code: 7, label: '7 : Implan 1 Batang', shortLabel: 'Implan 1 Batang', method: 'IMPLAN_1_BATANG' },
  { code: 8, label: '8 : Implan 2 Batang', shortLabel: 'Implan 2 Batang', method: 'IMPLAN_2_BATANG' },
  { code: 9, label: '9 : IUD', shortLabel: 'IUD', method: 'IUD' },
  { code: 10, label: '10 : Vasektomi', shortLabel: 'Vasektomi', method: 'MOP' },
  { code: 11, label: '11 : Tubektomi', shortLabel: 'Tubektomi', method: 'MOW' },
];

export function methodToDefaultAlokonKode(method: ContraceptiveMethod): number {
  switch (method) {
    case 'SUNTIK_1_BLN':
      return 1;
    case 'SUNTIK_3_BLN':
      return 3;
    case 'PIL':
      return 4;
    case 'KONDOM':
      return 6;
    case 'IMPLAN_1_BATANG':
      return 7;
    case 'IMPLAN_2_BATANG':
      return 8;
    case 'IUD':
      return 9;
    case 'MOP':
      return 10;
    case 'MOW':
      return 11;
    default:
      return 4;
  }
}

export function alokonKodeToMethod(code: number): ContraceptiveMethod {
  const found = ALOKON_KODE_OPTIONS.find((o) => o.code === code);
  return found ? found.method : 'PIL';
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateR1KB(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const mIdx = parseInt(m, 10) - 1;
  if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) return dateStr;
  return `${d.padStart(2, '0')}-${SHORT_MONTHS[mIdx]}-${y}`;
}

export function getNikDigits16(nik?: string): string[] {
  const clean = (nik || '').replace(/\D/g, '').slice(0, 16);
  const arr: string[] = [];
  for (let i = 0; i < 16; i++) {
    arr.push(clean[i] || '');
  }
  return arr;
}

export function deriveR1KBRow(r: PatientRecord) {
  // Kolom 9: Status Peserta KB (Kode 1..4)
  const statusKode =
    r.statusPesertaKode ??
    (r.participantStatus === 'BARU_BUKAN_PASCA' ||
    r.participantStatus === 'BARU_PASCA_SALIN' ||
    r.participantStatus === 'BARU_PASCA_GUGUR'
      ? 1
      : r.participantStatus === 'GANTI_CARA'
      ? 2
      : 3);

  // Kolom 10: Informed Consent (1 / 0)
  const informedConsentVal = r.informedConsent !== undefined ? (r.informedConsent ? 1 : 0) : 0;

  // Kolom 11: Pasca Persalinan (1 / 0)
  const pascaPersalinanVal =
    r.pascaPersalinan !== undefined
      ? r.pascaPersalinan
        ? 1
        : 0
      : r.participantStatus === 'BARU_PASCA_SALIN'
      ? 1
      : 0;

  // Kolom 12: Pasca Keguguran (1 / 0)
  const pascaKeguguranVal =
    r.pascaKeguguran !== undefined
      ? r.pascaKeguguran
        ? 1
        : 0
      : r.participantStatus === 'BARU_PASCA_GUGUR'
      ? 1
      : 0;

  // Kode Jenis Alokon (1..11)
  const defaultCode = r.alokonKode ?? methodToDefaultAlokonKode(r.method);

  // Kolom 13, 14, 15: Jenis Tindakan (Kode)
  let col13: string | number = '';
  let col14: string | number = '';
  let col15: string | number = '';

  if (r.tindakanPemasanganKode !== undefined || r.tindakanCabutPasangKode !== undefined || r.tindakanPencabutanKode !== undefined) {
    col13 = r.tindakanPemasanganKode ?? '';
    col14 = r.tindakanCabutPasangKode ?? '';
    col15 = r.tindakanPencabutanKode ?? '';
  } else if (r.actionType === 'CABUT_PASANG') {
    col14 = defaultCode;
  } else if (r.actionType === 'PENCABUTAN') {
    col15 = defaultCode;
  } else {
    col13 = defaultCode;
  }

  // Kolom 16, 17: Kasus (Kode)
  const col16 = r.kasusKomplikasiKode ?? '';
  const col17 = r.kasusKegagalanKode ?? '';

  // Kolom 18, 19, 20: Penggunaan Asuransi (1 / 0)
  const asuransiType = r.penggunaanAsuransi ?? (r.bpjsNumber ? 'BPJS' : 'BPJS');
  const col18 = asuransiType === 'BPJS' ? 1 : 0;
  const col19 = asuransiType === 'LAINNYA' ? 1 : 0;
  const col20 = asuransiType === 'TIDAK' ? 1 : 0;

  // Kolom 21, 22, 23: Sumber Alokon (1 / 0)
  const col21 = r.alokonSource === 'APBN' ? 1 : 0;
  const col22 = r.alokonSource === 'NON_APBN' ? 1 : 0;
  const col23 = r.alokonSource === 'MANDIRI' ? 1 : 0;

  // Kolom 24: Pelayanan Bergerak (1 / 0)
  const col24 =
    r.pelayananBergerak !== undefined
      ? r.pelayananBergerak
        ? 1
        : 0
      : r.servicePlace === 'MOBIL_PELAYANAN'
      ? 1
      : 0;

  return {
    tanggalFormatted: formatDateR1KB(r.serviceDate),
    husbandName: (r.husbandName || '-').toUpperCase(),
    nikDigits: getNikDigits16(r.wifeNik),
    wifeName: (r.wifeName || '-').toUpperCase(),
    wifeDobFormatted: formatDateR1KB(r.wifeDob),
    alamat: (r.address || r.village || '-').toUpperCase(),
    phone: r.phone || '',
    col9: statusKode,
    col10: informedConsentVal,
    col11: pascaPersalinanVal,
    col12: pascaKeguguranVal,
    col13,
    col14,
    col15,
    col16,
    col17,
    col18,
    col19,
    col20,
    col21,
    col22,
    col23,
    col24,
  };
}

export function exportRegisterR1KBToExcel(params: {
  records: PatientRecord[];
  faskesName: string;
  selectedMonth: number;
  selectedYear: number;
  filename: string;
}) {
  const { records, faskesName, selectedMonth, selectedYear, filename } = params;
  const activeMonth = selectedMonth > 0 ? selectedMonth : 9;
  const activeYear = selectedYear || 2026;

  const monthBoxRow1 = [1, 2, 3, 4, 5, 6]
    .map(
      (m) =>
        `<td style="border:1px solid #000000; text-align:center; font-family:Consolas,monospace; font-size:8pt; width:18px; font-weight:${
          activeMonth === m ? 'bold' : 'normal'
        };">${activeMonth === m ? 'V' : m}</td>`
    )
    .join('');

  const monthBoxRow2 = [7, 8, 9, 10, 11, 12]
    .map(
      (m) =>
        `<td style="border:1px solid #000000; text-align:center; font-family:Consolas,monospace; font-size:8pt; width:18px; font-weight:${
          activeMonth === m ? 'bold' : 'normal'
        };">${activeMonth === m ? 'V' : m}</td>`
    )
    .join('');

  const rowsHtml = records
    .map((r, index) => {
      const d = deriveR1KBRow(r);
      const nikCells = d.nikDigits
        .map(
          (digit) =>
            `<td style="border:1px solid #000000; padding:3px 1px; text-align:center; font-family:Consolas,monospace; font-size:8.5pt; width:15px; mso-number-format:'\\@';">${digit}</td>`
        )
        .join('');

      return `
        <tr style="height:20pt;">
          <td style="border:1px solid #000000; padding:3px 4px; text-align:center;">${index + 1}</td>
          <td style="border:1px solid #000000; padding:3px 5px; text-align:center; white-space:nowrap; mso-number-format:'\\@';">${d.tanggalFormatted}</td>
          <td style="border:1px solid #000000; padding:3px 5px;">${d.husbandName}</td>
          ${nikCells}
          <td style="border:1px solid #000000; padding:3px 5px;">${d.wifeName}</td>
          <td style="border:1px solid #000000; padding:3px 5px; text-align:center; white-space:nowrap; mso-number-format:'\\@';">${d.wifeDobFormatted}</td>
          <td style="border:1px solid #000000; padding:3px 5px;">${d.alamat}</td>
          <td style="border:1px solid #000000; padding:3px 5px; text-align:center; mso-number-format:'\\@';">${d.phone}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col9}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col10}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col11}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col12}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col13}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col14}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col15}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col16}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col17}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col18}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col19}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col20}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col21}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col22}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col23}</td>
          <td style="border:1px solid #000000; padding:3px 2px; text-align:center;">${d.col24}</td>
        </tr>
      `;
    })
    .join('');

  const vStyle =
    'border:1px solid #000000; padding:4px 2px; text-align:center; vertical-align:bottom; mso-rotate:90; font-size:8pt; width:24px;';

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>REGISTER PELAYANAN KB</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Print>
                  <x:ValidPrinterInfo/>
                  <x:PaperSizeIndex>9</x:PaperSizeIndex>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        @page { size: landscape; margin: 0.4in; }
        body { font-family: Arial, sans-serif; font-size: 8.5pt; color: #000000; }
      </style>
    </head>
    <body>
      <!-- KOP SURAT PERSIS CETAK PDF R/I/KB/20 -->
      <table style="border-collapse:collapse; width:100%; margin-bottom:10px;">
        <tr>
          <td colspan="3" rowspan="2" style="border:1px solid #000000; padding:4px 6px; font-size:8.5pt; vertical-align:top;">
            1. Petugas Entri<br/>Data
          </td>
          <td colspan="26" style="text-align:center; font-size:14pt; font-weight:normal; letter-spacing:0.5px;">
            REGISTER PELAYANAN KB
          </td>
          <td colspan="4" style="background-color:#000000; color:#ffffff; text-align:center; font-weight:bold; font-size:9pt; padding:4px;">
            R/I/KB/20
          </td>
          <td colspan="6" style="text-align:right; font-size:8.5pt; vertical-align:bottom;">
            Lembar <u>&nbsp;&nbsp;1&nbsp;&nbsp;</u>
          </td>
        </tr>
        <tr>
          <td colspan="36" style="height:6px;"></td>
        </tr>
        <tr>
          <td colspan="7" rowspan="2" style="font-size:8.5pt; vertical-align:bottom; padding-top:4px;">
            NAMA FASKES/<br/>JARINGAN/JEJARING : <u>&nbsp;${faskesName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
          </td>
          <td colspan="6" style="text-align:right;"></td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">3</td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">5</td>
          <td style="width:10px;"></td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">2</td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">2</td>
          <td style="width:10px;"></td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">0</td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">0</td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">4</td>
          <td style="width:10px;"></td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">0</td>
          <td style="border:1px solid #000000; text-align:center; font-weight:bold; width:18px;">2</td>
          <td colspan="4" style="text-align:right; font-size:8.5pt; vertical-align:middle; padding-right:4px;">
            Bulan :
          </td>
          ${monthBoxRow1}
          <td colspan="4" rowspan="2" style="border:1px solid #000000; text-align:center; font-weight:bold; font-size:9.5pt; vertical-align:middle;">
            ${activeYear}
          </td>
        </tr>
        <tr>
          <td colspan="6"></td>
          <td colspan="2" style="text-align:center; font-size:7pt; vertical-align:top;">Kode Provinsi</td>
          <td></td>
          <td colspan="2" style="text-align:center; font-size:7pt; vertical-align:top;">Kode<br/>Kabupaten/Kota</td>
          <td></td>
          <td colspan="3" style="text-align:center; font-size:7pt; vertical-align:top;">No. Register Faskes</td>
          <td></td>
          <td colspan="2" style="text-align:center; font-size:7pt; vertical-align:top;">No. Jaringan/<br/>Jejaring Faskes</td>
          <td colspan="4"></td>
          ${monthBoxRow2}
        </tr>
      </table>

      <!-- TABEL UTAMA 24 KOLOM R/I/KB/20 PERSIS CETAK PDF -->
      <table style="border-collapse:collapse; width:100%; font-size:8.5pt;">
        <thead>
          <tr style="text-align:center; font-weight:normal;">
            <th rowspan="3" style="border:1px solid #000000; padding:4px; width:26px;">NO.</th>
            <th rowspan="3" style="border:1px solid #000000; padding:4px; width:72px;">TANGGAL</th>
            <th colspan="21" style="border:1px solid #000000; padding:4px;">PESERTA KB</th>
            <th rowspan="3" style="${vStyle}">STATUS PESERTA KB (Kode)</th>
            <th rowspan="3" style="${vStyle}">INFORMED CONSENT</th>
            <th rowspan="3" style="${vStyle}">PASCA PERSALINAN</th>
            <th rowspan="3" style="${vStyle}">PASCA KEGUGURAN</th>
            <th colspan="3" rowspan="2" style="border:1px solid #000000; padding:4px;">JENIS TINDAKAN<br/>(Kode)</th>
            <th colspan="2" rowspan="2" style="border:1px solid #000000; padding:4px;">Kasus<br/>(Kode)</th>
            <th colspan="3" rowspan="2" style="border:1px solid #000000; padding:4px;">PENGGUNAAN<br/>ASURANSI</th>
            <th colspan="3" rowspan="2" style="border:1px solid #000000; padding:4px;">SUMBER ALOKON</th>
            <th rowspan="3" style="${vStyle}">PELAYANAN BERGERAK</th>
          </tr>
          <tr style="text-align:center; font-weight:normal;">
            <th rowspan="2" style="border:1px solid #000000; padding:4px; width:115px;">NAMA SUAMI</th>
            <th colspan="18" style="border:1px solid #000000; padding:4px;">ISTRI</th>
            <th rowspan="2" style="border:1px solid #000000; padding:4px; width:115px;">ALAMAT</th>
            <th rowspan="2" style="border:1px solid #000000; padding:4px; width:90px;">NO. HANDPHONE</th>
          </tr>
          <tr style="text-align:center; font-weight:normal; height:95pt;">
            <th colspan="16" style="border:1px solid #000000; padding:4px; vertical-align:middle;">NIK (NOMOR INDUK KEPENDUDUKAN)</th>
            <th style="border:1px solid #000000; padding:4px; width:115px; vertical-align:middle;">NAMA</th>
            <th style="border:1px solid #000000; padding:4px; width:72px; vertical-align:middle;">TANGGAL<br/>LAHIR</th>
            <th style="${vStyle}">OPERATIF / PEMBERIAN / PEMASANGAN</th>
            <th style="${vStyle}">PENCABUTAN DAN PEMASANGAN</th>
            <th style="${vStyle}">PENCABUTAN</th>
            <th style="${vStyle}">KOMPLIKASI BERAT</th>
            <th style="${vStyle}">KEGAGALAN</th>
            <th style="${vStyle}">BPJS KESEHATAN</th>
            <th style="${vStyle}">LAINNYA</th>
            <th style="${vStyle}">TIDAK</th>
            <th style="${vStyle}">APBN</th>
            <th style="${vStyle}">APBD</th>
            <th style="${vStyle}">MANDIRI</th>
          </tr>
          <tr style="text-align:center; font-size:8pt;">
            <th style="border:1px solid #000000; padding:2px;">1</th>
            <th style="border:1px solid #000000; padding:2px;">2</th>
            <th style="border:1px solid #000000; padding:2px;">3</th>
            <th colspan="16" style="border:1px solid #000000; padding:2px;">4</th>
            <th style="border:1px solid #000000; padding:2px;">5</th>
            <th style="border:1px solid #000000; padding:2px;">6</th>
            <th style="border:1px solid #000000; padding:2px;">7</th>
            <th style="border:1px solid #000000; padding:2px;">8</th>
            <th style="border:1px solid #000000; padding:2px;">9</th>
            <th style="border:1px solid #000000; padding:2px;">10</th>
            <th style="border:1px solid #000000; padding:2px;">11</th>
            <th style="border:1px solid #000000; padding:2px;">12</th>
            <th style="border:1px solid #000000; padding:2px;">13</th>
            <th style="border:1px solid #000000; padding:2px;">14</th>
            <th style="border:1px solid #000000; padding:2px;">15</th>
            <th style="border:1px solid #000000; padding:2px;">16</th>
            <th style="border:1px solid #000000; padding:2px;">17</th>
            <th style="border:1px solid #000000; padding:2px;">18</th>
            <th style="border:1px solid #000000; padding:2px;">19</th>
            <th style="border:1px solid #000000; padding:2px;">20</th>
            <th style="border:1px solid #000000; padding:2px;">21</th>
            <th style="border:1px solid #000000; padding:2px;">22</th>
            <th style="border:1px solid #000000; padding:2px;">23</th>
            <th style="border:1px solid #000000; padding:2px;">24</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- KETERANGAN KODE BAWAH PERSIS CETAK PDF -->
      <table style="border-collapse:collapse; margin-top:10px; font-size:8pt;">
        <tr>
          <td colspan="30" style="padding:4px 0; font-weight:normal;">1) Keterangan Kode</td>
        </tr>
        <tr>
          <td colspan="8" style="border:1px solid #000000; text-align:center; padding:3px;">STATUS PESERTA KB</td>
          <td colspan="22" style="border:1px solid #000000; text-align:center; padding:3px;">KODE JENIS ALOKON (Diisi Pada Jenis Tindakan dan Kasus)</td>
        </tr>
        <tr>
          <td colspan="4" style="border-left:1px solid #000000; padding:2px 6px;">1 : Peserta KB Baru</td>
          <td colspan="4" style="border-right:1px solid #000000; padding:2px 6px;">3 : Peserta KB Ulangan</td>
          <td colspan="4" style="padding:2px 6px;">1 : Suntikan 1 Bulanan</td>
          <td colspan="4" style="padding:2px 6px;">3 : Suntikan 3 Bulanan</td>
          <td colspan="4" style="padding:2px 6px;">5 : Pil Progestin</td>
          <td colspan="4" style="padding:2px 6px;">7 : Implan 1 Batang</td>
          <td colspan="3" style="padding:2px 6px;">9 : IUD</td>
          <td colspan="3" style="border-right:1px solid #000000; padding:2px 6px;">11 : Tubektomi</td>
        </tr>
        <tr>
          <td colspan="4" style="border-left:1px solid #000000; border-bottom:1px solid #000000; padding:2px 6px;">2 : Peserta KB Ganti</td>
          <td colspan="4" style="border-right:1px solid #000000; border-bottom:1px solid #000000; padding:2px 6px;">4 : Komplikasi</td>
          <td colspan="4" style="border-bottom:1px solid #000000; padding:2px 6px;">2 : Suntikan 3 Bulanan</td>
          <td colspan="4" style="border-bottom:1px solid #000000; padding:2px 6px;">4 : Pil Kombinasi</td>
          <td colspan="4" style="border-bottom:1px solid #000000; padding:2px 6px;">6 : Kondom</td>
          <td colspan="4" style="border-bottom:1px solid #000000; padding:2px 6px;">8 : Implan 2 Batang</td>
          <td colspan="6" style="border-right:1px solid #000000; border-bottom:1px solid #000000; padding:2px 6px;">10 : Vasektomi</td>
        </tr>
        <tr>
          <td colspan="30" style="padding-top:6px;">2) SELAIN STATUS PESERTA KB, JENIS TINDAKAN DAN KASUS DIISI TANDA CENTANG (V)</td>
        </tr>
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
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const initialFacilityProfile: FacilityProfile = {
  name: 'DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK DAN KB KABUPATEN BOJONEGORO',
  code: '35220000',
  k0kbCode: 'K/0/KB/3522',
  address: 'Jl. Basuki Rahmat No. 1, Sukorejo, Kec. Bojonegoro, Kab. Bojonegoro, Jawa Timur 62115',
  district: 'Bojonegoro',
  regency: 'Kabupaten Bojonegoro',
  province: 'Jawa Timur',
  phone: '(0353) 881234',
  email: 'dinas.p3akb@bojonegorokab.go.id',
  headName: 'Drs. Heru Sugiharto, M.Si',
  headNip: '19680514 199303 1 008',
  headTitle: 'Kepala Dinas P3AKB Kabupaten Bojonegoro',
  kbCoordinatorName: 'Dra. Siti Munawaroh, M.M',
  kbCoordinatorNip: '19740912 199803 2 005',
  kbCoordinatorTitle: 'Kepala Bidang Pengendalian Penduduk dan KB (Dalduk KB)',
};

export const initialDistricts: District[] = [
  { id: 'kec-bojonegorokota', name: 'Bojonegoro', institutionName: 'BALAI PENYULUHAN KB KECAMATAN BOJONEGORO', k0kbCode: '3522010', address: 'Kecamatan Bojonegoro, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kapas', name: 'Kapas', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KAPAS', k0kbCode: '3522020', address: 'Kecamatan Kapas, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-dander', name: 'Dander', institutionName: 'BALAI PENYULUHAN KB KECAMATAN DANDER', k0kbCode: '3522030', address: 'Kecamatan Dander, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kalitidu', name: 'Kalitidu', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KALITIDU', k0kbCode: '3522040', address: 'Kecamatan Kalitidu, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-balen', name: 'Balen', institutionName: 'BALAI PENYULUHAN KB KECAMATAN BALEN', k0kbCode: '3522050', address: 'Kecamatan Balen, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-sumberrejo', name: 'Sumberrejo', institutionName: 'BALAI PENYULUHAN KB KECAMATAN SUMBERREJO', k0kbCode: '3522060', address: 'Kecamatan Sumberrejo, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-baureno', name: 'Baureno', institutionName: 'BALAI PENYULUHAN KB KECAMATAN BAURENO', k0kbCode: '3522070', address: 'Kecamatan Baureno, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kanor', name: 'Kanor', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KANOR', k0kbCode: '3522080', address: 'Kecamatan Kanor, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-trucuk', name: 'Trucuk', institutionName: 'BALAI PENYULUHAN KB KECAMATAN TRUCUK', k0kbCode: '3522090', address: 'Kecamatan Trucuk, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-padangan', name: 'Padangan', institutionName: 'BALAI PENYULUHAN KB KECAMATAN PADANGAN', k0kbCode: '3522100', address: 'Kecamatan Padangan, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-purwosari', name: 'Purwosari', institutionName: 'BALAI PENYULUHAN KB KECAMATAN PURWOSARI', k0kbCode: '3522110', address: 'Kecamatan Purwosari, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-malo', name: 'Malo', institutionName: 'BALAI PENYULUHAN KB KECAMATAN MALO', k0kbCode: '3522120', address: 'Kecamatan Malo, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-ngasem', name: 'Ngasem', institutionName: 'BALAI PENYULUHAN KB KECAMATAN NGASEM', k0kbCode: '3522130', address: 'Kecamatan Ngasem, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-tambakrejo', name: 'Tambakrejo', institutionName: 'BALAI PENYULUHAN KB KECAMATAN TAMBAKREJO', k0kbCode: '3522140', address: 'Kecamatan Tambakrejo, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-ngambon', name: 'Ngambon', institutionName: 'BALAI PENYULUHAN KB KECAMATAN NGAMBON', k0kbCode: '3522150', address: 'Kecamatan Ngambon, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-ngraho', name: 'Ngraho', institutionName: 'BALAI PENYULUHAN KB KECAMATAN NGRAHO', k0kbCode: '3522160', address: 'Kecamatan Ngraho, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-margomulyo', name: 'Margomulyo', institutionName: 'BALAI PENYULUHAN KB KECAMATAN MARGOMULYO', k0kbCode: '3522170', address: 'Kecamatan Margomulyo, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-bubulan', name: 'Bubulan', institutionName: 'BALAI PENYULUHAN KB KECAMATAN BUBULAN', k0kbCode: '3522180', address: 'Kecamatan Bubulan, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-temayang', name: 'Temayang', institutionName: 'BALAI PENYULUHAN KB KECAMATAN TEMAYANG', k0kbCode: '3522190', address: 'Kecamatan Temayang, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-sugihwaras', name: 'Sugihwaras', institutionName: 'BALAI PENYULUHAN KB KECAMATAN SUGIHWARAS', k0kbCode: '3522200', address: 'Kecamatan Sugihwaras, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-sukosewu', name: 'Sukosewu', institutionName: 'BALAI PENYULUHAN KB KECAMATAN SUKOSEWU', k0kbCode: '3522210', address: 'Kecamatan Sukosewu, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kedungadem', name: 'Kedungadem', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KEDUNGADEM', k0kbCode: '3522220', address: 'Kecamatan Kedungadem, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kepohbaru', name: 'Kepohbaru', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KEPOHBARU', k0kbCode: '3522230', address: 'Kecamatan Kepohbaru, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kasiman', name: 'Kasiman', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KASIMAN', k0kbCode: '3522240', address: 'Kecamatan Kasiman, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-kedewan', name: 'Kedewan', institutionName: 'BALAI PENYULUHAN KB KECAMATAN KEDEWAN', k0kbCode: '3522250', address: 'Kecamatan Kedewan, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-gondang', name: 'Gondang', institutionName: 'BALAI PENYULUHAN KB KECAMATAN GONDANG', k0kbCode: '3522260', address: 'Kecamatan Gondang, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-sekar', name: 'Sekar', institutionName: 'BALAI PENYULUHAN KB KECAMATAN SEKAR', k0kbCode: '3522270', address: 'Kecamatan Sekar, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
  { id: 'kec-gayam', name: 'Gayam', institutionName: 'BALAI PENYULUHAN KB KECAMATAN GAYAM', k0kbCode: '3522280', address: 'Kecamatan Gayam, Kabupaten Bojonegoro, Jawa Timur', regency: 'Kabupaten Bojonegoro', province: 'Jawa Timur' },
];

export const initialVillages: Village[] = [];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: '123',
    role: 'admin_induk',
    name: 'Administrator Dinas P3AKB Bojonegoro',
    phone: '081234567890',
    nip: '19850101 201001 1 020',
  },
  {
    id: 'usr-kec-1',
    username: 'adminkec_bojonegoro',
    password: '123',
    role: 'admin_kecamatan',
    name: 'Koordinator PKB Kec. Bojonegoro',
    district: 'Bojonegoro',
    phone: '081398765432',
    nip: '19790315 200502 2 007',
  },
  {
    id: 'usr-kec-2',
    username: 'adminkec_kapas',
    password: '123',
    role: 'admin_kecamatan',
    name: 'Koordinator PKB Kec. Kapas',
    district: 'Kapas',
    phone: '081398765433',
    nip: '19810412 200801 1 012',
  },
  {
    id: 'usr-kec-3',
    username: 'adminkec_dander',
    password: '123',
    role: 'admin_kecamatan',
    name: 'Koordinator PKB Kec. Dander',
    district: 'Dander',
    phone: '081398765434',
    nip: '19830722 201001 2 018',
  },
  {
    id: 'usr-kec-4',
    username: 'adminkec_kalitidu',
    password: '123',
    role: 'admin_kecamatan',
    name: 'Koordinator PKB Kec. Kalitidu',
    district: 'Kalitidu',
    phone: '081398765435',
    nip: '19820510 200901 1 015',
  },
  {
    id: 'usr-des-1',
    username: 'sukorejo',
    password: '123',
    role: 'admin_desa',
    name: 'Kader PPKBD Desa Sukorejo',
    village: 'Sukorejo',
    phone: '085712345671',
    nip: '19870512 201101 2 015',
  },
  {
    id: 'usr-des-2',
    username: 'klangon',
    password: '123',
    role: 'admin_desa',
    name: 'Kader PPKBD Desa Klangon',
    village: 'Klangon',
    phone: '085712345672',
    nip: '19900918 201402 2 021',
  },
  {
    id: 'usr-des-3',
    username: 'plesungan',
    password: '123',
    role: 'admin_desa',
    name: 'Kader PPKBD Desa Plesungan',
    village: 'Plesungan',
    phone: '085712345673',
  },
  {
    id: 'usr-des-4',
    username: 'dander',
    password: '123',
    role: 'admin_desa',
    name: 'Kader PPKBD Desa Dander',
    village: 'Dander',
    phone: '085712345674',
  },
];

export const initialSampleRecords: PatientRecord[] = [];

export const sampleAgustus2026Records: PatientRecord[] = [
  {
    id: 'rec-agust-1',
    serviceDate: '2026-08-03',
    registerNumber: 'REG-2608-001',
    wifeNik: '3522015603950001',
    wifeName: 'Siti Aminah',
    wifeDob: '1995-03-16',
    wifeAge: 31,
    husbandNik: '3522011205920002',
    husbandName: 'Joko Susanto',
    bpjsNumber: '0001234567891',
    address: 'RT 03 / RW 01 Sukorejo',
    village: 'Sukorejo',
    district: 'Bojonegoro',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 1,
    youngestChildAgeMonths: 14,
    participantStatus: 'BARU_PASCA_SALIN',
    method: 'SUNTIK_3_BLN',
    alokonSource: 'APBN',
    actionType: 'PEMBERIAN_ULANG',
    bloodPressure: '120/80',
    weightKg: 56,
    hpht: '2026-07-20',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Siti Rahayu, S.Tr.Keb',
    createdAt: '2026-08-03T09:15:00Z',
    updatedAt: '2026-08-03T09:15:00Z',
    createdByUsername: 'sukorejo',
  },
  {
    id: 'rec-agust-2',
    serviceDate: '2026-08-05',
    registerNumber: 'REG-2608-002',
    wifeNik: '3522014807980003',
    wifeName: 'Sri Wahyuni',
    wifeDob: '1998-07-08',
    wifeAge: 28,
    husbandNik: '3522012004960004',
    husbandName: 'Eko Prasetyo',
    bpjsNumber: '0001234567892',
    address: 'RT 02 / RW 03 Klangon',
    village: 'Klangon',
    district: 'Bojonegoro',
    aliveChildrenMale: 2,
    aliveChildrenFemale: 0,
    youngestChildAgeMonths: 24,
    participantStatus: 'GANTI_CARA',
    previousMethod: 'SUNTIK_3_BLN',
    method: 'IMPLAN_2_BATANG',
    alokonSource: 'APBN',
    actionType: 'PASANG_BARU',
    bloodPressure: '110/70',
    weightKg: 52,
    hpht: '2026-08-01',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Dewi Lestari, Amd.Keb',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
    createdByUsername: 'klangon',
  },
  {
    id: 'rec-agust-3',
    serviceDate: '2026-08-10',
    registerNumber: 'REG-2608-003',
    wifeNik: '3522026211930005',
    wifeName: 'Rina Kartika',
    wifeDob: '1993-11-22',
    wifeAge: 32,
    husbandNik: '3522021508900006',
    husbandName: 'Budi Santoso',
    bpjsNumber: '0001234567893',
    address: 'RT 05 / RW 02 Plesungan',
    village: 'Plesungan',
    district: 'Kapas',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 2,
    youngestChildAgeMonths: 8,
    participantStatus: 'BARU_BUKAN_PASCA',
    method: 'IUD',
    alokonSource: 'APBN',
    actionType: 'PASANG_BARU',
    bloodPressure: '115/75',
    weightKg: 58,
    hpht: '2026-08-04',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Rina Melati, Amd.Keb',
    createdAt: '2026-08-10T11:20:00Z',
    updatedAt: '2026-08-10T11:20:00Z',
    createdByUsername: 'plesungan',
  },
  {
    id: 'rec-agust-4',
    serviceDate: '2026-08-14',
    registerNumber: 'REG-2608-004',
    wifeNik: '3522035002010007',
    wifeName: 'Dwi Hastuti',
    wifeDob: '2001-02-10',
    wifeAge: 25,
    husbandNik: '3522030309990008',
    husbandName: 'Agus Setiawan',
    bpjsNumber: '0001234567894',
    address: 'RT 01 / RW 01 Desa Dander',
    village: 'Dander',
    district: 'Dander',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 0,
    youngestChildAgeMonths: 6,
    participantStatus: 'BARU_PASCA_SALIN',
    method: 'SUNTIK_3_BLN',
    alokonSource: 'APBN',
    actionType: 'PEMBERIAN_ULANG',
    bloodPressure: '120/80',
    weightKg: 50,
    hpht: '2026-08-02',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Fitri Handayani, Amd.Keb',
    createdAt: '2026-08-14T08:45:00Z',
    updatedAt: '2026-08-14T08:45:00Z',
    createdByUsername: 'dander',
  },
  {
    id: 'rec-agust-5',
    serviceDate: '2026-08-18',
    registerNumber: 'REG-2608-005',
    wifeNik: '3522016506940009',
    wifeName: 'Tri Mulyani',
    wifeDob: '1994-06-25',
    wifeAge: 32,
    husbandNik: '3522012512910010',
    husbandName: 'Hendra Wijaya',
    bpjsNumber: '0001234567895',
    address: 'RT 04 / RW 02 Kauman',
    village: 'Kauman',
    district: 'Bojonegoro',
    aliveChildrenMale: 0,
    aliveChildrenFemale: 2,
    youngestChildAgeMonths: 36,
    participantStatus: 'ULANGAN',
    method: 'SUNTIK_1_BLN',
    alokonSource: 'MANDIRI',
    actionType: 'PEMBERIAN_ULANG',
    bloodPressure: '125/85',
    weightKg: 62,
    hpht: '2026-08-11',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Anisa Tri Astuti, Amd.Keb',
    createdAt: '2026-08-18T09:30:00Z',
    updatedAt: '2026-08-18T09:30:00Z',
    createdByUsername: 'kauman',
  },
  {
    id: 'rec-agust-6',
    serviceDate: '2026-08-22',
    registerNumber: 'REG-2608-006',
    wifeNik: '3522014408970011',
    wifeName: 'Endang Sulistiyani',
    wifeDob: '1997-08-04',
    wifeAge: 29,
    husbandNik: '3522011801950012',
    husbandName: 'Bambang Pamungkas',
    bpjsNumber: '0001234567896',
    address: 'RT 02 / RW 01 Pacul',
    village: 'Pacul',
    district: 'Bojonegoro',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 1,
    youngestChildAgeMonths: 18,
    participantStatus: 'ULANGAN',
    method: 'PIL',
    alokonSource: 'APBN',
    actionType: 'PEMBERIAN_ULANG',
    bloodPressure: '110/70',
    weightKg: 54,
    hpht: '2026-08-15',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSTU',
    officerName: 'Bd. Tri Wahyuni, Amd.Keb',
    createdAt: '2026-08-22T10:15:00Z',
    updatedAt: '2026-08-22T10:15:00Z',
    createdByUsername: 'pacul',
  },
  {
    id: 'rec-agust-7',
    serviceDate: '2026-08-25',
    registerNumber: 'REG-2608-007',
    wifeNik: '3522035509920013',
    wifeName: 'Nur Hidayati',
    wifeDob: '1992-09-15',
    wifeAge: 33,
    husbandNik: '3522030706890014',
    husbandName: 'Arif Wicaksono',
    bpjsNumber: '0001234567897',
    address: 'RT 03 / RW 02 Ngumpakdalem',
    village: 'Ngumpakdalem',
    district: 'Dander',
    aliveChildrenMale: 2,
    aliveChildrenFemale: 1,
    youngestChildAgeMonths: 40,
    participantStatus: 'GANTI_CARA',
    previousMethod: 'PIL',
    method: 'IMPLAN_1_BATANG',
    alokonSource: 'APBN',
    actionType: 'PASANG_BARU',
    bloodPressure: '120/80',
    weightKg: 65,
    hpht: '2026-08-18',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Dian Anggraini, S.Tr.Keb',
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    createdByUsername: 'ngumpakdalem',
  },
  {
    id: 'rec-agust-8',
    serviceDate: '2026-08-28',
    registerNumber: 'REG-2608-008',
    wifeNik: '3522026012990015',
    wifeName: 'Wulandari',
    wifeDob: '1999-12-20',
    wifeAge: 26,
    husbandNik: '3522022210960016',
    husbandName: 'Rudi Hartono',
    bpjsNumber: '0001234567898',
    address: 'RT 01 / RW 04 Semanding',
    village: 'Semanding',
    district: 'Kapas',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 0,
    youngestChildAgeMonths: 12,
    participantStatus: 'BARU_BUKAN_PASCA',
    method: 'KONDOM',
    alokonSource: 'APBN',
    actionType: 'PEMBERIAN_ULANG',
    bloodPressure: '115/75',
    weightKg: 48,
    hpht: '2026-08-20',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'TIDAK',
    servicePlace: 'POLINDES_POSKESDES',
    officerName: 'Bd. Sri Utami, S.Tr.Keb',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T09:00:00Z',
    createdByUsername: 'semanding',
  },
  {
    id: 'rec-agust-9',
    serviceDate: '2026-08-29',
    registerNumber: 'REG-2608-009',
    wifeNik: '3522014502880017',
    wifeName: 'Maryatun',
    wifeDob: '1988-02-15',
    wifeAge: 38,
    husbandNik: '3522011005850018',
    husbandName: 'Joko Prayitno',
    bpjsNumber: '0001234567899',
    address: 'RT 03 / RW 02 Mojokampung',
    village: 'Mojokampung',
    district: 'Bojonegoro',
    aliveChildrenMale: 2,
    aliveChildrenFemale: 1,
    youngestChildAgeMonths: 48,
    participantStatus: 'GANTI_CARA',
    previousMethod: 'IUD',
    method: 'MOW',
    alokonSource: 'APBN',
    actionType: 'PASANG_BARU',
    bloodPressure: '120/80',
    weightKg: 60,
    hpht: '2026-08-15',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'DIRUJUK_RS',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Nurul Hidayah, S.Tr.Keb',
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: '2026-08-29T10:00:00Z',
    createdByUsername: 'mojokampung',
  },
  {
    id: 'rec-agust-10',
    serviceDate: '2026-08-30',
    registerNumber: 'REG-2608-010',
    wifeNik: '3522015206900019',
    wifeName: 'Siti Lestari',
    wifeDob: '1990-06-12',
    wifeAge: 36,
    husbandNik: '3522010803870020',
    husbandName: 'Slamet Widodo',
    bpjsNumber: '0001234567810',
    address: 'RT 02 / RW 01 Sukorejo',
    village: 'Sukorejo',
    district: 'Bojonegoro',
    aliveChildrenMale: 1,
    aliveChildrenFemale: 2,
    youngestChildAgeMonths: 36,
    participantStatus: 'BARU_BUKAN_PASCA',
    method: 'MOP',
    alokonSource: 'APBN',
    actionType: 'PASANG_BARU',
    bloodPressure: '120/75',
    weightKg: 68,
    hpht: '',
    sideEffects: 'Tidak Ada',
    complications: 'Tidak Ada',
    referralStatus: 'DIRUJUK_RS',
    servicePlace: 'PUSKESMAS',
    officerName: 'Bd. Siti Rahayu, S.Tr.Keb',
    createdAt: '2026-08-30T09:30:00Z',
    updatedAt: '2026-08-30T09:30:00Z',
    createdByUsername: 'sukorejo',
  },
];
