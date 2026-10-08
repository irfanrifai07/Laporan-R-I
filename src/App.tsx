import React, { useState, useEffect } from 'react';
import { District, FacilityProfile, PatientRecord, User, Village } from './types';
import { StorageService } from './services/storage';
import { FirestoreService, testFirebaseConnection } from './services/firebase';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RegisterTable } from './components/RegisterTable';
import { RekapitulasiF2KB } from './components/RekapitulasiF2KB';
import { AdminPanel } from './components/AdminPanel';
import { RegisterFormModal } from './components/RegisterFormModal';
import { PrintRegisterModal } from './components/PrintRegisterModal';
import { LoginModal } from './components/LoginModal';
import { CheckCircle2, ShieldCheck, Heart, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    StorageService.init();
    return StorageService.getCurrentUser();
  });

  const [facility, setFacility] = useState<FacilityProfile>(() =>
    StorageService.getFacilityProfile()
  );

  const [villages, setVillages] = useState<Village[]>(() => StorageService.getVillages());

  const [districts, setDistricts] = useState<District[]>(() => StorageService.getDistricts());

  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());

  const [records, setRecords] = useState<PatientRecord[]>(() => StorageService.getRecords());

  const handleSelectDistrict = (districtName: string) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      district: districtName === 'SEMUA' ? undefined : districtName,
    };
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    showToast(
      districtName === 'SEMUA'
        ? '👑 Mode Pengawasan: Semua Kecamatan se-Kabupaten'
        : `🏢 Beralih ke Pengawasan: Kecamatan ${districtName}`
    );
  };

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'rekapitulasi' | 'admin'>('dashboard');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formEditData, setFormEditData] = useState<PatientRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add / Edit record (langsung tersimpan di storage lokal & cloud Firestore)
  const handleSaveRecord = (
    record: PatientRecord | Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if ('id' in record) {
      StorageService.updateRecord(record as PatientRecord, currentUser?.username || 'admin');
      showToast(`✓ Data akseptor ${record.wifeName} berhasil diperbarui dan langsung tersimpan.`);
    } else {
      StorageService.addRecord(record);
      showToast(`✓ Data akseptor ${record.wifeName} berhasil ditambahkan dan langsung tersimpan.`);
    }
    setRecords(StorageService.getRecords());
    setIsFormModalOpen(false);
    setFormEditData(null);
  };

  // Delete record (langsung tersimpan & terhapus permanen)
  const handleDeleteRecord = (id: string) => {
    StorageService.deleteRecord(id, currentUser?.username || 'admin');
    setRecords(StorageService.getRecords());
    showToast('✓ Data register akseptor berhasil dihapus dan langsung tersimpan.');
  };

  // Open Edit Form
  const handleOpenEdit = (rec: PatientRecord) => {
    setFormEditData(rec);
    setIsFormModalOpen(true);
  };

  // Open New Form
  const handleOpenNew = () => {
    setFormEditData(null);
    setIsFormModalOpen(true);
  };

  // Logout / Switch User
  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsLoginModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'bidan_desa' || user.role === 'admin_desa') {
      setActiveTab('register');
      showToast(`Masuk sebagai User Desa (${user.village || 'Entri Pelayanan'}). Menampilkan khusus data Desa ${user.village || ''}.`);
    } else if (user.role === 'admin_kecamatan') {
      showToast(`Masuk sebagai Admin Kecamatan. Membawahi seluruh user desa.`);
    } else {
      showToast(`Masuk sebagai Admin Induk. Mengendalikan seluruh sistem faskes.`);
    }
  };

  // Profile update
  const handleUpdateFacility = (newFac: FacilityProfile) => {
    setFacility(newFac);
  };

  // Villages update
  const handleUpdateVillages = (newV: Village[]) => {
    setVillages(newV);
  };

  // Users update
  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  // Districts update
  const handleUpdateDistricts = (newDistricts: District[]) => {
    setDistricts(newDistricts);
  };

  // Sinkronisasi Realtime Cloud Firebase (Otomatis tersambung HP & PC)
  useEffect(() => {
    // 1. Tes koneksi awal
    testFirebaseConnection();

    // 2. Inisialisasi basis data awan jika belum terisi
    if (typeof FirestoreService.initializeCloudDatabase === 'function') {
      FirestoreService.initializeCloudDatabase({
        users: StorageService.getUsers(),
        records: StorageService.getRecords(),
        villages: StorageService.getVillages(),
        districts: StorageService.getDistricts(),
        facility: StorageService.getFacilityProfile(),
      });
    }

    // 3. Pasang pendengar realtime perubahan data dari perangkat lain (HP / PC)
    const unsubUsers = FirestoreService.subscribeUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        StorageService.saveUsersLocallyOnly(cloudUsers);
        setUsers((prev) => (JSON.stringify(prev) === JSON.stringify(cloudUsers) ? prev : cloudUsers));
      }
    }, StorageService.getUsers());

    const unsubRecords = FirestoreService.subscribeRecords((cloudRecords) => {
      if (cloudRecords) {
        StorageService.saveRecordsLocallyOnly(cloudRecords);
        setRecords((prev) =>
          JSON.stringify(prev) === JSON.stringify(cloudRecords) ? prev : cloudRecords
        );
      }
    });

    const unsubVillages = FirestoreService.subscribeVillages((cloudVillages) => {
      if (cloudVillages) {
        StorageService.saveVillagesLocallyOnly(cloudVillages);
        setVillages((prev) =>
          JSON.stringify(prev) === JSON.stringify(cloudVillages) ? prev : cloudVillages
        );
      }
    });

    const unsubDistricts = FirestoreService.subscribeDistricts((cloudDistricts) => {
      if (cloudDistricts && cloudDistricts.length > 0) {
        const normalized = StorageService.normalizeDistricts(cloudDistricts);
        StorageService.saveDistrictsLocallyOnly(normalized);
        setDistricts((prev) =>
          JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized
        );
      }
    }, StorageService.getDistricts());

    const unsubFacility = FirestoreService.subscribeFacility((cloudFac) => {
      if (cloudFac) {
        StorageService.saveFacilityProfileLocallyOnly(cloudFac);
        setFacility((prev) =>
          JSON.stringify(prev) === JSON.stringify(cloudFac) ? prev : cloudFac
        );
      }
    }, StorageService.getFacilityProfile());

    const unsubLogs = FirestoreService.subscribeLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        StorageService.saveLogsLocallyOnly(cloudLogs);
      }
    });

    return () => {
      unsubUsers();
      unsubRecords();
      unsubVillages();
      unsubDistricts();
      unsubFacility();
      unsubLogs();
    };
  }, []);

  // Sinkronisasi realtime lokal saat ada update dari tab lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes('users')) setUsers(StorageService.getUsers());
      else if (e.key.includes('records')) setRecords(StorageService.getRecords());
      else if (e.key.includes('villages')) setVillages(StorageService.getVillages());
      else if (e.key.includes('districts')) setDistricts(StorageService.getDistricts());
      else if (e.key.includes('profile')) setFacility(StorageService.getFacilityProfile());
      else if (e.key.includes('current_user')) setCurrentUser(StorageService.getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Clear all patient records
  const handleClearRecords = () => {
    StorageService.clearAllRecords(currentUser?.username || 'admin');
    setRecords([]);
    showToast('✓ Seluruh data register pelayanan KB berhasil dikosongkan dan langsung tersimpan.');
  };

  // Reset all data
  const handleDataReset = () => {
    StorageService.resetToDefault(currentUser?.username || 'admin');
    setFacility(StorageService.getFacilityProfile());
    setVillages(StorageService.getVillages());
    setUsers(StorageService.getUsers());
    setRecords([]);
    showToast('Data sistem telah direset ke setelan awal (data kosong).');
  };

  // Hitung Profil Kecamatan aktif & cakupan wilayah jika login sebagai User Kecamatan (atau Admin Induk memilih Kecamatan spesifik)
  const activeDistrictName = currentUser?.district;
  const activeDistrictObj = activeDistrictName
    ? districts.find((d) => d.name.toLowerCase() === activeDistrictName.toLowerCase())
    : undefined;

  const activeFacility: FacilityProfile = activeDistrictName
    ? {
        ...facility,
        name:
          activeDistrictObj?.institutionName ||
          `BALAI PENYULUHAN KB KECAMATAN ${activeDistrictName.toUpperCase()}`,
        k0kbCode: activeDistrictObj?.k0kbCode || facility.k0kbCode,
        district: activeDistrictObj?.name || activeDistrictName,
        address:
          activeDistrictObj?.address ||
          `Kecamatan ${activeDistrictName}, ${activeDistrictObj?.regency || facility.regency}`,
        regency: activeDistrictObj?.regency || facility.regency,
        province: activeDistrictObj?.province || facility.province,
      }
    : facility;

  const isUserDesa =
    currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa';
  const activeVillageName = isUserDesa ? currentUser?.village : undefined;

  const districtVillages = activeDistrictName
    ? villages.filter((v) => (v.district || '').toLowerCase() === activeDistrictName.toLowerCase())
    : villages;

  const scopedVillages = activeVillageName
    ? districtVillages.filter((v) => v.name.toLowerCase() === activeVillageName.toLowerCase())
    : districtVillages;

  const scopedRecords = activeVillageName
    ? records.filter(
        (r) =>
          (r.village || '').toLowerCase() === activeVillageName.toLowerCase() &&
          (!activeDistrictName ||
            !r.district ||
            r.district.toLowerCase() === activeDistrictName.toLowerCase())
      )
    : activeDistrictName
    ? records.filter(
        (r) =>
          (r.district || '').toLowerCase() === activeDistrictName.toLowerCase() ||
          districtVillages.some((v) => v.name.toLowerCase() === (r.village || '').toLowerCase())
      )
    : records;

  // Jika belum login atau sudah logout, langsung tampilkan Portal Login penuh
  if (!currentUser) {
    return (
      <LoginModal
        isOpen={true}
        isPortal={true}
        users={users}
        villages={villages}
        districts={districts}
        facility={facility}
        onLoginSuccess={(user) => {
          handleLoginSuccess(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 md:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 text-xs animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        facility={activeFacility}
        districts={districts}
        onSelectDistrict={handleSelectDistrict}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            records={scopedRecords}
            villages={scopedVillages}
            districts={districts}
            onSelectDistrict={handleSelectDistrict}
            onUpdateDistricts={handleUpdateDistricts}
            facility={activeFacility}
            currentUser={currentUser}
            onNavigateRegister={() => setActiveTab('register')}
            onNavigateRekap={() => setActiveTab('rekapitulasi')}
            onNavigateAdmin={() => setActiveTab('admin')}
            onAddNew={handleOpenNew}
          />
        )}

        {activeTab === 'register' && (
          <RegisterTable
            records={scopedRecords}
            villages={scopedVillages}
            districts={districts}
            onSelectDistrict={handleSelectDistrict}
            facility={activeFacility}
            currentUser={currentUser}
            onAddNew={handleOpenNew}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRecord}
            onOpenPrint={() => setIsPrintModalOpen(true)}
            onClearRecords={handleClearRecords}
          />
        )}

        {activeTab === 'rekapitulasi' && (
          <RekapitulasiF2KB
            facility={activeFacility}
            villages={scopedVillages}
            districts={districts}
            onSelectDistrict={handleSelectDistrict}
            records={scopedRecords}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin' && (
          (currentUser?.role === 'admin_desa' || currentUser?.role === 'bidan_desa') ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Akses Pengaturan Khusus Admin</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akun Anda terdaftar sebagai <strong className="text-slate-800">Admin Desa ({currentUser.village || 'Desa'})</strong> dengan tugas khusus untuk <strong className="text-slate-800">menentri data pelayanan register KB</strong>.
                Pengelolaan profil instansi dan seluruh akun dibawahi oleh Admin Kecamatan dan Admin Induk Kabupaten.
              </p>
              <button
                onClick={() => setActiveTab('register')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Buka Menu Entri Data Pasien KB &rarr;</span>
              </button>
            </div>
          ) : (
            <AdminPanel
              facility={facility}
              onUpdateFacility={handleUpdateFacility}
              villages={villages}
              onUpdateVillages={handleUpdateVillages}
              districts={districts}
              onUpdateDistricts={handleUpdateDistricts}
              users={users}
              onUpdateUsers={handleUpdateUsers}
              currentUser={currentUser}
              onDataReset={handleDataReset}
              onClearRecords={handleClearRecords}
              onSwitchUser={(targetUser) => {
                StorageService.setCurrentUser(targetUser);
                handleLoginSuccess(targetUser);
                showToast(`Beralih akun: Sekarang Anda masuk sebagai ${targetUser.name}`);
              }}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">SIM Pelayanan KB Dinas P3AKB Bojonegoro</span>
            <span>•</span>
            <span>Format Resmi BKKBN (Register Pelayanan KB R/I/KB)</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span>Dinas Pemberdayaan Perempuan, Perlindungan Anak dan KB Kab. Bojonegoro</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {isFormModalOpen && (
        <RegisterFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setFormEditData(null);
          }}
          onSave={handleSaveRecord}
          initialData={formEditData}
          villages={scopedVillages}
          currentUser={currentUser}
          existingRecordsCount={records.length}
        />
      )}

      {isPrintModalOpen && (
        <PrintRegisterModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          records={scopedRecords}
          facility={activeFacility}
          villages={scopedVillages}
          districts={districts}
          currentUser={currentUser}
          onSelectDistrict={handleSelectDistrict}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          users={users}
          villages={villages}
          districts={districts}
          facility={facility}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(user) => {
            handleLoginSuccess(user);
            setIsLoginModalOpen(false);
          }}
          onUserRegistered={(newUser) => {
            setUsers((prev) => {
              const updated = [...prev.filter((u) => u.id !== newUser.id), newUser];
              StorageService.saveSingleUser(newUser);
              return updated;
            });
            handleLoginSuccess(newUser);
            setIsLoginModalOpen(false);
            showToast(`Akun ${newUser.name} berhasil didaftarkan dan langsung aktif!`);
          }}
        />
      )}
    </div>
  );
}
