import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  query,
  limit,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { District, FacilityProfile, PatientRecord, User, Village } from '../types';

// Inisialisasi Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Firestore dengan Persistent Cache agar pembukaan aplikasi sangat cepat & ringan
function initDb(): Firestore {
  try {
    if (firebaseConfig.firestoreDatabaseId) {
      return initializeFirestore(
        app,
        {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        },
        firebaseConfig.firestoreDatabaseId
      );
    }
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db: Firestore = initDb();

// Validasi koneksi awal ke Firestore bila diperlukan
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
    return false;
  }
}

// Koleksi Firestore
const USERS_COL = 'users';
const RECORDS_COL = 'records';
const VILLAGES_COL = 'villages';
const DISTRICTS_COL = 'districts';
const FACILITY_COL = 'facility';
const LOGS_COL = 'activity_logs';

// Timer debounce agar ketikan cepat tidak membanjiri jaringan Firestore
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debounceFirestore(key: string, fn: () => void, delayMs = 450) {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }
  debounceTimers[key] = setTimeout(() => {
    delete debounceTimers[key];
    fn();
  }, delayMs);
}

// Membersihkan nilai undefined dari objek agar Firestore tidak melempar error
function cleanPayload<T>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanPayload(item));
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = typeof value === 'object' && value !== null ? cleanPayload(value) : value;
    }
  }
  return result;
}

let seededUsers = false;
let seededDistricts = false;
let seededFacility = false;

export const FirestoreService = {
  // Sync Realtime Users (HP & PC otomatis sinkron)
  subscribeUsers(onUpdate: (users: User[]) => void, fallbackUsers?: User[]): Unsubscribe {
    const colRef = collection(db, USERS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache && !seededUsers && fallbackUsers?.length) {
          seededUsers = true;
          this.syncAllUsers(fallbackUsers);
          return;
        }
        const list: User[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as User;
          list.push({ ...data, id: d.id });
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (err) => console.error('Error subscribeUsers:', err)
    );
  },

  async saveUser(user: User): Promise<void> {
    try {
      const docRef = doc(db, USERS_COL, user.id);
      await setDoc(docRef, cleanPayload(user), { merge: true });
    } catch (e) {
      console.error('Failed to save user to Firestore:', e);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, USERS_COL, userId));
    } catch (e) {
      console.error('Failed to delete user in Firestore:', e);
    }
  },

  async syncAllUsers(users: User[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, USERS_COL));
      const activeIds = new Set(users.map((u) => u.id));
      const batch = writeBatch(db);

      snap.forEach((d) => {
        if (!activeIds.has(d.id)) {
          batch.delete(d.ref);
        }
      });

      for (const u of users) {
        const docRef = doc(db, USERS_COL, u.id);
        batch.set(docRef, cleanPayload(u), { merge: true });
      }
      await batch.commit();
    } catch (e) {
      console.error('Failed syncAllUsers:', e);
    }
  },

  // Sync Realtime Records Pelayanan KB
  subscribeRecords(onUpdate: (records: PatientRecord[]) => void): Unsubscribe {
    const colRef = collection(db, RECORDS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PatientRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as PatientRecord;
          list.push({ ...data, id: d.id });
        });
        // Urutkan terbaru di atas berdasarkan tanggal pelayanan / waktu dibuat
        list.sort((a, b) => (b.serviceDate || '').localeCompare(a.serviceDate || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
      },
      (err) => console.error('Error subscribeRecords:', err)
    );
  },

  async saveRecord(record: PatientRecord): Promise<void> {
    try {
      const docRef = doc(db, RECORDS_COL, record.id);
      await setDoc(docRef, cleanPayload(record), { merge: true });
    } catch (e) {
      console.error('Failed to save record to Firestore:', e);
    }
  },

  async deleteRecord(recordId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, RECORDS_COL, recordId));
    } catch (e) {
      console.error('Failed to delete record in Firestore:', e);
    }
  },

  async clearAllRecords(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, RECORDS_COL));
      if (snap.empty) return;
      const docs = snap.docs;
      const chunkSize = 400;
      for (let i = 0; i < docs.length; i += chunkSize) {
        const batch = writeBatch(db);
        docs.slice(i, i + chunkSize).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      console.error('Failed clearAllRecords in Firestore:', e);
    }
  },

  async syncAllRecords(records: PatientRecord[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, RECORDS_COL));
      const activeIds = new Set(records.map((r) => r.id));

      const toDelete = snap.docs.filter((d) => !activeIds.has(d.id));
      const chunkSize = 400;
      for (let i = 0; i < toDelete.length; i += chunkSize) {
        const deleteBatch = writeBatch(db);
        toDelete.slice(i, i + chunkSize).forEach((d) => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const r of chunk) {
          const docRef = doc(db, RECORDS_COL, r.id);
          batch.set(docRef, cleanPayload(r), { merge: true });
        }
        await batch.commit();
      }
    } catch (e) {
      console.error('Failed syncAllRecords:', e);
    }
  },

  // Sync Realtime Villages
  subscribeVillages(onUpdate: (villages: Village[]) => void): Unsubscribe {
    const colRef = collection(db, VILLAGES_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Village[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Village), id: d.id });
        });
        onUpdate(list);
      },
      (err) => console.error('Error subscribeVillages:', err)
    );
  },

  async saveVillage(village: Village): Promise<void> {
    try {
      const docRef = doc(db, VILLAGES_COL, village.id);
      await setDoc(docRef, cleanPayload(village), { merge: true });
    } catch (e) {
      console.error('Failed to save village to Firestore:', e);
    }
  },

  async deleteVillage(villageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, VILLAGES_COL, villageId));
    } catch (e) {
      console.error('Failed to delete village in Firestore:', e);
    }
  },

  async clearAllVillages(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, VILLAGES_COL));
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed clearAllVillages in Firestore:', e);
    }
  },

  async syncAllVillages(villages: Village[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, VILLAGES_COL));
      const activeIds = new Set(villages.map((v) => v.id));
      const batch = writeBatch(db);

      snap.forEach((d) => {
        if (!activeIds.has(d.id)) {
          batch.delete(d.ref);
        }
      });

      for (const v of villages) {
        const docRef = doc(db, VILLAGES_COL, v.id);
        batch.set(docRef, cleanPayload(v), { merge: true });
      }
      await batch.commit();
    } catch (e) {
      console.error('Failed syncAllVillages:', e);
    }
  },

  // Sync Realtime Districts (Kecamatan)
  subscribeDistricts(onUpdate: (districts: District[]) => void, fallbackDistricts?: District[]): Unsubscribe {
    const colRef = collection(db, DISTRICTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty && !snapshot.metadata.fromCache && !seededDistricts && fallbackDistricts?.length) {
          seededDistricts = true;
          this.syncAllDistricts(fallbackDistricts);
          return;
        }
        const list: District[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as District), id: d.id });
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (err) => console.error('Error subscribeDistricts:', err)
    );
  },

  async saveDistrict(district: District): Promise<void> {
    try {
      const docRef = doc(db, DISTRICTS_COL, district.id);
      await setDoc(docRef, cleanPayload(district), { merge: true });
    } catch (e) {
      console.error('Failed to save district to Firestore:', e);
    }
  },

  saveDistrictDebounced(district: District): void {
    debounceFirestore(`district_${district.id}`, () => {
      this.saveDistrict(district);
    });
  },

  async deleteDistrict(districtId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, DISTRICTS_COL, districtId));
    } catch (e) {
      console.error('Failed to delete district in Firestore:', e);
    }
  },

  async syncAllDistricts(districts: District[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, DISTRICTS_COL));
      const activeIds = new Set(districts.map((d) => d.id));
      const batch = writeBatch(db);

      snap.forEach((d) => {
        if (!activeIds.has(d.id)) {
          batch.delete(d.ref);
        }
      });

      for (const d of districts) {
        const docRef = doc(db, DISTRICTS_COL, d.id);
        batch.set(docRef, cleanPayload(d), { merge: true });
      }
      await batch.commit();
    } catch (e) {
      console.error('Failed syncAllDistricts:', e);
    }
  },

  // Sync Realtime Facility Profile
  subscribeFacility(onUpdate: (facility: FacilityProfile) => void, fallbackFacility?: FacilityProfile): Unsubscribe {
    const docRef = doc(db, FACILITY_COL, 'current');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          if (!snapshot.metadata.fromCache && !seededFacility && fallbackFacility) {
            seededFacility = true;
            this.saveFacility(fallbackFacility);
          }
          return;
        }
        const data = snapshot.data() as FacilityProfile;
        if (data && data.name && !data.name.includes('PUSKESMAS') && !data.name.includes('Sambungmacan')) {
          onUpdate(data);
        } else if (!seededFacility && fallbackFacility) {
          seededFacility = true;
          this.saveFacility(fallbackFacility);
        }
      },
      (err) => console.error('Error subscribeFacility:', err)
    );
  },

  async saveFacility(facility: FacilityProfile): Promise<void> {
    try {
      const docRef = doc(db, FACILITY_COL, 'current');
      await setDoc(docRef, cleanPayload(facility), { merge: true });
    } catch (e) {
      console.error('Failed to save facility:', e);
    }
  },

  saveFacilityDebounced(facility: FacilityProfile): void {
    debounceFirestore('facility_current', () => {
      this.saveFacility(facility);
    });
  },

  // Sync Realtime Activity Logs (dibatasi 100 log terbaru agar aplikasi selalu ringan)
  subscribeLogs(onUpdate: (logs: any[]) => void): Unsubscribe {
    const q = query(collection(db, LOGS_COL), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id });
        });
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onUpdate(list);
      },
      (err) => console.error('Error subscribeLogs:', err)
    );
  },

  async saveLog(log: { id: string; timestamp: string; username: string; action: string; details: string }): Promise<void> {
    try {
      const docRef = doc(db, LOGS_COL, log.id);
      await setDoc(docRef, cleanPayload(log), { merge: true });
    } catch (e) {
      console.error('Failed to save log to Firestore:', e);
    }
  },
};
