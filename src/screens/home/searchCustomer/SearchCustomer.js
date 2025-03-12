import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import FontText from 'components/FontText';
import DrawerHeader from 'components/header/DrawerHeader';
import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import {useLoader} from 'providers/LoaderProvider';
import React, {useState} from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {isTablet} from 'react-native-device-info';
import customerService from 'services/customerService';

const SearchCustomer = ({user, openDrawer}) => {
  const {startLoader, stopLoader} = useLoader();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedCustomerForNote, setSelectedCustomerForNote] = useState(null);

  const {width} = useWindowDimensions();
  const numColumns = width > 768 ? 2 : 1;

  const fetchCustomers = async (reset = false) => {
    if (loadingMore) {
      return;
    }
    reset ? startLoader() : setLoadingMore(true);

    try {
      const params = {
        pageNumber: reset ? 1 : pageNumber,
        searchText: searchQuery,
      };
      const response = await customerService.getCustomer(params);

      if (response.status) {
        const newCustomers = response.data.customers || [];
        setResults(reset ? newCustomers : [...results, ...newCustomers]);
        setTotalRecords(response.data.count);
        setPageNumber(reset ? 2 : pageNumber + 1);
        setNextPageAvailable(response.data.next_page_available);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      if (reset) {
        stopLoader();
      }
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setPageNumber(1);
    fetchCustomers(true);
  };

  const openModal = customer => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const openNoteModal = customer => {
    setSelectedCustomerForNote(customer);
    setNoteModalVisible(true);
    setNoteText('');
  };

  const closeNoteModal = () => {
    setNoteModalVisible(false);
    setSelectedCustomerForNote(null);
    setNoteText('');
  };

  const handleNoteSubmit = async () => {
    try {
      closeNoteModal();
      startLoader();
      const params = {
        customer_id: selectedCustomerForNote.id,
        note: noteText, // Note text
        user_id: user.id,
      };
      const response = await customerService.addNote(params);
      if (response && response?.status === true) {
        alert('Note added successfully');
      }
    } catch (e) {
      alert(e);
    } finally {
      stopLoader();
    }
    console.log(`Note for customer ${selectedCustomerForNote.id}: ${noteText}`);
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Pressable onPress={() => openModal(item)}>
        <Text style={styles.title}>{item.customer_name}</Text>
        <View style={styles.modalRow}>
          <Text style={styles.listKey}>{'Account:'}</Text>
          <Text style={styles.listValue}>{item.account_name}</Text>
        </View>
        <View style={styles.modalRow}>
          <Text style={styles.listKey}>{'Full Name:'}</Text>
          <Text style={styles.listValue}>{item.first_last_name}</Text>
        </View>
        <View style={styles.modalRow}>
          <Text style={styles.listKey}>{'Email'}:</Text>
          <Text style={styles.listValue}>{item.email}</Text>
        </View>
        {item.note ? (
          <View style={styles.modalRow}>
            <Text style={styles.listKey}>{'Note'}:</Text>
            <Text style={styles.listValue}>{item.note}</Text>
          </View>
        ) : null}
      </Pressable>
      <Pressable style={styles.noteButton} onPress={() => openNoteModal(item)}>
        <Text style={styles.noteButtonText}>Add Note</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <DrawerHeader
        hasLeft
        openDrawer={openDrawer}
        title={'Search Customer'}
        hasRight
        right={
          <Pressable onPress={() => Utils.userLogout()}>
            <FontText
              fontFamily={Fonts.bold}
              textAlign="center"
              color={colors.blue_0165fc}
              size={isTablet() ? normalize(15) : normalize(13)}>
              {'Switch Account'}
            </FontText>
          </Pressable>
        }
      />

      <View style={styles.subContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search by Name, Email, Account..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </Pressable>
        </View>

        {totalRecords === 0 && (
          <View style={styles.noRecordsContainer}>
            <Text style={styles.noRecordsText}>No Records Found</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
          onEndReached={() => nextPageAvailable && fetchCustomers(false)}
          onEndReachedThreshold={0.5}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedCustomer &&
                Object.entries(selectedCustomer).map(([key, value]) => (
                  <View key={key} style={styles.modalRow}>
                    <Text style={styles.modalKey}>
                      {Utils.convertToTitleCase(key)}:
                    </Text>
                    <Text style={styles.modalValue}>{String(value)}</Text>
                  </View>
                ))}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeNoteModal}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}>
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Enter note..."
                value={noteText}
                onChangeText={setNoteText}
              />
              <View style={styles.noteButtonContainer}>
                <Pressable
                  style={styles.closeButton}
                  onPress={handleNoteSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
                <Pressable style={styles.closeButton} onPress={closeNoteModal}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  buttonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    margin: 6,
    borderRadius: 8,
    elevation: 2,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  modalRow: {flexDirection: 'row', marginBottom: 5, flex: 1},
  modalKey: {
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
    fontSize: normalize(15),
  },
  modalValue: {flex: 2, color: '#555', fontSize: normalize(15)},
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  subContainer: {
    paddingHorizontal: wp(16),
    paddingBottom: wp(16),
  },
  totalRecordsContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  totalRecordsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noRecordsContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noRecordsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  title: {fontWeight: 'bold', marginBottom: 5, fontSize: normalize(14)},
  columnWrapper: {justifyContent: 'space-between'},
  list: {flexDirection: 'row', marginBottom: 5, flex: 1},
  listKey: {
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
    fontSize: normalize(14),
  },
  listValue: {flex: 2, color: '#555', fontSize: normalize(14)},
  noteButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  noteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noteInput: {
    height: 150,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  noteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});

export default SearchCustomer;
