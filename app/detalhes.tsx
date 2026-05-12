import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

export default function DetalhesScreen() {
  const router = useRouter();
  const { nome, preco, desc, img } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Image source={{ uri: img as string }} style={styles.imagemGrande} />
      <View style={styles.info}>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.preco}>{preco}</Text>
        <Text style={styles.descricao}>{desc}</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imagemGrande: { width: '100%', height: 300 },
  info: { padding: 20 },
  nome: { fontSize: 28, fontWeight: 'bold' },
  preco: { fontSize: 22, color: '#2ecc71', marginVertical: 10 },
  descricao: { fontSize: 16, color: '#666', lineHeight: 22, marginBottom: 20 },
});
