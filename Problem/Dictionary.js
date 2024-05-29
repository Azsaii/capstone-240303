import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { List } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { DictionaryExplain } from './DictionaryExplain';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function DictionaryStack({ screen }) {
  const navigation = useNavigation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dictionary"
        component={DictionaryTab}
        options={{
          headerTitle: '용어사전',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <MaterialIcons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Explain"
        component={DictionaryExplain}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function DictionaryTab() {
  const [itemsCharacter, setItemsCharacter] = useState({});
  const [itemsArtifact, setItemsArtifact] = useState({});
  const [itemsIncident, setItemsIncident] = useState({});
  const [itemsConcept, setItemsConcept] = useState({});
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  useEffect(() => {
    if (isFocused) {
      const backAction = () => {
        navigation.navigate('한국사 에듀');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
  }, [isFocused]);
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
        name="유물"
        children={() => (
          <DictionaryScreen
            type="artifact"
            items={itemsArtifact}
            setItems={setItemsArtifact}
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
      <Tab.Screen
        name="개념"
        children={() => (
          <DictionaryScreen
            type="concept"
            items={itemsConcept}
            setItems={setItemsConcept}
          />
        )}
      />
    </Tab.Navigator>
  );
}

function DictionaryScreen({ type, items, setItems }) {
  // const [expanded, setExpanded] = React.useState(true);
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
  // const handlePress = () => setExpanded(!expanded);
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
        {Object.keys(items).length !== 0 ? (
          <List.Section>
            {eras.map(
              (era) =>
                items[era] && (
                  <List.Accordion
                    title={era}
                    left={(props) => (
                      <List.Icon {...props} icon="checkbox-intermediate" />
                    )}
                  >
                    {items[era].map((item, index) => (
                      <List.Item
                        key={index}
                        title={item.name}
                        onPress={() =>
                          navigation.navigate('Explain', {
                            eid: item.eid,
                            fromMap: false,
                          })
                        }
                      />
                    ))}
                  </List.Accordion>
                )
            )}
          </List.Section>
        ) : (
          <Spinner
            visible={true}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
        )}
      </ScrollView>
    </View>
  );
}

export default DictionaryStack;

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
});
