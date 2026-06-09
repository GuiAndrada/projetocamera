import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const IP = '172.20.10.2';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  async function validarLogin() {
    try {
      const response = await fetch(`http://${IP}/app_teste/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, senha }),
      });
      const data = await response.json();

      if (data.status === 'sucesso') {
        router.push((`/mapa?email=${usuario}&tipo=${data.tipo}`) as any);
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#27ae60', dark: '#1a5c38' }}
      headerImage={
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png' }}
          style={styles.logo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🌱 EcoMap</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedText>Mapeamento de Lixo Eletrônico</ThemedText>

      <ThemedText>Email</ThemedText>
      <TextInput
        placeholder="Digite seu email"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <ThemedText>Senha</ThemedText>
      <TextInput
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
        style={styles.input}
      />

      <Button onPress={validarLogin} title="Entrar" color="#27ae60" />

      <ThemedView style={styles.stepContainer} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  logo: { height: 178, width: 178, bottom: 0, left: 0, position: 'absolute' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    borderRadius: 8, marginBottom: 10, backgroundColor: '#fff',
  },
});