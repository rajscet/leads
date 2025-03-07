import {normalize, wp} from 'helpers/styles/responsive';
import {Utils} from 'helpers/utils';
import React from 'react';
import {ScrollView, StyleSheet, Text, View, Dimensions} from 'react-native';

const LeadTextDetail = ({data, record}) => {
  const [contacts, setContacts] = React.useState([]);
  const screenWidth = Dimensions.get('window').width;

  React.useEffect(() => {
    const lead = JSON.parse(record);
    if (lead && Array.isArray(lead?.other_contacts)) {
      setContacts(lead.other_contacts);
    }
  }, []);

  const renderKeyValue = (key, value, index) => {
    const isEven = index % 2 === 0;
    const rowStyle = [styles.row, isEven ? styles.evenRow : styles.oddRow];

    if (typeof value === 'object' && value !== null) {
      return (
        <View key={key} style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{key.replace(/-/g, ' ')}</Text>
          {Object.entries(value).map(([subKey, subValue], subIndex) => {
            const isSubEven = subIndex % 2 === 0;
            const subRowStyle = [
              styles.row,
              isSubEven ? styles.evenRow : styles.oddRow,
            ];
            return (
              <View key={subKey} style={subRowStyle}>
                <Text style={styles.label}>{subKey}</Text>
                <Text style={styles.text}>{subValue.toString()}</Text>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View key={key} style={rowStyle}>
        <Text style={styles.label}>{key.replace(/-/g, ' ')}</Text>
        <Text style={styles.text}>{value.toString()}</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {data &&
            Object.entries(data)
              .filter(
                ([_, value]) =>
                  value !== undefined && value !== null && value !== '',
              )
              .map(([key, value], index) => renderKeyValue(key, value, index))}

          {contacts && contacts.length > 0 ? (
            <View style={styles.contactContainer}>
              <Text style={[styles.sectionHeader, {textAlign: 'left'}]}>
                Contacts
              </Text>
              <View
                style={[
                  styles.gridContainer,
                  {
                    flexDirection:
                      screenWidth < 600 ? 'column' : 'row',
                    justifyContent:
                      screenWidth < 600 ? 'flex-start' : 'space-between',
                    paddingHorizontal: screenWidth < 600 ? 0 : wp(2), // Reduced horizontal padding
                  },
                ]}>
                {contacts.map((contact, index) => (
                  <View
                    key={index}
                    style={[
                      styles.item,
                      {
                        width: screenWidth < 600 ? '100%' : '48%',
                        marginRight: screenWidth < 600 ? 0 : index % 2 === 0 ? wp(1) : 0,
                        marginLeft: screenWidth < 600 ? 0 : index % 2 !== 0 ? wp(1) : 0,
                        marginBottom: screenWidth < 600 ? 10 : 10,
                      },
                    ]}>
                    {Object.entries(contact).map(([key, value]) => (
                      <View
                        key={key}
                        style={[
                          styles.row,
                          {paddingVertical: 5, paddingHorizontal: 8},
                        ]}>
                        <Text style={[styles.key, {fontSize: normalize(12)}]}>
                          {key.replace(/_/g, ' ')}:
                        </Text>
                        <Text style={[styles.value, {fontSize: normalize(12)}]}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    width: '100%',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  oddRow: {
    backgroundColor: '#f8f9fa',
  },
  evenRow: {
    backgroundColor: '#e9ecef',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    width: '45%',
    textAlign: 'left',
  },
  text: {
    fontSize: 16,
    width: '50%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: wp(16),
  },
  button: {
    flex: 0.3,
  },

  contactContainer: {
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    marginTop: wp(8),
  },
  gridContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  key: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  value: {
    fontSize: 12,
    color: '#666',
  },
});

export default LeadTextDetail;