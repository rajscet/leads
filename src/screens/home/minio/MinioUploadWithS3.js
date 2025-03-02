import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AWS from 'aws-sdk';

const MinioUploadWithS3 = () => {
  const [image, setImage] = useState(null);

  // Configure AWS S3 for MinIO
  const configureMinIO = () => {
    AWS.config.update({
      accessKeyId: '1ipAlVRm31mDoCTdnnbG', // Replace with your MinIO access key
      secretAccessKey: 'CCTITYWMs1H71OjICR0oAwUR9y6Y9juaAn5BynTF', // Replace with your MinIO secret key
      region: 'us-east-1', // Dummy region
    });

    const s3 = new AWS.S3({
      endpoint: 'https://minio.staging.leads.empireeto.com', // Replace with your MinIO endpoint
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    return s3;
  };

  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setImage(asset.uri);
          uploadToMinIO(asset);
        }
      }
    );
  };

  const uploadToMinIO = async (asset) => {
    const s3 = configureMinIO();
    const fileName = asset.fileName || `photo-${Date.now()}.jpg`;

    try {
      // Fetch the file as a blob
      const response = await fetch(asset.uri);
      console.log('Response:', asset);
      const blob = await response.blob();

      // Upload the file to MinIO
      const params = {
        Bucket: 'leads', // Replace with your bucket name
        Key: fileName,
        Body: blob,
        ContentType: asset.type,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error('Error uploading image:', err);
          Alert.alert('Error', 'Failed to upload image');
        } else {
          console.log('Upload successful', data);
          Alert.alert('Success', 'Image uploaded successfully!');
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select Image" onPress={handleSelectImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default MinioUploadWithS3;
