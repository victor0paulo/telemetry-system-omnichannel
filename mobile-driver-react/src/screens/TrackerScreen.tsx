// src/screens/TrackerScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function TrackerScreen() {
  const [isOnline, setIsOnline] = useState<boolean | null>(true);
  const [offlineBuffer, setOfflineBuffer] = useState<any[]>([]);

  useEffect(() => {
    // Monitora o estado da rede global do dispositivo
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected && offlineBuffer.length > 0) {
        syncOfflineData();
      }
    });
    return () => unsubscribe();
  }, [offlineBuffer]);

  const handleLocationTick = (newLocation: any) => {
    if (isOnline) {
      // Se online, faz o streaming direto para a API em Node.js
      fetch('https://gateway.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation),
      }).catch(() => saveToOfflineBuffer(newLocation));
    } else {
      saveToOfflineBuffer(newLocation);
    }
  };

  const saveToOfflineBuffer = (data: any) => {
    setOfflineBuffer(prev => [...prev, data]); // Padrão Offline-First
  };

  const syncOfflineData = async () => {
    console.log(`Sincronizando em lote ${offlineBuffer.length} posições acumuladas...`);
    // Lógica para enviar o lote acumulado e limpar o buffer
    setOfflineBuffer([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Status da Conexão: {isOnline ? "🟢 Online" : "🔴 Offline"}</Text>
      <Text style={styles.text}>Métricas em cache local: {offlineBuffer.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  text: { color: '#fff', fontSize: 16, marginBottom: 10 }
});
