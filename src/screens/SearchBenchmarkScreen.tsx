import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { loadPhotos } from '../services/database';
import { PhotoItem } from '../types/PhotoItem';

interface SearchLog {
  query: string;
  resultCount: number;
  latencyMs: number;
  timestamp: number;
}

const SearchBenchmarkScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoItem[]>([]);
  const [searchLatencyMs, setSearchLatencyMs] = useState(0);
  const [searchHistory, setSearchHistory] = useState<SearchLog[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      const photos = await loadPhotos();
      setAllPhotos(photos);
      setFilteredPhotos(photos);
      setIsDataLoaded(photos.length > 0);
    };
    load();
  }, []);

  const onSearchQueryChanged = useCallback(
    (text: string) => {
      setQuery(text);

      // Debounce 100ms
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const startTime = Date.now();

        const filtered = text.trim() === ''
          ? allPhotos
          : allPhotos.filter((photo) =>
              photo.title.toLowerCase().includes(text.toLowerCase())
            );

        const latency = Date.now() - startTime;

        setFilteredPhotos(filtered);
        setSearchLatencyMs(latency);

        const log: SearchLog = {
          query: text,
          resultCount: filtered.length,
          latencyMs: latency,
          timestamp: Date.now(),
        };

        setSearchHistory((prev) => [...prev, log].slice(-20));
      }, 100);
    },
    [allPhotos]
  );

  const renderPhoto = useCallback(
    ({ item }: { item: PhotoItem }) => (
      <View style={styles.photoCard}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.photoInfo}>
          <Text style={styles.photoId}>#{item.id}</Text>
          <Text style={styles.photoTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: PhotoItem) => item.id.toString(),
    []
  );

  const getLatencyColor = (ms: number): string => {
    if (ms < 10) return '#6200EE';
    if (ms < 50) return '#FF9800';
    return '#F44336';
  };

  if (!isDataLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🔍 Search Benchmark</Text>
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Jalankan Test 1 terlebih dahulu untuk mengisi data!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔍 Search Benchmark</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Ketik untuk mencari..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={onSearchQueryChanged}
        autoCorrect={false}
      />

      {/* Live Latency */}
      <View style={styles.latencyCard}>
        <View style={styles.latencyRow}>
          <Text>⏱️ Search Latency</Text>
          <Text
            style={[
              styles.latencyValue,
              { color: getLatencyColor(searchLatencyMs) },
            ]}
          >
            {searchLatencyMs}ms
          </Text>
        </View>
        <View style={styles.latencyRow}>
          <Text>📦 Results</Text>
          <Text style={styles.latencyValue}>
            {filteredPhotos.length} / {allPhotos.length}
          </Text>
        </View>
      </View>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>📝 Search Log (last 20)</Text>
          {searchHistory
            .slice()
            .reverse()
            .slice(0, 5)
            .map((log, idx) => (
              <View key={idx} style={styles.historyRow}>
                <Text style={styles.historyQuery} numberOfLines={1}>
                  "{log.query}"
                </Text>
                <Text style={styles.historyResult}>
                  {log.resultCount} results
                </Text>
                <Text style={styles.historyLatency}>{log.latencyMs}ms</Text>
              </View>
            ))}
        </View>
      )}

      {/* Filtered Results */}
      <FlatList
        data={filteredPhotos}
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
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  latencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  latencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  latencyValue: {
    fontWeight: 'bold',
    color: '#6200EE',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    color: '#E65100',
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    maxHeight: 150,
  },
  historyTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  historyQuery: {
    flex: 1,
    fontSize: 12,
  },
  historyResult: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  historyLatency: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  photoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
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
  list: {
    paddingBottom: 16,
  },
});

export default SearchBenchmarkScreen;
