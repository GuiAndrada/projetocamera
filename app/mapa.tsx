import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

const IP = '172.20.10.2';

type Ponto = {
  id: string;
  nome: string;
  descricao: string;
  latitude: string;
  longitude: string;
  foto: string;
};

type Denuncia = {
  id: string;
  descricao: string;
  latitude: string;
  longitude: string;
  foto: string;
  status: string;
  usuario: string;
};

export default function Mapa() {
  const { email, tipo } = useLocalSearchParams();
  const router = useRouter();
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [pontoSelecionado, setPontoSelecionado] = useState<Ponto | null>(null);
  const [denunciaSelecionada, setDenunciaSelecionada] = useState<Denuncia | null>(null);
  const [regiao, setRegiao] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const buscarDados = async () => {
    try {
      const [rPontos, rDenuncias] = await Promise.all([
        fetch(`http://${IP}/app_teste/pontos_listar.php`),
        fetch(`http://${IP}/app_teste/denuncias_listar.php`),
      ]);
      setPontos(await rPontos.json());
      setDenuncias(await rDenuncias.json());
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do mapa.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDados();
      obterLocalizacao();
    }, [])
  );

  const obterLocalizacao = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    setRegiao({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const excluirPonto = (p: Ponto) => {
    Alert.alert(
      'Excluir Ponto',
      `Deseja excluir "${p.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://${IP}/app_teste/pontos_deletar.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: p.id }),
              });
              const data = await response.json();
              if (data.status === 'sucesso') {
                setPontos(prev => prev.filter(x => x.id !== p.id));
                setPontoSelecionado(null);
              }
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  const excluirDenuncia = (d: Denuncia) => {
    Alert.alert(
      'Excluir Denúncia',
      'Deseja excluir esta denúncia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://${IP}/app_teste/denuncias_deletar.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: d.id }),
              });
              const data = await response.json();
              if (data.status === 'sucesso') {
                setDenuncias(prev => prev.filter(x => x.id !== d.id));
                setDenunciaSelecionada(null);
              }
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🌱 EcoMap</Text>
        <Text style={styles.usuario}>{email}</Text>
      </View>

      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: '#8e44ad' }]} />
          <Text style={styles.legendaTexto}>Ponto de coleta</Text>
        </View>
        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendaTexto}>Denúncia</Text>
        </View>
      </View>

      <MapView style={styles.mapa} region={regiao} showsUserLocation>
        {pontos.map((p) => (
          <Marker
            key={`ponto-${p.id}`}
            coordinate={{
              latitude: parseFloat(p.latitude),
              longitude: parseFloat(p.longitude),
            }}
            pinColor="#8e44ad"
            onPress={() => { setPontoSelecionado(p); setDenunciaSelecionada(null); }}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitulo}>{p.nome}</Text>
                {p.descricao ? <Text style={styles.calloutDesc}>{p.descricao}</Text> : null}
                {p.foto ? <Image source={{ uri: p.foto }} style={styles.calloutFoto} /> : null}
              </View>
            </Callout>
          </Marker>
        ))}

        {denuncias.map((d) => (
          <Marker
            key={`denuncia-${d.id}`}
            coordinate={{
              latitude: parseFloat(d.latitude),
              longitude: parseFloat(d.longitude),
            }}
            pinColor="#e74c3c"
            onPress={() => { setDenunciaSelecionada(d); setPontoSelecionado(null); }}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitulo}>⚠️ Denúncia</Text>
                {d.descricao ? <Text style={styles.calloutDesc}>{d.descricao}</Text> : null}
                {d.foto ? <Image source={{ uri: d.foto }} style={styles.calloutFoto} /> : null}
                <Text style={[styles.calloutStatus, { color: d.status === 'resolvido' ? '#27ae60' : '#e74c3c' }]}>
                  {d.status === 'resolvido' ? '✅ Resolvido' : '🔴 Pendente'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Painel de ação admin para ponto selecionado */}
      {tipo === 'admin' && pontoSelecionado && (
        <View style={styles.painelAcao}>
          <Text style={styles.painelTitulo}>📍 {pontoSelecionado.nome}</Text>
          <TouchableOpacity style={styles.botaoExcluir} onPress={() => excluirPonto(pontoSelecionado)}>
            <Text style={styles.botaoExcluirTexto}>🗑️ Excluir Ponto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPontoSelecionado(null)}>
            <Text style={styles.fechar}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Painel de ação admin para denúncia selecionada */}
      {tipo === 'admin' && denunciaSelecionada && (
        <View style={styles.painelAcao}>
          <Text style={styles.painelTitulo}>⚠️ Denúncia de {denunciaSelecionada.usuario}</Text>
          <Text style={styles.painelDesc}>{denunciaSelecionada.descricao}</Text>
          <TouchableOpacity style={styles.botaoExcluir} onPress={() => excluirDenuncia(denunciaSelecionada)}>
            <Text style={styles.botaoExcluirTexto}>🗑️ Excluir Denúncia</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDenunciaSelecionada(null)}>
            <Text style={styles.fechar}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botaoDenuncia}
          onPress={() => router.push((`/novaDenuncia?email=${email}`) as any)}
        >
          <Text style={styles.botaoTexto}>⚠️ Fazer Denúncia</Text>
        </TouchableOpacity>

        {tipo === 'admin' && (
          <TouchableOpacity
            style={styles.botaoPonto}
            onPress={() => router.push((`/novoPonto?email=${email}`) as any)}
          >
            <Text style={styles.botaoTexto}>📍 Adicionar Ponto de Coleta</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={() => router.replace('/login' as any)}
        >
          <Text style={styles.botaoTexto}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: {
    backgroundColor: '#27ae60',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  usuario: { fontSize: 12, color: '#d5f5e3' },
  legenda: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bolinha: { width: 12, height: 12, borderRadius: 6 },
  legendaTexto: { fontSize: 13, color: '#333' },
  mapa: { flex: 1 },
  painelAcao: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  painelTitulo: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  painelDesc: { fontSize: 13, color: '#555', marginBottom: 8 },
  botaoExcluir: { backgroundColor: '#e74c3c', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 6 },
  botaoExcluirTexto: { color: '#fff', fontWeight: 'bold' },
  fechar: { textAlign: 'center', color: '#888', fontSize: 13 },
  botoes: { padding: 16, gap: 10, backgroundColor: '#fff' },
  botaoDenuncia: { backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center' },
  botaoPonto: { backgroundColor: '#8e44ad', padding: 14, borderRadius: 10, alignItems: 'center' },
  botaoSair: { backgroundColor: '#95a5a6', padding: 12, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  callout: { width: 200, padding: 8 },
  calloutTitulo: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  calloutDesc: { fontSize: 12, color: '#555', marginBottom: 4 },
  calloutFoto: { width: 180, height: 100, borderRadius: 6, marginTop: 4 },
  calloutStatus: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
});