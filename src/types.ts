export type Role =
  | 'admin_induk'
  | 'admin_kabupaten'
  | 'admin_kecamatan'
  | 'admin_desa'
  | 'bidan_desa';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  district?: string; // district assigned for admin_kecamatan (or targeted by admin_induk)
  village?: string; // village assigned for admin_desa
  phone?: string;
  nip?: string;
}

export interface Village {
  id: string;
  name: string;
  district: string;
  entryAllowed: boolean; // whether bidan desa is allowed to enter data
  assignedBidanName?: string;
  assignedUsername?: string;
  notes?: string;
}

export interface District {
  id: string;
  name: string;
  institutionName?: string; // Nama Instansi / Balai Penyuluhan KB / Faskes Kecamatan
  k0kbCode?: string; // Kode Register Kecamatan
  address?: string; // Alamat Lengkap Kantor Kecamatan
  regency?: string; // Kabupaten / Kota
  province?: string; // Provinsi
}

export interface FacilityProfile {
  name: string;
  code: string; // Kode Faskes KB BKKBN
  k0kbCode: string; // Kode Register K/0/KB
  address: string;
  district: string;
  regency: string;
  province: string;
  phone: string;
  email: string;
  headName: string;
  headNip: string;
  headTitle: string; // e.g. "Kepala UPTD Puskesmas Sambungmacan I"
  kbCoordinatorName: string;
  kbCoordinatorNip: string;
  kbCoordinatorTitle: string; // e.g. "Bidan Koordinator KB"
}

export type ContraceptiveMethod =
  | 'SUNTIK_1_BLN'
  | 'SUNTIK_3_BLN'
  | 'PIL'
  | 'KONDOM'
  | 'IUD'
  | 'IMPLAN_1_BATANG'
  | 'IMPLAN_2_BATANG'
  | 'MOW'
  | 'MOP';

export type ParticipantStatus =
  | 'BARU_BUKAN_PASCA'
  | 'BARU_PASCA_SALIN'
  | 'BARU_PASCA_GUGUR'
  | 'GANTI_CARA'
  | 'ULANGAN';

export type AlokonSource = 'APBN' | 'NON_APBN' | 'MANDIRI';

export type ActionType =
  | 'PASANG_BARU'
  | 'PEMBERIAN_ULANG'
  | 'PENCABUTAN'
  | 'CABUT_PASANG';

export type ServicePlace =
  | 'PUSKESMAS'
  | 'PUSTU'
  | 'POLINDES_POSKESDES'
  | 'PMB'
  | 'MOBIL_PELAYANAN';

export interface PatientRecord {
  id: string;
  serviceDate: string; // YYYY-MM-DD (Kolom 2)
  registerNumber: string;
  wifeNik: string; // 16 digit NIK Istri (Kolom 4)
  wifeName: string; // Nama Istri (Kolom 5)
  wifeDob: string; // YYYY-MM-DD Tanggal Lahir Istri (Kolom 6)
  wifeAge: number;
  husbandNik: string;
  husbandName: string; // Nama Suami (Kolom 3)
  bpjsNumber: string;
  address: string; // Alamat (Kolom 7)
  phone?: string; // No. Handphone (Kolom 8)
  village: string;
  district: string;
  aliveChildrenMale: number;
  aliveChildrenFemale: number;
  youngestChildAgeMonths: number;
  participantStatus: ParticipantStatus;
  // Kolom 9-24 sesuai Formulir R/I/KB/20 Resmi:
  statusPesertaKode?: 1 | 2 | 3 | 4; // Kolom 9: 1=Baru, 2=Ganti, 3=Ulangan, 4=Komplikasi
  informedConsent?: boolean; // Kolom 10: 1 / 0
  pascaPersalinan?: boolean; // Kolom 11: 1 / 0
  pascaKeguguran?: boolean; // Kolom 12: 1 / 0
  jenisTindakanKategori?: 'PEMASANGAN' | 'CABUT_PASANG' | 'PENCABUTAN'; // Kolom 13, 14, 15
  alokonKode?: number; // Kode Jenis Alokon 1 s/d 11
  tindakanPemasanganKode?: number | string; // Kolom 13: Operatif/Pemberian/Pemasangan
  tindakanCabutPasangKode?: number | string; // Kolom 14: Pencabutan dan Pemasangan
  tindakanPencabutanKode?: number | string; // Kolom 15: Pencabutan
  kasusKomplikasiKode?: number | string; // Kolom 16: Kasus Komplikasi Berat (Kode Alokon)
  kasusKegagalanKode?: number | string; // Kolom 17: Kasus Kegagalan (Kode Alokon)
  penggunaanAsuransi?: 'BPJS' | 'LAINNYA' | 'TIDAK'; // Kolom 18, 19, 20
  pelayananBergerak?: boolean; // Kolom 24: 1 / 0
  faskesJaringanNama?: string; // Nama Faskes/Jaringan/Jejaring (contoh: Pustu Trenggulunan)
  previousMethod?: ContraceptiveMethod | string;
  method: ContraceptiveMethod;
  alokonSource: AlokonSource; // Kolom 21 (APBN), 22 (APBD/NON_APBN), 23 (MANDIRI)
  actionType: ActionType;
  bloodPressure: string;
  weightKg: number;
  hpht?: string;
  medicalNotes?: string;
  sideEffects: string;
  complications: string;
  referralStatus: 'TIDAK' | 'DIRUJUK_RS' | 'DIRUJUK_FKTP';
  servicePlace: ServicePlace;
  officerName: string;
  createdAt: string;
  updatedAt: string;
  createdByUsername: string;
}

export interface MonthlyF2KBCellData {
  methodKey: ContraceptiveMethod;
  methodLabel: string;
  baruBukanPasca: number;
  baruPascaSalin: number;
  baruPascaGugur: number;
  totalBaru: number;
  gantiCara: number;
  ulangan: number;
  totalPelayanan: number; // totalBaru + gantiCara + ulangan
  apbn: number;
  apbd: number;
  mandiri: number;
  nonApbn: number;
  komplikasi: number;
  kegagalan: number;
  cabutAlokon: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details: string;
}
