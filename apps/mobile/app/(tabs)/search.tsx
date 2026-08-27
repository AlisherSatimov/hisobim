import { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useShopStore, searchCustomers, type Customer } from '@hisobim/shared';
import CustomerCard from '../../components/CustomerCard';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [searched, setSearched] = useState(false);
  const { activeShop } = useShopStore();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!activeShop || text.trim().length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }
    try {
      const data = await searchCustomers(activeShop.id, text.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={handleSearch} placeholder="Ism yoki telefon..." />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push(`/customer/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          searched ? (
            <EmptyState message="Hech narsa topilmadi" />
          ) : (
            <EmptyState message="Qidirish uchun yozing" subMessage="Ism yoki telefon raqam" />
          )
        }
        contentContainerStyle={results.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { paddingBottom: 16 },
  emptyList: { flex: 1 },
});
