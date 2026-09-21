import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { fetchPhotos } from '../services/api';
import { savePhotos, loadPhotos, clearPhotos } from '../services/database';
import { BenchmarkTimer, BenchmarkResult } from '../utils/BenchmarkTimer';
import { PhotoItem } from '../types/PhotoItem';

const DataBenchmarkScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setPhotos([]);

    const timer = new BenchmarkTimer();

    try {
      timer.start();

      // === STEP 1: Fetch Data ===
      const fetchedPhotos = await fetchPhotos(1000);
      timer.mark('fetch');

      // === STEP 2: Save to Local Storage ===
      await clearPhotos();
      await savePhotos(fetchedPhotos);
      timer.mark('storage_write');

      // === STEP 3: Read from Local Storage ===
      const storedPhotos = await loadPhotos();
      timer.mark('storage_read');

      // === STEP 4: Update UI (Render) ===
      setPhotos(storedPhotos);
      timer.mark('render');

      // === Build Result ===
      const benchmarkResult: BenchmarkResult = {
        fetchTimeMs: timer.getMarker('fetch'),
        storageWriteTimeMs: timer.getDelta('fetch', 'storage_write'),
        storageReadTimeMs: timer.getDelta('storage_write', 'storage_read'),
        renderTimeMs: timer.getDelta('storage_read', 'render'),
        totalTimeMs: timer.elapsed(),
        itemCount: storedPhotos.length,
      };

      setResult(benchmarkResult);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderPhoto = useCallback(({ item }: { item: PhotoItem }) => (
    <View style={styles.photoCard}>
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
      />
      <View style={styles.photoInfo}>
        <Text style={styles.photoId}>#{item.id}</Text>
        <Text style={styles.photoTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </View>
  ), []);

  const keyExtractor = useCallback((item: PhotoItem) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Data Masif Benchmark</Text>

      {/* Control Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runBenchmark}
        disabled={isLoading}
      >
        {isLoading && (
          <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Benchmark...' : '🚀 Start Benchmark (1000 Data)'}
        </Text>
      </TouchableOpacity>

      {/* Benchmark Results */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>⚡ Hasil Benchmark</Text>
          <BenchmarkRow label="📡 Fetch" value={`${result.fetchTimeMs}ms`} />
          <BenchmarkRow label="💾 Storage Write" value={`${result.storageWriteTimeMs}ms`} />
          <BenchmarkRow label="📖 Storage Read" value={`${result.storageReadTimeMs}ms`} />
          <BenchmarkRow label="🖥️ Render" value={`${result.renderTimeMs}ms`} />
          <View style={styles.divider} />
          <BenchmarkRow label="⏱️ TOTAL" value={`${result.totalTimeMs}ms`} bold />
          <BenchmarkRow label="📦 Items" value={`${result.itemCount}`} />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>❌ Error: {error}</Text>
        </View>
      )}

      {/* Data List */}
      {photos.length > 0 && (
        <Text style={styles.listHeader}>📋 Data ({photos.length} items)</Text>
      )}

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const BenchmarkRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
}> = ({ label, value, bold }) => (
  <View style={styles.benchmarkRow}>
    <Text style={[styles.benchmarkLabel, bold && styles.boldText]}>{label}</Text>
    <Text style={[styles.benchmarkValue, bold && styles.boldText]}>{value}</Text>
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
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  benchmarkLabel: {
    fontSize: 14,
    color: '#333',
  },
  benchmarkValue: {
    fontSize: 14,
    color: '#6200EE',
  },
  boldText: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  list: {
    paddingBottom: 16,
  },
  photoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  photoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  photoId: {
    fontSize: 12,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  photoTitle: {
    fontSize: 14,
    color: '#333',
  },
});

export default DataBenchmarkScreen;
