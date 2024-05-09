import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { List } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { DictionaryExplain } from './DictionaryExplain';
import { ScrollView } from 'react-native-gesture-handler';
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
  const [itemsCharacter, setItemsCharacter] = useState({});
  const [itemsAgency, setItemsAgency] = useState({});
  const [itemsIncident, setItemsIncident] = useState({});

  return (
    <Tab.Navigator initialRouteName="인물">
      <Tab.Screen
        name="인물"
        children={() => (
          <DictionaryScreen
            type="character"
            items={itemsCharacter}
            setItems={setItemsCharacter}
          />
        )}
      />
      <Tab.Screen
        name="단체"
        children={() => (
          <DictionaryScreen
            type="agency"
            items={itemsAgency}
            setItems={setItemsAgency}
          />
        )}
      />
      <Tab.Screen
        name="사건"
        children={() => (
          <DictionaryScreen
            type="incident"
            items={itemsIncident}
            setItems={setItemsIncident}
          />
        )}
      />
    </Tab.Navigator>
  );
}

function DictionaryScreen({ type, items, setItems }) {
  const [expanded, setExpanded] = React.useState(true);
  const eras = [
    '전삼국',
    '삼국',
    '남북국',
    '후삼국',
    '고려',
    '조선',
    '개항기',
    '일제강점기',
    '해방이후',
  ]; // 예시 시대 목록
  const navigation = useNavigation();
  const handlePress = () => setExpanded(!expanded);
  const fetchData = async () => {
    try {
      const newItems = {};
      for (const era of eras) {
        const querySnapshot = await getDocs(
          collection(firestore, 'dictionary', type, era)
        );
        const fetchedItems = querySnapshot.docs.map((doc) => ({
          name: doc.id,
          ...doc.data(),
        }));
        newItems[era] = fetchedItems;
      }
      console.log('aaa');
      setItems(newItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View>
      <ScrollView>
        <List.Section>
          {eras.map(
            (era) =>
              items[era] && (
                <List.Accordion
                  title={era}
                  left={(props) => <List.Icon {...props} icon="folder" />}
                >
                  {items[era].map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.name}
                      onPress={() =>
                        navigation.navigate('Explain', {
                          word: item,
                          eid: item.eid,
                        })
                      }
                    />
                  ))}
                </List.Accordion>
              )
          )}
        </List.Section>
      </ScrollView>
    </View>
  );
}

export default DictionaryStack;
