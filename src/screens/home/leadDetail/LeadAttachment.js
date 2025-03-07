import LocalImages from 'assets/images/localImages';
import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import {isValidURL} from 'helpers/validation';
import {useLoader} from 'providers/LoaderProvider';
import React, {useState} from 'react';
import Toast from 'react-native-toast-message';
import leadService from 'services/leadService';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {updateFileData, updateSyncFileStatus} from 'helpers/dbHelpler';
import Share from 'react-native-share';

const LeadAttachment = ({data, id, leadId, record}) => {
  const [fileData, setFileData] = useState(data);
  const {startLoader, stopLoader} = useLoader();

  React.useEffect(() => {
    console.log('data', data);
  }, [data]);

  const handleOpenFile = async file => {
    try {
      const shareOptions = {
        title: 'View file',
        url: file.uri,
        type: file.type,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error opening file: ', error);
      // Alert.alert('Error', error.message);
    }
  };

  const handleSync = async (fieldName, index) => {
    try {
      startLoader();
      const url = await Utils.uploadToMinIO(fileData[fieldName][index]);

      if (isValidURL(url.Location)) {
        Toast.show({
          type: 'success',
          text1: 'File upload',
          text2: 'File uploaded successfully',
        });
        setFileData(prevData => {
          const updatedField = prevData[fieldName].map((file, i) =>
            i === index ? {...file, isSync: 1, liveUrl: url} : file,
          );

          return {...prevData, [fieldName]: updatedField};
        });
        await updateLeadWithAttachment(fieldName, index, url);
      }
    } catch (error) {
      alert(error);
    } finally {
      stopLoader();
    }
  };

  const renderFilePreview = (file, fieldName, index) => {
    const renderIcon = () => {
      if (file.mime.includes('image/')) {
        return (
          <Image
            source={{uri: file.uri}}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime === 'application/pdf') {
        return (
          <Image
            source={LocalImages.pdf}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('word')) {
        return (
          <Image
            source={LocalImages.word}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('excel')) {
        return (
          <Image
            source={LocalImages.excel}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else if (file.mime.includes('video')) {
        return (
          <Image
            source={LocalImages.video}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      } else {
        return (
          <Image
            source={LocalImages.doc}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        );
      }
    };

    return (
      <View key={`${fieldName}-${index}`} style={styles.filePreviewItem}>
        <TouchableOpacity onPress={() => handleOpenFile(file)}>
          {renderIcon()}
        </TouchableOpacity>

        <Text style={styles.fileName}>{file.name || 'Unnamed File'}</Text>
        {file.isSync === 0 ? (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleSync(fieldName, index)}>
            <Text style={styles.syncButtonText}>Sync</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.syncedLabel}>Synced</Text>
        )}
      </View>
    );
  };

  const renderFiles = (fieldName, files) => (
    <View style={styles.fileContainer}>
      {files.map((file, index) => renderFilePreview(file, fieldName, index))}
    </View>
  );

  const updateLeadWithAttachment = async (fieldName, index, url) => {
    try {
      const updateLeadResponse = await leadService.updateLead({
        lead_id: leadId,
        data: {
          fieldName: [url],
        },
      });
      if (updateLeadResponse.status === true) {
        setFileData(prevData => {
          const updatedField = prevData[fieldName].map((file, i) =>
            i === index ? {...file, isURLSync: 1} : file,
          );

          return {...prevData, [fieldName]: updatedField};
        });
      }
      Toast.show({
        type: 'success',
        text1: 'File URL sync',
        text2: 'File URL Sync successfully',
      });
    } catch (e) {
      alert(e);
    }
  };

  React.useEffect(() => {
    updateFileData(id, {...record, ...fileData});
    if (Utils.totalIsSyncZeroCount(fileData) === 0) {
      updateSyncFileStatus(id, true);
    }
  }, [fileData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {Object.entries(fileData).length > 0 ? (
          Object.entries(fileData)
            .filter(([_, value]) => Array.isArray(value)) // Only process array fields
            .map(([fieldName, files]) => (
              <View key={fieldName} style={styles.section}>
                <Text style={styles.sectionHeader}>
                  {fieldName.toUpperCase()}
                </Text>
                {renderFiles(fieldName, files)}
              </View>
            ))
        ) : (
          <View style={styles.noAttachment}>
            <Text style={styles.noAttachmentText}>No attachment</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filePreviewItem: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnail: {
    width: wp(100),
    height: wp(100),
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  fileName: {
    fontSize: normalize(12),
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  syncButton: {
    marginTop: 8,
    backgroundColor: '#007BFF',
    paddingVertical: wp(4),
    paddingHorizontal: wp(6),
    borderRadius: wp(4),
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(13),
  },
  syncedLabel: {
    marginTop: 8,
    fontSize: 12,
    color: 'green',
    fontWeight: 'bold',
  },
  noAttachment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noAttachmentText: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#666',
  },
});

export default LeadAttachment;
