import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PainelAdmin() {
  const { email } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFA726', dark: '#E65100' }}
      headerImage={
        <ThemedView style={styles.headerPlaceholder} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Painel Admin</ThemedText>
      </ThemedView>

      <ThemedText>Bem-vindo, {email}</ThemedText>

      <ThemedView style={styles.stepContainer}>
        <Button
          title="Cadastrar Produto"
          onPress={() => router.push('/cadastroProduto')}
        />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Button
          title="Registrar Visita"
          color="#9b59b6"
          onPress={() => router.push(('/cadastroVisita?email=' + email) as any)}
        />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Button
          title="Sair"
          color="#e74c3c"
          onPress={() => router.replace('/login')}
        />
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerPlaceholder: {
    flex: 1,
    backgroundColor: '#FFA726',
  },
});