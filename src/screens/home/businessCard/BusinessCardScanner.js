import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import textRecognition from '@react-native-ml-kit/text-recognition';
import { Utils } from 'helpers/utils';

const BusinessCardScanner = () => {
  const [imageUri, setImageUri] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleImageSelection = async (fromCamera) => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };

    const response = fromCamera 
      ? await launchCamera(options) 
      : await launchImageLibrary(options);

    if (!response.didCancel && response.assets) {
      const uri = response.assets[0].uri;
      setImageUri(uri);
      processImage(uri);
    }
  };

  const processImage = async (uri) => {
    try {
      const result = await textRecognition.recognize(uri);
      const detectedText = result.blocks.map(block => block.text).join('\n');
      setExtractedText(detectedText || 'No text detected');
    } catch (error) {
      console.error('OCR Error:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={() => handleImageSelection(true)}
        style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Capture Business Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleImageSelection(false)}
        style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Choose from Library</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, marginTop: 20 }} />}

      <ScrollView style={{ marginTop: 20 }}>
        {extractedText ? <Text  style={{fontSize: 28, lineHeight:50}}>Extracted Text: {JSON.stringify(Utils.extractBusinessCardDetails(extractedText))}</Text> : <Text>No text extracted</Text>}
      </ScrollView>
    </View>
  );
};

export default BusinessCardScanner;
