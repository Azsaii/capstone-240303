import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { List } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { DictionaryExplain } from './DictionaryExplain';
const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function DictionaryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dictionary" component={DictionaryTab} />
      <Stack.Screen name="Explain" component={DictionaryExplain} />
    </Stack.Navigator>
  );
}

function DictionaryTab() {
  return (
    <Tab.Navigator initialRouteName="인물">
      <Tab.Screen
        name="인물"
        component={() => <DictionaryScreen type={'character'} />}
      />
      <Tab.Screen
        name="기관"
        component={() => <DictionaryScreen type={'agency'} />}
      />
    </Tab.Navigator>
  );
}

function DictionaryScreen({ type }) {
  const [expanded, setExpanded] = React.useState(true);
  const [itemsA, setItemsA] = useState([]);
  const [itemsB, setItemsB] = useState([]);
  const [itemsC, setItemsC] = useState([]);
  const navigation = useNavigation();
  const handlePress = () => setExpanded(!expanded);
  const fetchData = async (era, setItems) => {
    try {
      const querySnapshot = await getDocs(
        collection(firestore, 'dictionary', type, era)
      );
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
      console.log('Fetched items:', fetchedItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData('고려', setItemsA);
    fetchData('조선', setItemsB);
  }, []);

  return (
    <List.Section>
      <List.Accordion
        title="고려시대"
        left={(props) => <List.Icon {...props} icon="folder" />}
      >
        {itemsA.map((item, index) => (
          <List.Item
            key={index}
            title={item.id}
            onPress={() => navigation.navigate('Explain', { word: item })}
          />
        ))}
      </List.Accordion>
      <List.Accordion
        title="조선시대"
        left={(props) => <List.Icon {...props} icon="folder" />}
        onPress={handlePress}
      >
        {itemsB.map((item, index) => (
          <List.Item
            key={index}
            title={item.id}
            onPress={() => navigation.navigate('Explain', { word: item })}
          />
        ))}
      </List.Accordion>
    </List.Section>
  );
}

export default DictionaryStack;
