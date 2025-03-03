import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {deleteAllLogs, getLogs, deleteLogById} from 'helpers/dbHelpler';
import DrawerHeader from 'components/header/DrawerHeader';
import {Utils} from 'helpers/utils';
import FontText from 'components/FontText';
import Fonts from 'assets/fonts/fonts';
import colors from 'assets/colors';
import {normalize, wp} from 'helpers/styles/responsive';
import {isTablet} from 'react-native-device-info';
import useDidMountEffect from 'components/UseDidMountEffect';
import {useLoader} from 'providers/LoaderProvider';
import globalStyle from 'helpers/styles';

const LogScreen = ({openDrawer}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const {startLoader, stopLoader} = useLoader();

  const fetchLogs = async newOffset => {
    setIsFetching(true);
    try {
      const fetchedLogs = await getLogs(newOffset, 20);
      setLogs(prevLogs =>
        newOffset === 0 ? fetchedLogs : [...prevLogs, ...fetchedLogs],
      );
      setOffset(newOffset + 20);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const handleCopy = text => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Text copied to clipboard.');
  };

  const handleDeleteAllLogs = async () => {
    await deleteAllLogs();
    setLogs([]);
    setOffset(0);
  };

  const handleDelete = async id => {
    await deleteLogById(id);
    setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
  };

  const renderLogItem = ({item}) => (
    <View style={[styles.logItem, globalStyle.shadow]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.desc}</Text>
      <Text>{item.info1}</Text>
      <Text>{item.info2}</Text>
      <Text>{item.time}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() =>
            handleCopy(
              `${item.title}\n${item.desc}\n${item.info1}\n${item.info2}\n${item.time}`,
            )
          }
          style={styles.button}>
          <Text style={styles.buttonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useDidMountEffect(() => {
    if (loading) {
      startLoader();
    } else {
      stopLoader();
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      <DrawerHeader
        hasLeft
        title={'Logs'}
        hasRight
        openDrawer={openDrawer}
        right={
          <Pressable
            onPress={() => {
              Utils.userLogout();
            }}>
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
      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Logs Available</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            onPress={handleDeleteAllLogs}
            style={styles.deleteAllButtons}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Delete All Logs
            </Text>
          </TouchableOpacity>
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={item => item.id.toString()}
            onEndReached={() => fetchLogs(offset)}
            onEndReachedThreshold={0.5}
          />
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  logItem: {
    flex: 1,
    marginTop: wp(16),
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: wp(5),
  },
  title: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  button: {
    marginTop: 5,
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '45%',
  },
  deleteButton: {
    marginTop: 5,
    padding: 8,
    backgroundColor: 'red',
    borderRadius: 5,
    width: '45%',
  },
  buttonText: {color: 'white', textAlign: 'center'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {fontSize: 18, color: '#666'},
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteAllButtons: {
    padding: 10,
    backgroundColor: 'red',
    marginBottom: 10,
    width: '100%',
  },
};

export default LogScreen;
