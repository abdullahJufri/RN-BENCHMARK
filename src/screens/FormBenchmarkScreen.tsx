import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface FormData {
  nik: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  noHp: string;
  email: string;
  namaIbuKandung: string;
  penghasilanBulanan: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface RenderMetrics {
  renderCount: number;
  lastRenderTimeMs: number;
  totalRenderTimeMs: number;
  avgRenderTimeMs: number;
}

const INITIAL_FORM: FormData = {
  nik: '',
  namaLengkap: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  alamat: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  provinsi: '',
  agama: '',
  statusPerkawinan: '',
  pekerjaan: '',
  kewarganegaraan: 'WNI',
  noHp: '',
  email: '',
  namaIbuKandung: '',
  penghasilanBulanan: '',
};

const KOTA_OPTIONS = [
  'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat',
  'Jakarta Timur', 'Jakarta Utara', 'Bandung',
  'Surabaya', 'Semarang', 'Yogyakarta', 'Medan',
];

const PROVINSI_OPTIONS = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'Jawa Timur', 'DI Yogyakarta', 'Sumatera Utara',
  'Bali', 'Sulawesi Selatan', 'Kalimantan Timur',
];

const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const STATUS_OPTIONS = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];
const PEKERJAAN_OPTIONS = [
  'Pelajar/Mahasiswa', 'PNS', 'TNI/Polri',
  'Karyawan Swasta', 'Wiraswasta', 'Petani',
  'Buruh', 'Ibu Rumah Tangga', 'Tidak Bekerja', 'Lainnya',
];
const PENGHASILAN_OPTIONS = [
  '< Rp 1.000.000',
  'Rp 1.000.000 - Rp 3.000.000',
  'Rp 3.000.000 - Rp 5.000.000',
  'Rp 5.000.000 - Rp 10.000.000',
  'Rp 10.000.000 - Rp 20.000.000',
  '> Rp 20.000.000',
];

const FormBenchmarkScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [metrics, setMetrics] = useState<RenderMetrics>({
    renderCount: 0,
    lastRenderTimeMs: 0,
    totalRenderTimeMs: 0,
    avgRenderTimeMs: 0,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const renderStartRef = useRef<number>(Date.now());

  const isInitialMount = useRef(true);

  // Track re-renders only when formData changes (user interaction)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const renderTime = Date.now() - renderStartRef.current;
    setMetrics((prev) => {
      const newCount = prev.renderCount + 1;
      const newTotal = prev.totalRenderTimeMs + renderTime;
      return {
        renderCount: newCount,
        lastRenderTimeMs: renderTime,
        totalRenderTimeMs: newTotal,
        avgRenderTimeMs: newTotal / newCount,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const validateField = useCallback(
    (fieldName: string, value: string): string | undefined => {
      switch (fieldName) {
        case 'nik':
          if (!value) return 'NIK wajib diisi';
          if (value.length !== 16) return 'NIK harus 16 digit';
          if (!/^\d+$/.test(value)) return 'NIK hanya boleh angka';
          return undefined;
        case 'namaLengkap':
          if (!value) return 'Nama wajib diisi';
          if (value.length < 3) return 'Nama minimal 3 karakter';
          return undefined;
        case 'tempatLahir':
          return !value ? 'Tempat lahir wajib diisi' : undefined;
        case 'alamat':
          if (!value) return 'Alamat wajib diisi';
          if (value.length < 10) return 'Alamat minimal 10 karakter';
          return undefined;
        case 'rt':
          if (!value) return 'RT wajib diisi';
          if (value.length > 3) return 'RT maksimal 3 digit';
          return undefined;
        case 'rw':
          if (!value) return 'RW wajib diisi';
          if (value.length > 3) return 'RW maksimal 3 digit';
          return undefined;
        case 'noHp':
          if (!value) return 'No. HP wajib diisi';
          if (!/^08[0-9]{8,11}$/.test(value)) return 'Format HP tidak valid';
          return undefined;
        case 'email':
          if (value && !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(value))
            return 'Format email tidak valid';
          return undefined;
        case 'namaIbuKandung':
          return !value ? 'Nama ibu kandung wajib diisi' : undefined;
        default:
          return undefined;
      }
    },
    []
  );

  const updateField = useCallback(
    (fieldName: keyof FormData, value: string) => {
      renderStartRef.current = Date.now();

      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(() => {
    const hasError =
      formData.nik.length !== 16 ||
      formData.namaLengkap.length < 3 ||
      !formData.tempatLahir ||
      formData.alamat.length < 10 ||
      !formData.noHp ||
      !formData.namaIbuKandung;

    if (hasError) {
      Alert.alert('Error', 'Mohon lengkapi semua field yang wajib diisi');
    } else {
      setIsSubmitted(true);
    }
  }, [formData]);

  const DropdownPicker: React.FC<{
    label: string;
    fieldName: keyof FormData;
    options: string[];
  }> = ({ label, fieldName, options }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() =>
          setShowDropdown(showDropdown === fieldName ? null : fieldName)
        }
      >
        <Text
          style={[
            styles.dropdownText,
            !formData[fieldName] && styles.placeholderText,
          ]}
        >
          {formData[fieldName] || `Pilih ${label}`}
        </Text>
        <Text>▼</Text>
      </TouchableOpacity>
      {showDropdown === fieldName && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                updateField(fieldName, option);
                setShowDropdown(null);
              }}
            >
              <Text style={styles.dropdownItemText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const RadioGroup: React.FC<{
    label: string;
    fieldName: keyof FormData;
    options: string[];
  }> = ({ label, fieldName, options }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.radioOption}
            onPress={() => updateField(fieldName, option)}
          >
            <View
              style={[
                styles.radio,
                formData[fieldName] === option && styles.radioSelected,
              ]}
            >
              {formData[fieldName] === option && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioLabel}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>📝 Form Benchmark</Text>

      {/* Render Performance Card */}
      <View style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>⚡ Render Performance</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Re-renders</Text>
            <Text style={styles.metricValue}>{metrics.renderCount}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Last Render</Text>
            <Text style={[styles.metricValue, { color: '#FF9800' }]}>
              {metrics.lastRenderTimeMs}ms
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Avg Render</Text>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
              {metrics.avgRenderTimeMs.toFixed(1)}ms
            </Text>
          </View>
        </View>
      </View>

      {/* === Data Pribadi === */}
      <Text style={styles.sectionTitle}>Data Pribadi</Text>

      <FormFieldRN
        label="NIK"
        value={formData.nik}
        error={errors.nik}
        placeholder="Masukkan 16 digit NIK"
        onChangeText={(v) => updateField('nik', v)}
        keyboardType="numeric"
        maxLength={16}
      />
      <FormFieldRN
        label="Nama Lengkap"
        value={formData.namaLengkap}
        error={errors.namaLengkap}
        placeholder="Masukkan nama lengkap"
        onChangeText={(v) => updateField('namaLengkap', v)}
      />
      <FormFieldRN
        label="Tempat Lahir"
        value={formData.tempatLahir}
        error={errors.tempatLahir}
        placeholder="Masukkan tempat lahir"
        onChangeText={(v) => updateField('tempatLahir', v)}
      />
      <FormFieldRN
        label="Tanggal Lahir"
        value={formData.tanggalLahir}
        error={errors.tanggalLahir}
        placeholder="DD/MM/YYYY"
        onChangeText={(v) => updateField('tanggalLahir', v)}
      />

      <RadioGroup
        label="Jenis Kelamin"
        fieldName="jenisKelamin"
        options={['Laki-laki', 'Perempuan']}
      />

      {/* === Alamat === */}
      <Text style={styles.sectionTitle}>Alamat</Text>

      <FormFieldRN
        label="Alamat Lengkap"
        value={formData.alamat}
        error={errors.alamat}
        placeholder="Masukkan alamat lengkap"
        onChangeText={(v) => updateField('alamat', v)}
        multiline
        numberOfLines={3}
      />

      <View style={styles.rowFields}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <FormFieldRN
            label="RT"
            value={formData.rt}
            error={errors.rt}
            placeholder="000"
            onChangeText={(v) => updateField('rt', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <FormFieldRN
            label="RW"
            value={formData.rw}
            error={errors.rw}
            placeholder="000"
            onChangeText={(v) => updateField('rw', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <FormFieldRN
        label="Kelurahan/Desa"
        value={formData.kelurahan}
        error={errors.kelurahan}
        placeholder="Masukkan kelurahan"
        onChangeText={(v) => updateField('kelurahan', v)}
      />
      <FormFieldRN
        label="Kecamatan"
        value={formData.kecamatan}
        error={errors.kecamatan}
        placeholder="Masukkan kecamatan"
        onChangeText={(v) => updateField('kecamatan', v)}
      />

      <DropdownPicker label="Kota/Kabupaten" fieldName="kota" options={KOTA_OPTIONS} />
      <DropdownPicker label="Provinsi" fieldName="provinsi" options={PROVINSI_OPTIONS} />

      {/* === Data Lainnya === */}
      <Text style={styles.sectionTitle}>Data Lainnya</Text>

      <DropdownPicker label="Agama" fieldName="agama" options={AGAMA_OPTIONS} />
      <DropdownPicker
        label="Status Perkawinan"
        fieldName="statusPerkawinan"
        options={STATUS_OPTIONS}
      />
      <DropdownPicker label="Pekerjaan" fieldName="pekerjaan" options={PEKERJAAN_OPTIONS} />

      <RadioGroup
        label="Kewarganegaraan"
        fieldName="kewarganegaraan"
        options={['WNI', 'WNA']}
      />

      {/* === Kontak === */}
      <Text style={styles.sectionTitle}>Kontak</Text>

      <FormFieldRN
        label="No. HP"
        value={formData.noHp}
        error={errors.noHp}
        placeholder="08xxxxxxxxxx"
        onChangeText={(v) => updateField('noHp', v)}
        keyboardType="phone-pad"
      />
      <FormFieldRN
        label="Email (opsional)"
        value={formData.email}
        error={errors.email}
        placeholder="email@example.com"
        onChangeText={(v) => updateField('email', v)}
        keyboardType="email-address"
      />
      <FormFieldRN
        label="Nama Ibu Kandung"
        value={formData.namaIbuKandung}
        error={errors.namaIbuKandung}
        placeholder="Masukkan nama ibu kandung"
        onChangeText={(v) => updateField('namaIbuKandung', v)}
      />

      <DropdownPicker
        label="Penghasilan Bulanan"
        fieldName="penghasilanBulanan"
        options={PENGHASILAN_OPTIONS}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>📤 Submit Form</Text>
      </TouchableOpacity>

      {isSubmitted && (
        <View style={styles.successCard}>
          <Text style={styles.successText}>✅ Form berhasil disubmit!</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Reusable Form Field Component
const FormFieldRN: React.FC<{
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}> = ({
  label,
  value,
  error,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  numberOfLines = 1,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[
        styles.textInput,
        error ? styles.textInputError : null,
        multiline ? { height: numberOfLines * 40, textAlignVertical: 'top' } : null,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      keyboardType={keyboardType}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  metricsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#999',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    color: '#1A1A1A',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#1A1A1A',
  },
  textInputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  rowFields: {
    flexDirection: 'row',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6200EE',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6200EE',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200EE',
  },
  radioLabel: {
    fontSize: 14,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  successText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default FormBenchmarkScreen;
