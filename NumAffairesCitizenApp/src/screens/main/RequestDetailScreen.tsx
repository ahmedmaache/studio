
// src/screens/main/RequestDetailScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, Linking, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { requestService, type ServiceRequest, type ServiceRequestHistoryEntry } from '../../api/requestService';

type RequestDetailRouteParams = {
  RequestDetailScreen: { // Le nom de la route dans votre navigateur
    requestId: string;
  };
};

// Typage de la prop route
type ScreenRouteProp = RouteProp<RequestDetailRouteParams, 'RequestDetailScreen'>;

export default function RequestDetailScreen() {
  const route = useRoute<ScreenRouteProp>();
  const { requestId } = route.params;
  const { userToken } = useAuth();

  const [requestDetails, setRequestDetails] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!userToken) {
      setError("Utilisateur non authentifié.");
      setIsLoading(false);
      return;
    }
    if (!requestId) {
        setError("ID de demande manquant.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    const result = await requestService.getMyServiceRequestDetails(requestId, userToken);
    setIsLoading(false);
    if (result.success && result.data) {
      setRequestDetails(result.data);
    } else {
      setError(result.error || 'Erreur lors du chargement des détails de la demande.');
      setRequestDetails(null); // S'assurer que les détails précédents sont effacés en cas d'erreur
    }
  }, [requestId, userToken]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  const handleOpenAttachment = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Impossible d'ouvrir ce lien: ${url}`);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#007AFF" />;
  }

  if (error) {
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
  }

  if (!requestDetails) {
    return <Text style={styles.centered}>Détails de la demande non trouvés.</Text>;
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING': return styles.statusPending;
        case 'IN_PROGRESS': return styles.statusInProgress;
        case 'RESOLVED': return styles.statusResolved;
        case 'REJECTED': return styles.statusRejected;
        default: return styles.statusDefault;
    }
  };

  const renderHistoryEntry = (entry: ServiceRequestHistoryEntry, index: number) => (
    <View key={index} style={styles.historyEntry}>
      <Text style={styles.historyTimestamp}>{new Date(entry.timestamp).toLocaleString()}</Text>
      <Text style={styles.historyAction}>Action: <Text style={styles.historyActionText}>{entry.action}</Text></Text>
      {entry.oldStatus && entry.newStatus && (
        <Text style={styles.historyDetail}>Statut changé de <Text style={getStatusStyle(entry.oldStatus)}>{entry.oldStatus}</Text> à <Text style={getStatusStyle(entry.newStatus)}>{entry.newStatus}</Text></Text>
      )}
      {entry.assignedToAdminName && (
        <Text style={styles.historyDetail}>Assigné à: {entry.assignedToAdminName}</Text>
      )}
      {entry.adminName && entry.action !== 'CREATED' && ( // Ne pas montrer 'Par: Citizen' pour la création
          <Text style={styles.historyDetail}>Par: {entry.adminName}</Text>
      )}
      {entry.notes && <Text style={styles.historyNotes}>Notes: {entry.notes}</Text>}
      {entry.description && <Text style={styles.historyNotes}>Détail: {entry.description}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Détails de la Demande</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations Générales</Text>
        <DetailRow label="ID Demande:" value={requestDetails.id} />
        <DetailRow label="Type:" value={requestDetails.requestType} />
        <DetailRow label="Statut:" value={requestDetails.status} valueStyle={[styles.statusBadge, getStatusStyle(requestDetails.status)]}/>
        <DetailRow label="Soumise le:" value={new Date(requestDetails.createdAt).toLocaleString()} />
        <DetailRow label="Mise à jour le:" value={new Date(requestDetails.updatedAt).toLocaleString()} />
        {requestDetails.assignedAdmin?.name && (
            <DetailRow label="Assignée à:" value={requestDetails.assignedAdmin.name} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.descriptionText}>{requestDetails.description}</Text>
      </View>

      {requestDetails.attachments && requestDetails.attachments.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pièces Jointes</Text>
          {requestDetails.attachments.map((attUrl: string, index: number) => (
            <TouchableOpacity key={index} onPress={() => handleOpenAttachment(attUrl)} style={styles.attachmentButton}>
              <Text style={styles.attachmentLink}>Voir Pièce Jointe {index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {requestDetails.adminNotes && (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes de l'Administration</Text>
            <Text style={styles.notesText}>{requestDetails.adminNotes}</Text>
        </View>
      )}

      {requestDetails.resolutionNotes && (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes de Résolution</Text>
            <Text style={styles.notesText}>{requestDetails.resolutionNotes}</Text>
        </View>
      )}
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historique de la Demande</Text>
        {requestDetails.historyLog && requestDetails.historyLog.length > 0 ? (
          requestDetails.historyLog.map(renderHistoryEntry)
        ) : (
          <Text>Aucun historique disponible.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const DetailRow: React.FC<{label: string, value: string, valueStyle?: any}> = ({label, value, valueStyle}) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  container: { flex: 1, padding: 10, backgroundColor: '#f8f9fa', },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#007AFF' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, },
  label: { fontSize: 15, fontWeight: '600', color: '#495057', marginRight: 8, width: 120 },
  value: { fontSize: 15, color: '#212529', flexShrink: 1 },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    overflow: 'hidden', // Ensure borderRadius clips background
    minWidth: 100,
  },
  statusPending: { backgroundColor: '#ffc107', color: '#333' }, // Yellow
  statusInProgress: { backgroundColor: '#17a2b8', color: 'white'}, // Cyan
  statusResolved: { backgroundColor: '#28a745', color: 'white'}, // Green
  statusRejected: { backgroundColor: '#dc3545', color: 'white'}, // Red
  statusDefault: { backgroundColor: '#6c757d', color: 'white'}, // Gray for others
  descriptionText: { fontSize: 15, color: '#343a40', lineHeight: 22 },
  notesText: { fontSize: 15, color: '#343a40', fontStyle: 'italic', lineHeight: 22 },
  attachmentButton: {
    paddingVertical: 8,
    marginVertical: 4,
  },
  attachmentLink: { fontSize: 15, color: '#007bff', textDecorationLine: 'underline' },
  historyEntry: {
    backgroundColor: '#f1f3f5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#adb5bd'
  },
  historyTimestamp: { fontSize: 12, color: '#6c757d', marginBottom: 4 },
  historyAction: { fontSize: 14, fontWeight: 'bold', color: '#343a40'},
  historyActionText: { fontWeight: 'normal' },
  historyDetail: { fontSize: 13, color: '#495057', marginTop: 2},
  historyNotes: { fontSize: 13, color: '#495057', fontStyle: 'italic', marginTop: 3, backgroundColor: '#e9ecef', padding: 5, borderRadius: 3},
});
