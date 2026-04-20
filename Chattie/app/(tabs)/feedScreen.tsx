import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../../utils/AuthContext';

type User = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  type: 'lost' | 'found';
  image?: string;
  user?: User;
  user_id: number;
  created_at?: string;
};

type ApiResponse = {
  status: boolean;
  items: {
    current_page: number;
    data: Item[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  totalPages: number;
};

const getApiBaseUrl = () => {
  return 'http://192.168.100.129:8000';
};

export default function FeedScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showPageModal, setShowPageModal] = useState(false);
  const [goToPage, setGoToPage] = useState('');

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  const { authData } = context;

  const fetchItems = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse>(`${getApiBaseUrl()}/api/items`, {
        params: {
          page: pageNumber
        },
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      });

      const paginatedItems = response.data.items;
      const newItems = paginatedItems.data;
      const totalPagesFromApi = response.data.totalPages || paginatedItems.last_page;
      
      setItems(newItems);
      setTotalPages(totalPagesFromApi);
      setTotalItems(paginatedItems.total);
      setCurrentPage(pageNumber);

    } catch (error: unknown) {
      const err = error as any;
      console.log('Feed error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToFirstPage = () => {
    if (currentPage !== 1) {
      fetchItems(1);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      fetchItems(totalPages);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      fetchItems(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      fetchItems(currentPage + 1);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchItems(pageNum);
      setShowPageModal(false);
      setGoToPage('');
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, []);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      {/* USER INFO */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.type}>
            {item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
          </Text>
        </View>
      </View>

      {/* IMAGE */}
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        {item.category && (
          <Text style={styles.category}>🏷️ {item.category}</Text>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Calculate which page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationInfoText}>
            Page {currentPage} of {totalPages} • {totalItems} items total
          </Text>
        </View>

        <View style={styles.paginationControls}>
          {/* First Page Button - Using play-skip-back instead */}
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={goToFirstPage}
            disabled={currentPage === 1}
          >
            <Ionicons name="play-skip-back" size={20} color={currentPage === 1 ? "#ccc" : "#6C5CE7"} />
          </TouchableOpacity>

          {/* Previous Page Button */}
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#ccc" : "#6C5CE7"} />
            <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
              Prev
            </Text>
          </TouchableOpacity>

          {/* Page Numbers */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageNumbersContainer}>
            {startPage > 1 && (
              <>
                <TouchableOpacity 
                  style={styles.pageNumberButton}
                  onPress={() => fetchItems(1)}
                >
                  <Text style={styles.pageNumberText}>1</Text>
                </TouchableOpacity>
                {startPage > 2 && <Text style={styles.pageDots}>...</Text>}
              </>
            )}

            {pageNumbers.map((pageNum) => (
              <TouchableOpacity
                key={pageNum}
                style={[
                  styles.pageNumberButton,
                  currentPage === pageNum && styles.pageNumberButtonActive
                ]}
                onPress={() => fetchItems(pageNum)}
              >
                <Text style={[
                  styles.pageNumberText,
                  currentPage === pageNum && styles.pageNumberTextActive
                ]}>
                  {pageNum}
                </Text>
              </TouchableOpacity>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <Text style={styles.pageDots}>...</Text>}
                <TouchableOpacity 
                  style={styles.pageNumberButton}
                  onPress={() => fetchItems(totalPages)}
                >
                  <Text style={styles.pageNumberText}>{totalPages}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Next Page Button */}
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#6C5CE7"} />
          </TouchableOpacity>

          {/* Last Page Button - Using play-skip-forward instead */}
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="play-skip-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#6C5CE7"} />
          </TouchableOpacity>

          {/* Go to Page Button */}
          <TouchableOpacity 
            style={styles.goToPageButton}
            onPress={() => setShowPageModal(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#6C5CE7" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (!loading && items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No items found</Text>
          <Text style={styles.emptySubtext}>Be the first to post a lost or found item!</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderPagination}
      />

      {/* Go to Page Modal */}
      <Modal
        visible={showPageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPageModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Go to Page</Text>
              <TouchableOpacity onPress={() => setShowPageModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter page number (1-{totalPages})
            </Text>

            <TextInput
              style={styles.pageInput}
              value={goToPage}
              onChangeText={setGoToPage}
              keyboardType="number-pad"
              placeholder={`1 to ${totalPages}`}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPageModal(false);
                  setGoToPage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleGoToPage}
              >
                <Text style={styles.confirmButtonText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  listContainer: {
    padding: 12,
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  userInfo: {
    flex: 1,
  },

  username: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },

  type: {
    fontSize: 12,
    color: '#666',
  },

  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },

  desc: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  location: {
    marginTop: 10,
    fontSize: 13,
    color: '#888',
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: '#6C5CE7',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
  },

  // Pagination Styles
  paginationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  paginationInfoText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },

  paginationButtonDisabled: {
    backgroundColor: '#fafafa',
  },

  paginationButtonText: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },

  paginationButtonTextDisabled: {
    color: '#ccc',
  },

  pageNumbersContainer: {
    flexDirection: 'row',
    maxWidth: 250,
  },

  pageNumberButton: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },

  pageNumberButtonActive: {
    backgroundColor: '#6C5CE7',
  },

  pageNumberText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  pageNumberTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  pageDots: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 4,
    alignSelf: 'center',
  },

  goToPageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },

  pageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f5f5f5',
  },

  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },

  confirmButton: {
    backgroundColor: '#6C5CE7',
  },

  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
});