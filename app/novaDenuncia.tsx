import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const IP = '172.20.10.2';

export default function NovaDenuncia() {
  const { email } = useLocalSearchParams();
  const router = useRouter();

  const [descricao, setDescricao] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permissão negada', 'Permita o acesso à câmera.');
        return;
      }
    }
    setMostrarCamera(true);
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync({ quality: 0.3, base64: true });
      setFotoUri(foto!.uri);
      setFotoBase64(`data:image/jpg;base64,${foto!.base64}`);
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

  const enviarDenuncia = async () => {
    if (!localizacao) {
      Alert.alert('Atenção', 'Selecione a localização da denúncia!');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Descreva o problema encontrado!');
      return;
    }

    try {
      const response = await fetch(`http://${IP}/app_teste/denuncias_salvar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao,
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          foto: fotoBase64 ?? '',
          usuario: email,
        }),
      });
      const data = await response.json();
      if (data.status === 'sucesso') {
        Alert.alert('✅ Denúncia enviada!', 'Obrigado por ajudar o meio ambiente!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erro', 'Falha ao enviar denúncia.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Sem conexão com o servidor.');
    }
  };

  if (mostrarCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back" />
        <TouchableOpacity style={styles.botaoFoto} onPress={tirarFoto}>
          <Text style={styles.botaoTexto}>📸 Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoCancelar} onPress={() => setMostrarCamera(false)}>
          <Text style={styles.botaoTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>⚠️ Nova Denúncia</Text>
      <Text style={styles.subtitulo}>Reporte lixo eletrônico descartado incorretamente</Text>

      <Text style={styles.label}>Descrição do problema *</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Ex: Televisão antiga abandonada na calçada..."
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <Text style={styles.label}>Foto do local</Text>
      <TouchableOpacity style={styles.botaoCamera} onPress={abrirCamera}>
        <Text style={styles.botaoTexto}>📷 {fotoUri ? 'Trocar Foto' : 'Tirar Foto'}</Text>
      </TouchableOpacity>
      {fotoUri && <Image source={{ uri: fotoUri }} style={styles.preview} />}

      <Text style={styles.label}>Localização *</Text>
      <TouchableOpacity style={styles.botaoLoc} onPress={usarLocalizacaoAtual}>
        <Text style={styles.botaoTexto}>📍 Usar Minha Localização</Text>
      </TouchableOpacity>

      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: localizacao?.latitude ?? -23.5505,
          longitude: localizacao?.longitude ?? -46.6333,
          latitudeDelta: localizacao ? 0.01 : 5,
          longitudeDelta: localizacao ? 0.01 : 5,
        }}
        onPress={(e) => setLocalizacao(e.nativeEvent.coordinate)}
      >
        {localizacao && <Marker coordinate={localizacao} pinColor="#e74c3c" />}
      </MapView>
      <Text style={styles.dica}>💡 Toque no mapa para marcar o local exato</Text>

      <TouchableOpacity style={styles.botaoEnviar} onPress={enviarDenuncia}>
        <Text style={styles.botaoTexto}>🚨 Enviar Denúncia</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <Text style={styles.botaoVoltarTexto}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fafafa', fontSize: 15 },
  botaoCamera: { backgroundColor: '#2980b9', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoLoc: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoEnviar: { backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  botaoVoltar: { padding: 12, alignItems: 'center', marginTop: 8 },
  botaoVoltarTexto: { color: '#888', fontSize: 15 },
  botaoFoto: { backgroundColor: '#27ae60', padding: 16, alignItems: 'center' },
  botaoCancelar: { backgroundColor: '#e74c3c', padding: 16, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginTop: 10 },
  mapa: { width: '100%', height: 220, borderRadius: 8, marginTop: 10 },
  dica: { fontSize: 12, color: '#888', marginTop: 4 },
});