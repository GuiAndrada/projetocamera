import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, Button, FlatList, Image,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

const IP = '172.20.10.2';

type Produto = {
  id: string;
  nome: string;
  preco: string;
  imagem: string;
};

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const router = useRouter();

  const buscarProdutos = async () => {
    try {
      const response = await fetch(`http://${IP}/app_teste/produtos_listar.php`);
      const data = await response.json();
      setListaProdutos(data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
  };

  useEffect(() => { buscarProdutos(); }, []);

  const salvarProduto = async () => {
    if (nome.trim() === '' || preco.trim() === '') {
      Alert.alert('Atenção', 'Preencha pelo menos o nome e o preço!');
      return;
    }
    try {
      const response = await fetch(`http://${IP}/app_teste/produtos_salvar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          preco,
          imagem: imagem.trim() !== '' ? imagem : 'https://via.placeholder.com/60',
        }),
      });
      const data = await response.json();
      if (data.status === 'sucesso') {
        Alert.alert('Sucesso', 'Produto cadastrado!');
        setNome('');
        setPreco('');
        setImagem('');
        buscarProdutos();
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar o produto.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Produtos</Text>

      <TextInput style={styles.input} placeholder="Nome do produto" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Preço (ex: R$ 150)" value={preco} onChangeText={setPreco} />
      <TextInput style={styles.input} placeholder="URL da foto (opcional)" value={imagem} onChangeText={setImagem} autoCapitalize="none" />

      <TouchableOpacity style={styles.botaoCadastrar} onPress={salvarProduto}>
        <Text style={styles.botaoTexto}>+ Cadastrar Produto</Text>
      </TouchableOpacity>

      <FlatList
        data={listaProdutos}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imagem }} style={styles.foto} />
            <View>
              <Text style={styles.nomeItem}>{item.nome}</Text>
              <Text style={styles.precoItem}>{item.preco}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.botaoVoltar}>
        <Button title="Voltar" color="#888" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 },
  botaoCadastrar: { backgroundColor: '#2ecc71', padding: 14, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderColor: '#eee', gap: 12 },
  foto: { width: 60, height: 60, borderRadius: 8 },
  nomeItem: { fontSize: 16, fontWeight: '600' },
  precoItem: { color: '#2ecc71', fontWeight: 'bold', marginTop: 4 },
  botaoVoltar: { marginBottom: 40 },
});