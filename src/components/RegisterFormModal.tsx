import React, { useState, useEffect } from 'react';
import {
  ActionType,
  AlokonSource,
  ContraceptiveMethod,
  ParticipantStatus,
  PatientRecord,
  ServicePlace,
  User,
  Village,
} from '../types';
import {
  ALOKON_KODE_OPTIONS,
  STATUS_PESERTA_KODE_LABELS,
  alokonKodeToMethod,
  methodToDefaultAlokonKode,
} from '../data/initialData';
import { X, Save, AlertCircle, UserCheck, Heart, ShieldCheck, FileText } from 'lucide-react';

interface RegisterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'> | PatientRecord) => void;
  initialData?: PatientRecord | null;
  villages: Village[];
  currentUser: User | null;
  existingRecordsCount: number;
}

export const RegisterFormModal: React.FC<RegisterFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  villages,
  currentUser,
  existingRecordsCount,
}) => {
  const isEdit = !!initialData;
  const isUserDesa =
    currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';

  const defaultVillage =
    initialData?.village ||
    (isUserDesa && currentUser?.village ? currentUser.village : villages[0]?.name || '');

  const selectedVillageObj = villages.find((v) => v.name === defaultVillage);
  const isVillageLocked = selectedVillageObj && !selectedVillageObj.entryAllowed && isUserDesa;

  // Kolom 2: TANGGAL
  const [serviceDate, setServiceDate] = useState(
    initialData?.serviceDate || new Date().toISOString().split('T')[0]
  );
  const [registerNumber, setRegisterNumber] = useState(initialData?.registerNumber || '');

  // Kolom 3-8: PESERTA KB (Nama Suami, NIK Istri 16 digit, Nama Istri, Tanggal Lahir, Alamat, No. HP)
  const [husbandName, setHusbandName] = useState(initialData?.husbandName || '');
  const [wifeNik, setWifeNik] = useState(initialData?.wifeNik || '');
  const [wifeName, setWifeName] = useState(initialData?.wifeName || '');
  const [wifeDob, setWifeDob] = useState(initialData?.wifeDob || '1995-02-24');
  const [village, setVillage] = useState(defaultVillage);
  const [address, setAddress] = useState(initialData?.address || defaultVillage.toUpperCase());
  const [phone, setPhone] = useState(initialData?.phone || '');

  // Kolom 9: STATUS PESERTA KB (Kode 1..4)
  const initialStatusKode: 1 | 2 | 3 | 4 =
    initialData?.statusPesertaKode ??
    (initialData?.participantStatus === 'BARU_BUKAN_PASCA' ||
    initialData?.participantStatus === 'BARU_PASCA_SALIN' ||
    initialData?.participantStatus === 'BARU_PASCA_GUGUR'
      ? 1
      : initialData?.participantStatus === 'GANTI_CARA'
      ? 2
      : 3);
  const [statusPesertaKode, setStatusPesertaKode] = useState<1 | 2 | 3 | 4>(initialStatusKode);

  // Kolom 10, 11, 12: Informed Consent, Pasca Persalinan, Pasca Keguguran (1 / 0)
  const [informedConsent, setInformedConsent] = useState<boolean>(
    initialData?.informedConsent ?? false
  );
  const [pascaPersalinan, setPascaPersalinan] = useState<boolean>(
    initialData?.pascaPersalinan ?? initialData?.participantStatus === 'BARU_PASCA_SALIN'
  );
  const [pascaKeguguran, setPascaKeguguran] = useState<boolean>(
    initialData?.pascaKeguguran ?? initialData?.participantStatus === 'BARU_PASCA_GUGUR'
  );

  // Kolom 13, 14, 15: JENIS TINDAKAN (Kode 1..11)
  const initialAlokonKode =
    initialData?.alokonKode ??
    (initialData?.method ? methodToDefaultAlokonKode(initialData.method) : 4);
  const [alokonKode, setAlokonKode] = useState<number>(initialAlokonKode);

  const initialKategoriTindakan: 'PEMASANGAN' | 'CABUT_PASANG' | 'PENCABUTAN' =
    initialData?.jenisTindakanKategori ??
    (initialData?.actionType === 'CABUT_PASANG'
      ? 'CABUT_PASANG'
      : initialData?.actionType === 'PENCABUTAN'
      ? 'PENCABUTAN'
      : 'PEMASANGAN');
  const [jenisTindakanKategori, setJenisTindakanKategori] = useState<
    'PEMASANGAN' | 'CABUT_PASANG' | 'PENCABUTAN'
  >(initialKategoriTindakan);

  // Kolom 16, 17: Kasus (Kode Alokon bila ada)
  const [kasusKomplikasiKode, setKasusKomplikasiKode] = useState<string>(
    initialData?.kasusKomplikasiKode ? String(initialData.kasusKomplikasiKode) : ''
  );
  const [kasusKegagalanKode, setKasusKegagalanKode] = useState<string>(
    initialData?.kasusKegagalanKode ? String(initialData.kasusKegagalanKode) : ''
  );

  // Kolom 18, 19, 20: PENGGUNAAN ASURANSI (BPJS Kesehatan / Lainnya / Tidak)
  const [penggunaanAsuransi, setPenggunaanAsuransi] = useState<'BPJS' | 'LAINNYA' | 'TIDAK'>(
    initialData?.penggunaanAsuransi || 'BPJS'
  );

  // Kolom 21, 22, 23: SUMBER ALOKON (APBN / APBD / MANDIRI)
  const [alokonSource, setAlokonSource] = useState<AlokonSource>(
    initialData?.alokonSource || 'APBN'
  );

  // Kolom 24: PELAYANAN BERGERAK (1 / 0)
  const [pelayananBergerak, setPelayananBergerak] = useState<boolean>(
    initialData?.pelayananBergerak ?? false
  );

  const [validationError, setValidationError] = useState('');

  // Auto-generate register number if new
  useEffect(() => {
    if (!isEdit && !registerNumber) {
      const now = new Date(serviceDate);
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const seq = String(existingRecordsCount + 1).padStart(3, '0');
      setRegisterNumber(`REG-${yy}${mm}-${seq}`);
    }
  }, [serviceDate, isEdit, existingRecordsCount, registerNumber]);

  // Sinkronkan alamat default saat desa berubah (jika belum diubah manual)
  useEffect(() => {
    if (!isEdit && village) {
      setAddress(village.toUpperCase());
    }
  }, [village, isEdit]);

  if (!isOpen) return null;

  const calculateAge = (dobStr: string): number => {
    if (!dobStr) return 28;
    const birth = new Date(dobStr);
    if (isNaN(birth.getTime())) return 28;
    const today = new Date(serviceDate || new Date().toISOString().split('T')[0]);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(14, Math.min(65, age));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const targetVillage = villages.find((v) => v.name === village);
    if (targetVillage && !targetVillage.entryAllowed && isUserDesa) {
      setValidationError(
        `Entri data untuk Desa ${village} saat ini sedang dikunci oleh Admin Kecamatan / Admin Induk Dinas P3AKB.`
      );
      return;
    }

    if (!wifeName.trim()) {
      setValidationError('Kolom (5) Nama Istri wajib diisi.');
      return;
    }

    const derivedMethod: ContraceptiveMethod = alokonKodeToMethod(alokonKode);

    let derivedParticipantStatus: ParticipantStatus = 'ULANGAN';
    if (statusPesertaKode === 1) {
      if (pascaPersalinan) derivedParticipantStatus = 'BARU_PASCA_SALIN';
      else if (pascaKeguguran) derivedParticipantStatus = 'BARU_PASCA_GUGUR';
      else derivedParticipantStatus = 'BARU_BUKAN_PASCA';
    } else if (statusPesertaKode === 2) {
      derivedParticipantStatus = 'GANTI_CARA';
    } else {
      derivedParticipantStatus = 'ULANGAN';
    }

    let derivedActionType: ActionType = 'PEMBERIAN_ULANG';
    if (jenisTindakanKategori === 'CABUT_PASANG') {
      derivedActionType = 'CABUT_PASANG';
    } else if (jenisTindakanKategori === 'PENCABUTAN') {
      derivedActionType = 'PENCABUTAN';
    } else {
      derivedActionType = statusPesertaKode === 1 ? 'PASANG_BARU' : 'PEMBERIAN_ULANG';
    }

    const derivedServicePlace: ServicePlace = pelayananBergerak
      ? 'MOBIL_PELAYANAN'
      : isUserDesa
      ? 'PUSTU'
      : 'PUSKESMAS';

    const payload: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      serviceDate,
      registerNumber,
      husbandName: husbandName.trim().toUpperCase(),
      husbandNik: initialData?.husbandNik || '',
      wifeNik: wifeNik.replace(/\D/g, '').slice(0, 16),
      wifeName: wifeName.trim().toUpperCase(),
      wifeDob: wifeDob || '1995-01-01',
      wifeAge: calculateAge(wifeDob),
      bpjsNumber: penggunaanAsuransi === 'BPJS' ? initialData?.bpjsNumber || 'BPJS' : '',
      address: (address.trim() || village).toUpperCase(),
      phone: phone.trim(),
      village: village || defaultVillage,
      district: targetVillage?.district || currentUser?.district || 'Bojonegoro',
      aliveChildrenMale: initialData?.aliveChildrenMale ?? 1,
      aliveChildrenFemale: initialData?.aliveChildrenFemale ?? 1,
      youngestChildAgeMonths: initialData?.youngestChildAgeMonths ?? 12,
      participantStatus: derivedParticipantStatus,
      statusPesertaKode,
      informedConsent,
      pascaPersalinan,
      pascaKeguguran,
      jenisTindakanKategori,
      alokonKode,
      tindakanPemasanganKode: jenisTindakanKategori === 'PEMASANGAN' ? alokonKode : '',
      tindakanCabutPasangKode: jenisTindakanKategori === 'CABUT_PASANG' ? alokonKode : '',
      tindakanPencabutanKode: jenisTindakanKategori === 'PENCABUTAN' ? alokonKode : '',
      kasusKomplikasiKode: kasusKomplikasiKode ? Number(kasusKomplikasiKode) : '',
      kasusKegagalanKode: kasusKegagalanKode ? Number(kasusKegagalanKode) : '',
      penggunaanAsuransi,
      pelayananBergerak,
      method: derivedMethod,
      alokonSource,
      actionType: derivedActionType,
      bloodPressure: initialData?.bloodPressure || '120/80',
      weightKg: initialData?.weightKg || 55,
      hpht: initialData?.hpht || '',
      medicalNotes: '',
      sideEffects: 'Tidak Ada',
      complications:
        kasusKomplikasiKode || statusPesertaKode === 4 ? 'Komplikasi Berat' : 'Tidak Ada',
      referralStatus: 'TIDAK',
      servicePlace: derivedServicePlace,
      officerName: initialData?.officerName || currentUser?.name || 'Petugas Entri Data',
      createdByUsername: currentUser?.username || 'admin',
    };

    if (isEdit && initialData) {
      onSave({
        ...initialData,
        ...payload,
      });
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sm:my-4 max-h-[95vh] sm:max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded bg-white text-slate-950 font-mono text-xs font-black tracking-wider">
              R/I/KB/20
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {isEdit ? 'Edit Baris Register Pelayanan KB' : 'Entri Register Pelayanan KB (Kolom 1–24)'}
              </h2>
              <p className="text-[11px] text-slate-300">
                Sesuai Format Formulir Resmi BKKBN R/I/KB/20 (Kolom 1 s/d 24)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation / Lock Alert */}
        {isVillageLocked && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-800 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              Perhatian: Entri data untuk Desa {village} sedang dikunci oleh admin faskes.
            </span>
          </div>
        )}

        {validationError && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* SEKSI 1: KOLOM (2) TANGGAL & IDENTITAS PESERTA KB KOLOM (3) s/d (8) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Kolom (2) s/d (8) — Tanggal & Identitas Peserta KB</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">PESERTA KB (SUAMI & ISTRI)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Kolom (2) TANGGAL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(2)</span> TANGGAL PELAYANAN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Kolom (3) NAMA SUAMI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(3)</span> NAMA SUAMI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={husbandName}
                  onChange={(e) => setHusbandName(e.target.value)}
                  placeholder="Contoh: AHMAD ROSIDUL UMAM"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl uppercase font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Pilih Desa Binaan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  DESA / FASKES JARINGAN <span className="text-rose-500">*</span>
                </label>
                {villages.length > 0 ? (
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    disabled={isUserDesa}
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 disabled:bg-slate-100"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.name}>
                        Desa {v.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Nama Desa..."
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-semibold"
                  />
                )}
              </div>

              {/* Kolom (4) NIK ISTRI (16 Kotak Digit) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    <span className="font-mono text-emerald-700 mr-1">(4)</span> NIK ISTRI (NOMOR INDUK KEPENDUDUKAN 16 DIGIT)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {wifeNik.replace(/\D/g, '').length}/16 Digit
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={wifeNik}
                  onChange={(e) => setWifeNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="3522046402950001"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono text-sm tracking-widest font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Kolom (5) NAMA ISTRI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(5)</span> NAMA ISTRI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wifeName}
                  onChange={(e) => setWifeName(e.target.value)}
                  placeholder="Contoh: SUHENI"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl uppercase font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Kolom (6) TANGGAL LAHIR ISTRI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(6)</span> TANGGAL LAHIR ISTRI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={wifeDob}
                  onChange={(e) => setWifeDob(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Kolom (7) ALAMAT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(7)</span> ALAMAT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: TRENGGULUNAN"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl uppercase font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Kolom (8) NO. HANDPHONE */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(8)</span> NO. HANDPHONE
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08..."
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* SEKSI 2: KOLOM (9) s/d (12) STATUS PESERTA KB, INFORMED CONSENT, PASCA SALIN/KEGUGURAN */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Kolom (9) s/d (12) — Status Peserta KB & Kondisi Khusus</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">KODE STATUS 1–4 & TANDA (1/0)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              {/* Kolom (9) STATUS PESERTA KB (Kode) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(9)</span> STATUS PESERTA KB (Kode)
                </label>
                <select
                  value={statusPesertaKode}
                  onChange={(e) => setStatusPesertaKode(Number(e.target.value) as 1 | 2 | 3 | 4)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {Object.entries(STATUS_PESERTA_KODE_LABELS).map(([k, label]) => (
                    <option key={k} value={Number(k)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kolom (10) INFORMED CONSENT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(10)</span> INFORMED CONSENT
                </label>
                <select
                  value={informedConsent ? 1 : 0}
                  onChange={(e) => setInformedConsent(Number(e.target.value) === 1)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                >
                  <option value={0}>0 (Tidak / Tanpa IC)</option>
                  <option value={1}>1 (Ya / Ada IC)</option>
                </select>
              </div>

              {/* Kolom (11) PASCA PERSALINAN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(11)</span> PASCA PERSALINAN
                </label>
                <select
                  value={pascaPersalinan ? 1 : 0}
                  onChange={(e) => {
                    const val = Number(e.target.value) === 1;
                    setPascaPersalinan(val);
                    if (val) setPascaKeguguran(false);
                  }}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                >
                  <option value={0}>0 (Tidak)</option>
                  <option value={1}>1 (Ya - Pasca Persalinan)</option>
                </select>
              </div>

              {/* Kolom (12) PASCA KEGUGURAN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(12)</span> PASCA KEGUGURAN
                </label>
                <select
                  value={pascaKeguguran ? 1 : 0}
                  onChange={(e) => {
                    const val = Number(e.target.value) === 1;
                    setPascaKeguguran(val);
                    if (val) setPascaPersalinan(false);
                  }}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                >
                  <option value={0}>0 (Tidak)</option>
                  <option value={1}>1 (Ya - Pasca Keguguran)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEKSI 3: KOLOM (13) s/d (17) JENIS TINDAKAN (Kode 1-11) & KASUS (Kode 1-11) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Heart className="w-4 h-4 text-emerald-600" />
                <span>Kolom (13) s/d (17) — Jenis Tindakan (Kode Alokon) & Kasus</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">KODE JENIS ALOKON 1–11</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {/* Dropdown Pilih Kode Jenis Alokon 1 s/d 11 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  KODE JENIS ALOKON (1 s/d 11)
                </label>
                <select
                  value={alokonKode}
                  onChange={(e) => setAlokonKode(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {ALOKON_KODE_OPTIONS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilihan Kolom Tindakan 13 / 14 / 15 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(13–15)</span> JENIS TINDAKAN
                </label>
                <select
                  value={jenisTindakanKategori}
                  onChange={(e) =>
                    setJenisTindakanKategori(
                      e.target.value as 'PEMASANGAN' | 'CABUT_PASANG' | 'PENCABUTAN'
                    )
                  }
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="PEMASANGAN">Operatif / Pemberian / Pemasangan</option>
                  <option value="CABUT_PASANG">Pencabutan dan Pemasangan</option>
                  <option value="PENCABUTAN">Pencabutan</option>
                </select>
              </div>

              {/* Kolom (16) KASUS KOMPLIKASI BERAT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(16)</span> KASUS: KOMPLIKASI BERAT
                </label>
                <select
                  value={kasusKomplikasiKode}
                  onChange={(e) => setKasusKomplikasiKode(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                >
                  <option value="">Tidak Ada</option>
                  {ALOKON_KODE_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kolom (17) KASUS KEGAGALAN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(17)</span> KASUS: KEGAGALAN
                </label>
                <select
                  value={kasusKegagalanKode}
                  onChange={(e) => setKasusKegagalanKode(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                >
                  <option value="">Tidak Ada</option>
                  {ALOKON_KODE_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SEKSI 4: KOLOM (18) s/d (24) ASURANSI, SUMBER ALOKON & PELAYANAN BERGERAK */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kolom (18) s/d (24) — Penggunaan Asuransi, Sumber Alokon & Pelayanan Bergerak</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Kolom (18-20) PENGGUNAAN ASURANSI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(18–20)</span> PENGGUNAAN ASURANSI
                </label>
                <select
                  value={penggunaanAsuransi}
                  onChange={(e) =>
                    setPenggunaanAsuransi(e.target.value as 'BPJS' | 'LAINNYA' | 'TIDAK')
                  }
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="BPJS">BPJS Kesehatan</option>
                  <option value="LAINNYA">Lainnya</option>
                  <option value="TIDAK">Tidak</option>
                </select>
              </div>

              {/* Kolom (21-23) SUMBER ALOKON */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(21–23)</span> SUMBER ALOKON
                </label>
                <select
                  value={alokonSource}
                  onChange={(e) => setAlokonSource(e.target.value as AlokonSource)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="APBN">APBN</option>
                  <option value="NON_APBN">APBD</option>
                  <option value="MANDIRI">Mandiri</option>
                </select>
              </div>

              {/* Kolom (24) PELAYANAN BERGERAK */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  <span className="font-mono text-emerald-700 mr-1">(24)</span> PELAYANAN BERGERAK
                </label>
                <select
                  value={pelayananBergerak ? 1 : 0}
                  onChange={(e) => setPelayananBergerak(Number(e.target.value) === 1)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                >
                  <option value={0}>0 (Pelayanan Statis / Faskes)</option>
                  <option value={1}>1 (Ya - Pelayanan Bergerak / Muyan)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isVillageLocked}
              className="flex-2 sm:flex-none justify-center px-6 py-3 sm:py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Simpan ke Register R/I/KB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
