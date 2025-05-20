
// src/screens/main/MyRequestsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Button as RNButton } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { requestService, type ServiceRequest } from '../../api/requestService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

// Définir le type pour les éléments partiels affichés dans la liste
type RequestListItem = Pick<ServiceRequest, 'id' | 'requestType' | 'status' | 'createdAt'>;

// Définir les types pour votre MainStack si ce n'est pas déjà fait ailleurs
type MainStackParamList = {
  MyRequestsScreen: undefined; // Ou MyRequests si c'est le nom de la route
  SubmitRequestScreen: undefined;
  RequestDetailScreen: { requestId: string };
  // ... autres écrans dans MainStack
};

type MyRequestsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MyRequestsScreen'>;

export default function MyRequestsScreen() {
  const { userToken } = useAuth();
  const navigation = useNavigation<MyRequestsScreenNavigationProp>();

  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const PAGE_LIMIT = 10;

  const loadRequests = useCallback(async (pageToLoad: number, isRefreshing = false) => {
    if (!userToken) {
      setError("Utilisateur non authentifié.");
      setIsLoading(false);
      if (isRefreshing) setRefreshing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await requestService.getMyServiceRequests(userToken, pageToLoad, PAGE_LIMIT);
    
    setIsLoading(false);
    if (isRefreshing) setRefreshing(false);

    if (result.success && result.data) {
      setRequests(pageToLoad === 1 ? result.data.requests : [...requests, ...result.data.requests]);
      setTotalPages(result.data.totalPages);
      setCurrentPage(result.data.currentPage);
    } else {
      setError(result.error || 'Erreur lors du chargement des demandes.');
      // Si la page 1 échoue, vider les demandes
      if (pageToLoad === 1) setRequests([]);
    }
  }, [userToken, requests]); // requests est ajouté ici pour la logique de `loadMore` si on concatène

  useFocusEffect(
    useCallback(() => {
      // Charger la première page à chaque focus sur l'écran pour rafraîchir
      loadRequests(1, true); 
    }, [userToken]) // Recharger si le userToken change (connexion/déconnexion)
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1); // Réinitialiser la page pour le rafraîchissement
    loadRequests(1, true);
  }, [loadRequests]);

  const handleLoadMore = () => {
    if (!isLoading && currentPage < totalPages) {
      loadRequests(currentPage + 1);
    }
  };

  const renderItem = ({ item }: { item: RequestListItem }) => (
    <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => navigation.navigate('RequestDetailScreen', { requestId: item.id })}
    >
      <Text style={styles.itemType}>{item.requestType || "Type non spécifié"}</Text>
      <View style={styles.itemRow}>
        <Text style={styles.itemLabel}>Statut:</Text>
        <Text style={[styles.itemStatus, styles[`status${item.status}`]]}>{item.status || "N/A"}</Text>
      </View>
      <View style={styles.itemRow}>
         <Text style={styles.itemLabel}>Soumise le:</Text>
         <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.itemId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  const renderListFooter = () => {
    if (isLoading && currentPage > 0 && requests.length > 0) { // Affiche le loader seulement si ce n'est pas le chargement initial
      return <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />;
    }
    return null;
  };

  if (isLoading && requests.length === 0) {
    return <ActivityIndicator style={styles.centered} size="large" color="#007AFF" />;
  }

  if (error && requests.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <RNButton title="Réessayer" onPress={() => loadRequests(1, true)} />
      </View>
    );
  }
  
  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]}/>}
      ListEmptyComponent={() => 
        !isLoading && requests.length === 0 ? (
            <Text style={styles.emptyText}>Aucune demande de service trouvée.</Text>
        ) : null
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderListFooter}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 10,
    flexGrow: 1, // Important pour que ListEmptyComponent soit centré si FlatList est dans une View
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF', // Couleur d'accent
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  itemLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginRight: 5,
  },
  itemType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden', // Pour que le borderRadius s'applique au background
    color: 'white', // Couleur de texte par défaut pour les badges
  },
  statusPENDING: { backgroundColor: '#ffc107', color: '#333' }, // Jaune
  statusIN_PROGRESS: { backgroundColor: '#17a2b8', color: 'white'}, // Cyan
  statusRESOLVED: { backgroundColor: '#28a745', color: 'white'}, // Vert
  statusREJECTED: { backgroundColor: '#dc3545', color: 'white'}, // Rouge
  itemDate: {
    fontSize: 13,
    color: '#6c757d',
  },
  itemId: {
    fontSize: 11,
    color: '#adb5bd',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
});
