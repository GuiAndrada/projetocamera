import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const IP = '172.20.10.2';

type Produto = {
  id: string;
  nome: string;
  preco: string;
  imagem: string;
  desc?: string;
};

export default function PainelAluno() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    fetch(`http://${IP}/app_teste/produtos_listar.php`)
      .then(r => r.json())
      .then(data => setProdutos(data))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os produtos.'));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, {email}! 👋</Text>
      <Text style={styles.subtitulo}>⭐ Nossa Vitrine</Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Nenhum produto cadastrado ainda.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/detalhes',
                params: { nome: item.nome, preco: item.preco, desc: item.desc ?? '', img: item.imagem },
              } as any)
            }
          >
            <Image source={{ uri: item.imagem }} style={styles.foto} />
            <View style={styles.cardInfo}>
              <Text style={styles.nomeProduto}>{item.nome}</Text>
              <Text style={styles.precoProduto}>{item.preco}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.botaoSair}>
        <Button title="Sair" color="#e74c3c" onPress={() => router.replace('/login' as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0F4F8', paddingTop: 50 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  subtitulo: { fontSize: 18, fontWeight: '600', color: '#444', marginBottom: 16 },
  lista: { gap: 12, paddingBottom: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  foto: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
  cardInfo: { flex: 1 },
  nomeProduto: { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },
  precoProduto: { color: '#2ecc71', fontWeight: 'bold', fontSize: 15, marginTop: 4 },
  botaoSair: { marginTop: 10, marginBottom: 20 },
});