import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ServiceRequest } from '../../api/requestService'; // Assuming ServiceRequest interface is exported
import requestService from '../../api/requestService';
import { AuthContext } from '../../contexts/AuthContext'; // Assuming AuthContext is in this path

type RootStackParamList = {
  MyRequests: undefined;
  RequestDetail: { requestId: string };
};

type MyRequestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyRequests'>;
type MyRequestsScreenRouteProp = RouteProp<RootStackParamList, 'MyRequests'>;

type Props = {
  navigation: MyRequestsScreenNavigationProp;
  route: MyRequestsScreenRouteProp;
};

const MyRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { citizenToken } = useContext(AuthContext);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (pageNumber: number) => {
    if (!citizenToken) {
      Alert.alert('Authentication error', 'User not authenticated.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      const response = await requestService.getMyServiceRequests(citizenToken, pageNumber);
      if (response.status === 'success' && response.data) {
        if (pageNumber === 1) {
          setRequests(response.data.requests);
        } else {
          setRequests([...requests, ...response.data.requests]);
        }
        setTotalPages(response.data.totalPages);
        setPage(pageNumber);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch requests.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [citizenToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests(1);
  };

  const loadMore = () => {
    if (page < totalPages && !loading) {
      fetchRequests(page + 1);
    }
  };

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
    >
      <Text style={styles.requestTitle}>Type: {item.requestType}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Submitted: {new Date(item.submissionDate).toLocaleDateString()}</Text>
      {/* Add more key info as needed */}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={() =>
            loading && page > 1 ? <ActivityIndicator size="small" color="#0000ff" /> : null
          }
          ListEmptyComponent={() =>
            !loading && requests.length === 0 ? (
              <Text style={styles.emptyMessage}>No service requests found.</Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default MyRequestsScreen;