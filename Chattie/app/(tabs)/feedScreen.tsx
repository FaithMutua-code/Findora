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
  RefreshControl,
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

const getApiBaseUrl = () => {
  return 'http://192.168.100.129:8000';
};

export default function FeedScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showPageModal, setShowPageModal] = useState(false);
  const [goToPage, setGoToPage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'location'>('name');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  const { authData } = context;

  const fetchItems = useCallback(async (
    pageNumber = 1, 
    search: string = '', 
    searchBy: string = 'name',
    filter: string = 'all'
  ) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params: any = {
        page: pageNumber,
      };

      if (search.trim()) {
        params.search = search;
        params.search_by = searchBy;
      }

      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await axios.get(`${getApiBaseUrl()}/api/items`, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
          params,
  
      });

      let extractedItems: Item[] = [];
      let totalPagesFromApi = 1;
      let totalItemsCount = 0;

      if (response.data.items) {
        if (Array.isArray(response.data.items)) {
          extractedItems = response.data.items;
          totalPagesFromApi = response.data.totalPages || 1;
          totalItemsCount = extractedItems.length;
        } else if (response.data.items.data && Array.isArray(response.data.items.data)) {
          extractedItems = response.data.items.data;
          totalPagesFromApi = response.data.totalPages || response.data.items.last_page || 1;
          totalItemsCount = response.data.items.total || extractedItems.length;
        }
      }

      setItems(extractedItems);
      setTotalPages(totalPagesFromApi);
      setTotalItems(totalItemsCount);
      setCurrentPage(pageNumber);

      if (extractedItems.length === 0 && search.trim()) {
        setErrorMessage(`No items found matching "${search}"`);
      } else if (extractedItems.length === 0) {
        setErrorMessage('No items found. Try creating some items first!');
      }

    } catch (error: unknown) {
      const err = error as any;
      console.log('Feed error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authData?.token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    setFilterType('all');
    fetchItems(1, '', 'name', 'all');
  }, [fetchItems]);

  const handleSearch = useCallback(() => {
    setShowSearchModal(false);
    fetchItems(1, searchQuery, searchType, filterType);
  }, [fetchItems, searchQuery, searchType, filterType]);

  const handleFilter = useCallback((filter: 'all' | 'lost' | 'found') => {
    setFilterType(filter);
    fetchItems(1, searchQuery, searchType, filter);
  }, [fetchItems, searchQuery, searchType]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchType('name');
    setFilterType('all');
    fetchItems(1, '', 'name', 'all');
  }, [fetchItems]);

  const goToFirstPage = useCallback(() => {
    if (currentPage !== 1) {
      fetchItems(1, searchQuery, searchType, filterType);
    }
  }, [currentPage, fetchItems, searchQuery, searchType, filterType]);

  const goToLastPage = useCallback(() => {
    if (currentPage !== totalPages) {
      fetchItems(totalPages, searchQuery, searchType, filterType);
    }
  }, [currentPage, totalPages, fetchItems, searchQuery, searchType, filterType]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      fetchItems(currentPage - 1, searchQuery, searchType, filterType);
    }
  }, [currentPage, fetchItems, searchQuery, searchType, filterType]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchItems(currentPage + 1, searchQuery, searchType, filterType);
    }
  }, [currentPage, totalPages, fetchItems, searchQuery, searchType, filterType]);

  const handleGoToPage = useCallback(() => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchItems(pageNum, searchQuery, searchType, filterType);
      setShowPageModal(false);
      setGoToPage('');
    }
  }, [goToPage, totalPages, fetchItems, searchQuery, searchType, filterType]);

  useEffect(() => {
    fetchItems(1, '', 'name', 'all');
  }, [fetchItems]);

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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => setShowSearchModal(true)}
      >
        <Ionicons name="search-outline" size={20} color="#666" />
        <Text style={styles.searchPlaceholder}>
          {searchQuery ? `Search: ${searchQuery}` : 'Search by name or location...'}
        </Text>
        {searchQuery && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
          onPress={() => handleFilter('all')}
        >
          <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
            All Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'lost' && styles.filterChipActive]}
          onPress={() => handleFilter('lost')}
        >
          <Ionicons name="alert-circle-outline" size={16} color={filterType === 'lost' ? '#fff' : '#ff6b6b'} />
          <Text style={[styles.filterChipText, filterType === 'lost' && styles.filterChipTextActive]}>
            Lost Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'found' && styles.filterChipActive]}
          onPress={() => handleFilter('found')}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={filterType === 'found' ? '#fff' : '#51cf66'} />
          <Text style={[styles.filterChipText, filterType === 'found' && styles.filterChipTextActive]}>
            Found Items
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results Info */}
      {totalItems > 0 && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsInfoText}>
            Found {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

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
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={goToFirstPage}
            disabled={currentPage === 1}
          >
            <Ionicons name="play-skip-back" size={20} color={currentPage === 1 ? "#ccc" : "#6C5CE7"} />
          </TouchableOpacity>

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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageNumbersContainer}>
            {startPage > 1 && (
              <>
                <TouchableOpacity 
                  style={styles.pageNumberButton}
                  onPress={() => fetchItems(1, searchQuery, searchType, filterType)}
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
                onPress={() => fetchItems(pageNum, searchQuery, searchType, filterType)}
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
                  onPress={() => fetchItems(totalPages, searchQuery, searchType, filterType)}
                >
                  <Text style={styles.pageNumberText}>{totalPages}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

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

          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="play-skip-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#6C5CE7"} />
          </TouchableOpacity>

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
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No items found</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? `No items matching "${searchQuery}"` 
            : 'Be the first to post a lost or found item!'}
        </Text>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  if (errorMessage && items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchItems(1, '', 'name', 'all')}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderPagination}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6C5CE7']}
          />
        }
      />

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Items</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search Type Selector */}
            <View style={styles.searchTypeContainer}>
              <TouchableOpacity
                style={[styles.searchTypeButton, searchType === 'name' && styles.searchTypeButtonActive]}
                onPress={() => setSearchType('name')}
              >
                <Text style={[styles.searchTypeText, searchType === 'name' && styles.searchTypeTextActive]}>
                  By Name
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.searchTypeButton, searchType === 'location' && styles.searchTypeButtonActive]}
                onPress={() => setSearchType('location')}
              >
                <Text style={[styles.searchTypeText, searchType === 'location' && styles.searchTypeTextActive]}>
                  By Location
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${searchType === 'name' ? 'by user name' : 'by location'}...`}
              placeholderTextColor="#999"
              autoFocus={true}
              onSubmitEditing={handleSearch}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.cancelButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSearch}
              >
                <Text style={styles.confirmButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    padding: 20,
  },

  listContainer: {
    padding: 12,
    flexGrow: 1,
  },

  headerContainer: {
    marginBottom: 12,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    gap: 8,
  },

  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },

  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },

  filterChipActive: {
    backgroundColor: '#6C5CE7',
  },

  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterChipTextActive: {
    color: '#fff',
  },

  resultsInfo: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  resultsInfoText: {
    fontSize: 12,
    color: '#999',
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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

  searchTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  searchTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },

  searchTypeButtonActive: {
    backgroundColor: '#6C5CE7',
  },

  searchTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  searchTypeTextActive: {
    color: '#fff',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
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

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});