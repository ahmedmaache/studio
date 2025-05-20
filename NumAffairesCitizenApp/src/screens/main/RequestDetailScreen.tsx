import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getMyServiceRequestDetails, ServiceRequest } from '../../api/requestService';
import { AuthContext } from '../../contexts/AuthContext'; // Assuming AuthContext is here

type RequestDetailScreenRouteProp = RouteProp<{ RequestDetail: { requestId: string } }, 'RequestDetail'>;

const RequestDetailScreen: React.FC = () => {
  const route = useRoute<RequestDetailScreenRouteProp>();
  const { requestId } = route.params;
  const { citizenToken } = useContext(AuthContext); // Get token from context

  const [requestDetails, setRequestDetails] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!citizenToken) {
        setError("Authentication token not available.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const details = await getMyServiceRequestDetails(requestId, citizenToken);
        setRequestDetails(details);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch request details.');
        Alert.alert('Error', err.message || 'Failed to fetch request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, citizenToken]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!requestDetails) {
    return (
      <View style={styles.centered}>
        <Text>Request details not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Service Request Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Request ID:</Text>
        <Text style={styles.value}>{requestDetails.id}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{requestDetails.requestType}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{requestDetails.status}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Submitted On:</Text>
        <Text style={styles.value}>{new Date(requestDetails.submissionDate).toLocaleString()}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{requestDetails.description}</Text>
      </View>

      {requestDetails.attachments && requestDetails.attachments.length > 0 && (
        <View>
          <Text style={styles.label}>Attachments:</Text>
          {requestDetails.attachments.map((attachment, index) => (
            <Text key={index} style={styles.value}>{attachment}</Text>
          ))}
        </View>
      )}

      <Text style={styles.historyTitle}>History Log</Text>
      {requestDetails.historyLog && requestDetails.historyLog.length > 0 ? (
        requestDetails.historyLog.map((logEntry, index) => (
          <View key={index} style={styles.historyEntry}>
            <Text style={styles.logTimestamp}>{new Date(logEntry.timestamp).toLocaleString()}</Text>
            <Text style={styles.logMessage}>{logEntry.message}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.value}>No history available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    fontSize: 16,
    flexShrink: 1, // Allow text to wrap
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  historyEntry: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  logTimestamp: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  logMessage: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default RequestDetailScreen;