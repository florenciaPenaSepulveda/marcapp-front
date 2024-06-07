import React, { useState } from 'react';
import { Box } from 'native-base';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Button, Header, Text, ListItem } from 'react-native-elements';
import searchWorkerService from '../services/searchWorker.service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import loading from './loading';

type SearchWorkerProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const SearchWorker: React.FC<SearchWorkerProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Adjust type as needed
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    try {
      const results = await searchWorkerService(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching workers:', error);
      // Handle error as needed
    }
  };

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Search worker',
          style: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <Text
        style={{
          fontSize: 20,
          justifyContent: 'flex-start',
          fontWeight: '600',
          marginVertical: '10%',
          paddingHorizontal: '0%',
          color: 'gray',
        }}
      >
        Type the worker's name you want to search
      </Text>

      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search employee"
          onChangeText={(text) => setSearchTerm(text)}
          value={searchTerm}
        />
        <Button title = "Search" onPress={handleSearch} loading = {loading} />
            <View
                style={{
                flexDirection: 'column',
                alignContent: 'center',
                justifyContent: 'center',
                top: '30%',
                }}
            ></View>
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ListItem onPress={() => console.log('Seleccionaste:', item)}>
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
        />
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: '0%',
    paddingVertical: '0%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 100,
    borderRadius: 5,
    
  },
  button: {
    backgroundColor: '#0AA5F2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchWorker;
