import React, { useState, useEffect } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import BasicProblem from './BasicProblem';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
//const app = initializeApp(firebaseConfig);
//const db = getFirestore(app);

function WrongProblem({ userEmail }) {
  return (
    <Stack.Navigator
      initialRouteName="WrongProblemTab"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={userEmail}
        component={WrongProblemTab}
        initialParams={{ userEmail: userEmail }}
      />
      <Stack.Screen name="BasicProblem" component={BasicProblem} />
    </Stack.Navigator>
  );
}

function WrongProblemTab({ route }) {
  const userEmail = route.params?.userEmail;
  return (
    <Tab.Navigator initialRouteName="오답문제">
      <Tab.Screen
        name="오답문제"
        component={() => <WrongProblemScreen userEmail={userEmail} />}
      />
      <Tab.Screen
        name="북마크"
        component={() => <BookMarkScreen userEmail={userEmail} />}
      />
    </Tab.Navigator>
  );
}

function WrongProblemScreen({ userEmail }) {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, 'WrongProblem')
      );
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('BasicProblem', { problemId: item.id });
    };

    return (
      <View style={styles.cell}>
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.name}>{item.id}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
}

function BookMarkScreen({ userEmail }) {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, 'bookMark')
      );
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('BasicProblem', { problemId: item.id });
    };

    return (
      <View style={styles.cell}>
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.name}>{item.id}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: 'orange',
  },
  cell: {
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
    padding: 10,
    marginBottom: 10,
    color: 'white',
    backgroundColor: 'orange',
  },
  name: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default WrongProblem;
