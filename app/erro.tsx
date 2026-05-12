import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Erro() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">❌ Erro</ThemedText>
      <ThemedText>E-mail ou senha incorretos!</ThemedText>
      <Button title="Voltar" onPress={() => router.replace('/login')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});