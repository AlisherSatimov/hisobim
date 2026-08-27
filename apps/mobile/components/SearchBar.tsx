import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder ?? 'Ism yoki telefon...'}
        value={value}
        onChangeText={onChangeText}
        style={styles.searchbar}
        inputStyle={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: 'white' },
  searchbar: { elevation: 0, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 48 },
  input: { fontSize: 16, alignSelf: 'center', minHeight: 0 },
});
