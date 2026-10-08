import {
  ActivityLog,
  ContraceptiveMethod,
  District,
  FacilityProfile,
  MonthlyF2KBCellData,
  PatientRecord,
  Role,
  User,
  Village,
} from '../types';
import {
  METHOD_LABELS,
  initialDistricts,
  initialFacilityProfile,
  initialSampleRecords,
  sampleAgustus2026Records,
  initialUsers,
  initialVillages,
} from '../data/initialData';
import { FirestoreService } from './firebase';

const STORAGE_KEYS = {
  USERS: 'kb_faskes_users_v1',
  CURRENT_USER: 'kb_faskes_active_session_v2',
  VILLAGES: 'kb_faskes_villages_v1',
  DISTRICTS: 'kb_faskes_districts_v1',
  PROFILE: 'kb_faskes_facility_profile_v1',
  RECORDS: 'kb_faskes_patient_records_v2',
  LOGS: 'kb_faskes_activity_logs_v1',
  INITIALIZED: 'kb_faskes_initialized_flag_v2',
};

// Safe JSON parse helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to localStorage:`, err);
  }
}

const localSaveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function safeSetSilent<T>(key: string, value: T): void {
  if (localSaveTimers[key]) {
    clearTimeout(localSaveTimers[key]);
  }
  localSaveTimers[key] = setTimeout(() => {
    delete localSaveTimers[key];
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving key ${key} to localStorage:`, err);
    }
  }, 80);
}

let hasRunInit = false;

export const StorageService = {
  init() {
    if (hasRunInit) return;
    hasRunInit = true;

    // Bersihkan data contoh & sesi otomatis lawas jika ada
    localStorage.removeItem('kb_faskes_patient_records_v1');
    localStorage.removeItem('kb_faskes_current_user_v1');

    const isFirstTime = !localStorage.getItem(STORAGE_KEYS.INITIALIZED);

    if (isFirstTime) {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        safeSetSilent(STORAGE_KEYS.USERS, initialUsers);
      }
      if (!localStorage.getItem(STORAGE_KEYS.VILLAGES)) {
        safeSetSilent(STORAGE_KEYS.VILLAGES, initialVillages);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISTRICTS)) {
        safeSetSilent(STORAGE_KEYS.DISTRICTS, initialDistricts);
      }
      safeSetSilent(STORAGE_KEYS.PROFILE, initialFacilityProfile);
      if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
        safeSetSilent(STORAGE_KEYS.RECORDS, []);
      }
      if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
        safeSetSilent(STORAGE_KEYS.LOGS, [
          {
            id: 'log-init',
            timestamp: new Date().toISOString(),
            username: 'system',
            action: 'INISIALISASI_SISTEM',
            details: 'Sistem Register Pelayanan KB Dinas P3AKB Bojonegoro diinisialisasi',
          },
        ]);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } else {
      // Pastikan struktur profil instansi tidak menggunakan data sampel Puskesmas lawas
      const currentProf = safeGet<FacilityProfile | null>(STORAGE_KEYS.PROFILE, null);
      if (
        !currentProf ||
        !currentProf.name ||
        currentProf.name.includes('PUSKESMAS') ||
        currentProf.name.includes('Sambungmacan')
      ) {
        safeSetSilent(STORAGE_KEYS.PROFILE, initialFacilityProfile);
      }
      if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
        safeSetSilent(STORAGE_KEYS.RECORDS, []);
      }
    }
  },

  // USERS
  getUsers(): User[] {
    const list = safeGet<User[]>(STORAGE_KEYS.USERS, initialUsers);
    return list;
  },
  saveUsersLocallyOnly(users: User[]): void {
    safeSetSilent(STORAGE_KEYS.USERS, users);
  },
  saveUsers(users: User[]): void {
    safeSet(STORAGE_KEYS.USERS, users);
    FirestoreService.syncAllUsers(users);
  },
  saveSingleUser(user: User): void {
    const users = this.getUsers();
    const updated = users.some((u) => u.id === user.id)
      ? users.map((u) => (u.id === user.id ? user : u))
      : [...users, user];
    safeSet(STORAGE_KEYS.USERS, updated);
    FirestoreService.saveUser(user);
    const cur = this.getCurrentUser();
    if (cur && cur.id === user.id) {
      this.setCurrentUser(user);
    }
  },
  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    safeSet(STORAGE_KEYS.USERS, filtered);
    FirestoreService.deleteUser(userId);
  },
  getCurrentUser(): User | null {
    return safeGet<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    if (user) {
      safeSetSilent(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // FACILITY PROFILE (DINAS P3AKB KABUPATEN BOJONEGORO)
  getFacilityProfile(): FacilityProfile {
    const prof = safeGet<FacilityProfile>(STORAGE_KEYS.PROFILE, initialFacilityProfile);
    if (
      !prof ||
      !prof.name ||
      prof.name.includes('PUSKESMAS') ||
      prof.name.includes('Sambungmacan')
    ) {
      return initialFacilityProfile;
    }
    return prof;
  },
  saveFacilityProfileLocallyOnly(profile: FacilityProfile): void {
    safeSetSilent(STORAGE_KEYS.PROFILE, profile);
  },
  saveFacilityProfile(profile: FacilityProfile): void {
    safeSetSilent(STORAGE_KEYS.PROFILE, profile);
    FirestoreService.saveFacility(profile);
  },
  saveFacilityProfileDebounced(profile: FacilityProfile): void {
    safeSetSilent(STORAGE_KEYS.PROFILE, profile);
    FirestoreService.saveFacilityDebounced(profile);
  },

  // VILLAGES
  getVillages(): Village[] {
    return safeGet<Village[]>(STORAGE_KEYS.VILLAGES, []);
  },
  clearAllVillages(): void {
    safeSet(STORAGE_KEYS.VILLAGES, []);
    FirestoreService.clearAllVillages();
  },
  saveVillagesLocallyOnly(villages: Village[]): void {
    safeSetSilent(STORAGE_KEYS.VILLAGES, villages);
  },
  saveVillages(villages: Village[]): void {
    safeSet(STORAGE_KEYS.VILLAGES, villages);
    FirestoreService.syncAllVillages(villages);
  },
  saveSingleVillage(village: Village): void {
    const list = this.getVillages();
    const updated = list.some((v) => v.id === village.id)
      ? list.map((v) => (v.id === village.id ? village : v))
      : [...list, village];
    safeSet(STORAGE_KEYS.VILLAGES, updated);
    FirestoreService.saveVillage(village);
  },
  deleteVillage(villageId: string): void {
    const list = this.getVillages();
    const filtered = list.filter((v) => v.id !== villageId);
    safeSet(STORAGE_KEYS.VILLAGES, filtered);
    FirestoreService.deleteVillage(villageId);
  },

  // DISTRICTS
  normalizeDistricts(raw: District[]): District[] {
    if (!Array.isArray(raw) || raw.length === 0) return initialDistricts;
    return raw
      .filter((d) => d && typeof d === 'object')
      .map((d, idx) => {
        const safeName = (d.name || initialDistricts[idx]?.name || `Kecamatan ${idx + 1}`).trim();
        const def = initialDistricts.find((id) => id.name.toLowerCase() === safeName.toLowerCase());
        return {
          ...d,
          id: d.id || def?.id || `kec-${idx + 1}`,
          name: safeName,
          institutionName:
            d.institutionName ||
            def?.institutionName ||
            `BALAI PENYULUHAN KB KECAMATAN ${safeName.toUpperCase()}`,
          k0kbCode: d.k0kbCode || def?.k0kbCode || `3522${String((idx + 1) * 10).padStart(3, '0')}`,
          address:
            d.address ||
            def?.address ||
            `Kecamatan ${safeName}, Kabupaten Bojonegoro, Jawa Timur`,
          regency: d.regency || def?.regency || 'Kabupaten Bojonegoro',
          province: d.province || def?.province || 'Jawa Timur',
        };
      });
  },
  getDistricts(): District[] {
    const raw = safeGet<District[]>(STORAGE_KEYS.DISTRICTS, initialDistricts);
    return this.normalizeDistricts(raw);
  },
  saveDistrictsLocallyOnly(districts: District[]): void {
    safeSetSilent(STORAGE_KEYS.DISTRICTS, this.normalizeDistricts(districts));
  },
  saveDistricts(districts: District[]): void {
    safeSet(STORAGE_KEYS.DISTRICTS, districts);
    FirestoreService.syncAllDistricts(districts);
  },
  saveSingleDistrict(district: District): void {
    const list = this.getDistricts();
    const updated = list.some((d) => d.id === district.id)
      ? list.map((d) => (d.id === district.id ? district : d))
      : [...list, district];
    safeSetSilent(STORAGE_KEYS.DISTRICTS, updated);
    FirestoreService.saveDistrict(district);
  },
  saveSingleDistrictDebounced(district: District, updatedList?: District[]): void {
    if (updatedList) {
      safeSetSilent(STORAGE_KEYS.DISTRICTS, updatedList);
    }
    FirestoreService.saveDistrictDebounced(district);
  },
  deleteDistrict(districtId: string): void {
    const list = this.getDistricts();
    const filtered = list.filter((d) => d.id !== districtId);
    safeSet(STORAGE_KEYS.DISTRICTS, filtered);
    FirestoreService.deleteDistrict(districtId);
  },

  // PATIENT RECORDS
  getRecords(): PatientRecord[] {
    return safeGet<PatientRecord[]>(STORAGE_KEYS.RECORDS, []);
  },
  saveRecordsLocallyOnly(records: PatientRecord[]): void {
    safeSetSilent(STORAGE_KEYS.RECORDS, records);
  },
  saveRecords(records: PatientRecord[]): void {
    safeSet(STORAGE_KEYS.RECORDS, records);
    FirestoreService.syncAllRecords(records);
  },

  addRecord(record: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): PatientRecord {
    const records = this.getRecords();
    const newRecord: PatientRecord = {
      ...record,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.unshift(newRecord);
    this.saveRecordsLocallyOnly(records);
    FirestoreService.saveRecord(newRecord);
    this.logActivity(record.createdByUsername, 'TAMBAH_REGISTER', `Menambah data akseptor ${newRecord.wifeName} (${newRecord.registerNumber})`);
    return newRecord;
  },

  updateRecord(updated: PatientRecord, currentUsername: string): void {
    const records = this.getRecords();
    const idx = records.findIndex((r) => r.id === updated.id);
    const updatedWithTimestamp: PatientRecord = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      records[idx] = updatedWithTimestamp;
    } else {
      records.unshift(updatedWithTimestamp);
    }
    this.saveRecordsLocallyOnly(records);
    FirestoreService.saveRecord(updatedWithTimestamp);
    this.logActivity(currentUsername, 'EDIT_REGISTER', `Mengubah data akseptor ${updated.wifeName} (${updated.registerNumber})`);
  },

  deleteRecord(id: string, currentUsername: string): void {
    const records = this.getRecords();
    const target = records.find((r) => r.id === id);
    const filtered = records.filter((r) => r.id !== id);
    this.saveRecordsLocallyOnly(filtered);
    FirestoreService.deleteRecord(id);
    if (target) {
      this.logActivity(currentUsername, 'HAPUS_REGISTER', `Menghapus data akseptor ${target.wifeName} (${target.registerNumber})`);
    }
  },

  clearAllRecords(currentUsername: string): void {
    this.saveRecordsLocallyOnly([]);
    FirestoreService.clearAllRecords();
    this.logActivity(currentUsername, 'KOSONGKAN_DATA', 'Mengosongkan seluruh data register pelayanan KB');
  },

  loadSampleAgustusRecords(currentUsername: string): PatientRecord[] {
    this.saveRecords(sampleAgustus2026Records);
    this.logActivity(currentUsername, 'MUAT_CONTOH_AGUSTUS', 'Memuat contoh data register Laporan KB Agustus 2026');
    return sampleAgustus2026Records;
  },

  // ACTIVITY LOGS
  getLogs(): ActivityLog[] {
    return safeGet<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
  },
  saveLogsLocallyOnly(logs: ActivityLog[]): void {
    safeSetSilent(STORAGE_KEYS.LOGS, logs.slice(0, 200));
  },
  logActivity(username: string, action: string, details: string): void {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
    };
    logs.unshift(newLog);
    // keep max 200 logs
    if (logs.length > 200) {
      logs.length = 200;
    }
    safeSet(STORAGE_KEYS.LOGS, logs);
    FirestoreService.saveLog(newLog);
  },

  // BACKUP & RESTORE
  exportFullBackup(): string {
    const data = {
      version: 1,
      backupDate: new Date().toISOString(),
      facilityProfile: this.getFacilityProfile(),
      villages: this.getVillages(),
      districts: this.getDistricts(),
      users: this.getUsers(),
      records: this.getRecords(),
      logs: this.getLogs(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string, currentUsername: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.records || !Array.isArray(data.records)) {
        return { success: false, message: 'Format file cadangan tidak valid (field records tidak ditemukan).' };
      }
      if (data.facilityProfile) this.saveFacilityProfile(data.facilityProfile);
      if (data.villages) this.saveVillages(data.villages);
      if (data.districts) this.saveDistricts(data.districts);
      if (data.users) this.saveUsers(data.users);
      if (data.records) this.saveRecords(data.records);

      this.logActivity(currentUsername, 'RESTORE_DATA', `Memulihkan data sistem dari file cadangan (${data.records.length} rekam data)`);
      return { success: true, message: `Berhasil memulihkan ${data.records.length} data pelayanan KB!` };
    } catch (err: unknown) {
      return {
        success: false,
        message: 'Gagal memproses file cadangan JSON: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  },

  resetToDefault(currentUsername: string): void {
    this.saveFacilityProfile(initialFacilityProfile);
    this.saveVillages(initialVillages);
    this.saveDistricts(initialDistricts);
    this.saveUsers(initialUsers);
    this.saveRecords(initialSampleRecords);
    this.logActivity(currentUsername, 'RESET_DATA', 'Mereset data sistem ke data standar bawaan');
  },

  // REKAPITULASI R/I/KB CALCULATION
  calculateMonthlyF2KB(
    month: number,
    year: number,
    villageFilter?: string,
    districtFilter?: string,
    passedRecords?: PatientRecord[],
    passedVillages?: Village[]
  ): MonthlyF2KBCellData[] {
    const records = passedRecords || this.getRecords();
    const villages = passedVillages || this.getVillages();
    const districtVillageSet =
      districtFilter && districtFilter !== 'SEMUA'
        ? new Set(
            villages
              .filter((v) => (v.district || '').toLowerCase() === districtFilter.toLowerCase())
              .map((v) => v.name.toLowerCase())
          )
        : null;

    // Filter records by month & year (serviceDate format YYYY-MM-DD)
    const filtered = records.filter((r) => {
      if (!r.serviceDate) return false;
      const [rYear, rMonth] = r.serviceDate.split('-').map(Number);
      if (rYear !== year || rMonth !== month) return false;
      if (districtFilter && districtFilter !== 'SEMUA') {
        const matchRecDistrict = (r.district || '').toLowerCase() === districtFilter.toLowerCase();
        const matchVilDistrict = districtVillageSet?.has((r.village || '').toLowerCase()) ?? false;
        if (!matchRecDistrict && !matchVilDistrict) return false;
      }
      if (villageFilter && villageFilter !== 'SEMUA') {
        if ((r.village || '').toLowerCase() !== villageFilter.toLowerCase()) return false;
      }
      return true;
    });

    const methodOrder: ContraceptiveMethod[] = [
      'SUNTIK_1_BLN',
      'SUNTIK_3_BLN',
      'PIL',
      'KONDOM',
      'IUD',
      'IMPLAN_1_BATANG',
      'IMPLAN_2_BATANG',
      'MOW',
      'MOP',
    ];

    const result: MonthlyF2KBCellData[] = methodOrder.map((methodKey) => {
      const methodRecords = filtered.filter((r) => r.method === methodKey);

      let baruBukanPasca = 0;
      let baruPascaSalin = 0;
      let baruPascaGugur = 0;
      let gantiCara = 0;
      let ulangan = 0;
      let apbn = 0;
      let apbd = 0;
      let mandiri = 0;
      let nonApbn = 0;
      let komplikasi = 0;
      let kegagalan = 0;
      let cabutAlokon = 0;

      for (const rec of methodRecords) {
        // Participant status
        if (rec.participantStatus === 'BARU_BUKAN_PASCA') baruBukanPasca++;
        else if (rec.participantStatus === 'BARU_PASCA_SALIN') baruPascaSalin++;
        else if (rec.participantStatus === 'BARU_PASCA_GUGUR') baruPascaGugur++;
        else if (rec.participantStatus === 'GANTI_CARA') gantiCara++;
        else if (rec.participantStatus === 'ULANGAN') ulangan++;

        // Alokon source
        if (rec.alokonSource === 'APBN') {
          apbn++;
        } else if (rec.alokonSource === 'NON_APBN') {
          apbd++;
          nonApbn++;
        } else {
          mandiri++;
          nonApbn++;
        }

        // Complications
        if (rec.complications && rec.complications !== 'Tidak Ada' && rec.complications.trim() !== '') {
          komplikasi++;
        }
        if (rec.kasusKegagalanKode) {
          kegagalan++;
        }

        // Cabut alokon
        if (rec.actionType === 'PENCABUTAN' || rec.actionType === 'CABUT_PASANG') {
          cabutAlokon++;
        }
      }

      const totalBaru = baruBukanPasca + baruPascaSalin + baruPascaGugur;
      const totalPelayanan = totalBaru + gantiCara + ulangan;

      return {
        methodKey,
        methodLabel: METHOD_LABELS[methodKey],
        baruBukanPasca,
        baruPascaSalin,
        baruPascaGugur,
        totalBaru,
        gantiCara,
        ulangan,
        totalPelayanan,
        apbn,
        apbd,
        mandiri,
        nonApbn,
        komplikasi,
        kegagalan,
        cabutAlokon,
      };
    });

    return result;
  },
};
