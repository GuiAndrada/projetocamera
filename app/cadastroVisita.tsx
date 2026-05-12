import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert, Button, Image, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const IP = '172.20.10.2';

export default function CadastroVisita() {
  const { email } = useLocalSearchParams();
  const router = useRouter();

  const [nomeLocal, setNomeLocal] = useState('');
  const [observacao, setObservacao] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permissão negada', 'Permita o acesso à câmera nas configurações.');
        return;
      }
    }
    setMostrarCamera(true);
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setFotoUri(foto!.uri);
      setMostrarCamera(false);
    }
  };

  const usarLocalizacaoAtual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à localização.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocalizacao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const salvarVisita = async () => {
    if (!nomeLocal.trim() || !localizacao) {
      Alert.alert('Atenção', 'Preencha o nome do local e selecione a localização!');
      return;
    }

    const visita = {
      nome_local: nomeLocal,
      observacao,
      latitude: localizacao.latitude,
      longitude: localizacao.longitude,
      foto: fotoUri ?? '',
      funcionario: email as string,
    };

    // Salvar no AsyncStorage
    try {
      const existentes = await AsyncStorage.getItem('@visitas');
      const lista = existentes ? JSON.parse(existentes) : [];
      lista.push({ ...visita, id: Date.now().toString(), data_hora: new Date().toISOString() });
      await AsyncStorage.setItem('@visitas', JSON.stringify(lista));
    } catch (e) {
      console.log('Erro AsyncStorage:', e);
    }

    // Enviar para API
    try {
      const response = await fetch(`http://${IP}/app_teste/visitas_salvar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visita),
      });
      const data = await response.json();
      if (data.status === 'sucesso') {
        Alert.alert('Sucesso!', 'Visita registrada com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erro', 'Falha ao salvar no servidor.');
      }
    } catch (e) {
      Alert.alert('Salvo localmente', 'Sem conexão, visita salva só no dispositivo.');
      router.back();
    }
  };

  if (mostrarCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back" />
        <TouchableOpacity style={styles.botaoFoto} onPress={tirarFoto}>
          <Text style={styles.botaoFotoTexto}>📸 Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => setMostrarCamera(false)}>
          <Text style={styles.botaoFotoTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>📋 Cadastro de Visita</Text>
      <Text style={styles.funcionario}>Funcionário: {email}</Text>

      <Text style={styles.label}>Nome do Local *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Cliente XYZ"
        value={nomeLocal}
        onChangeText={setNomeLocal}
      />

      <Text style={styles.label}>Observação</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Descreva a visita..."
        value={observacao}
        onChangeText={setObservacao}
        multiline
      />

      <Text style={styles.label}>Foto</Text>
      <TouchableOpacity style={styles.botaoCamera} onPress={abrirCamera}>
        <Text style={styles.botaoCameraTexto}>📷 Abrir Câmera</Text>
      </TouchableOpacity>
      {fotoUri && <Image source={{ uri: fotoUri }} style={styles.preview} />}

      <Text style={styles.label}>Localização *</Text>
      <TouchableOpacity style={styles.botaoLoc} onPress={usarLocalizacaoAtual}>
        <Text style={styles.botaoLocTexto}>📍 Usar Localização Atual</Text>
      </TouchableOpacity>

      {localizacao && (
        <>
          <Text style={styles.coordenadas}>
            Lat: {localizacao.latitude.toFixed(6)} | Lon: {localizacao.longitude.toFixed(6)}
          </Text>
          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(e) => setLocalizacao(e.nativeEvent.coordinate)}
          >
            <Marker coordinate={localizacao} />
          </MapView>
          <Text style={styles.dicaMapa}>💡 Toque no mapa para ajustar o marcador</Text>
        </>
      )}

      {!localizacao && (
        <MapView
          style={styles.mapa}
          initialRegion={{
            latitude: -23.5505,
            longitude: -46.6333,
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
          onPress={(e) => setLocalizacao(e.nativeEvent.coordinate)}
        >
        </MapView>
      )}
      <Text style={styles.dicaMapa}>💡 Ou toque no mapa para selecionar o local</Text>

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarVisita}>
        <Text style={styles.botaoSalvarTexto}>💾 Salvar Visita</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <Button title="Voltar" color="#888" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingHorizontal: 20, paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  funcionario: { fontSize: 14, color: '#666', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff', fontSize: 15 },
  botaoCamera: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoCameraTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginTop: 10 },
  botaoLoc: { backgroundColor: '#9b59b6', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoLocTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  coordenadas: { fontSize: 12, color: '#666', marginTop: 6, marginBottom: 6 },
  mapa: { width: '100%', height: 250, borderRadius: 8, marginTop: 10 },
  dicaMapa: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 10 },
  botaoSalvar: { backgroundColor: '#2ecc71', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  botaoSalvarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoFoto: { backgroundColor: '#2ecc71', padding: 16, alignItems: 'center' },
  botaoFotoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: { backgroundColor: '#e74c3c', padding: 16, alignItems: 'center' },
});