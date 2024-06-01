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
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Modal from 'react-native-modal';
import BasicProblem from './BasicProblem';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function WrongProblem({ userEmail }) {
  const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName="WrongProblemTab">
      <Stack.Screen
        name="다시풀기"
        component={WrongProblemTab}
        initialParams={{ userEmail: userEmail }}
        options={{
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
        name="BasicProblem"
        component={BasicProblem}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function WrongProblemTab({ route }) {
  const userEmail = route.params?.userEmail;
  return (
    <Tab.Navigator initialRouteName="오답문제">
      <Tab.Screen
        name="오답문제"
        children={() => (
          <RedoProblemScreen
            userEmail={userEmail}
            collectionName={'wrongProblems'}
          />
        )}
      />
      <Tab.Screen
        name="북마크"
        children={() => (
          <RedoProblemScreen
            userEmail={userEmail}
            collectionName={'bookMark'}
          />
        )}
      />
    </Tab.Navigator>
  );
}

function RedoProblemScreen({ userEmail, collectionName }) {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const isFocused = useIsFocused();
  const [isModalOpen, setModalOpen] = useState(false);
  const [clickedProblem, setClickedProblem] = useState(null);
  const openModal = (id) => {
    setClickedProblem(id);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(
        collection(firestore, 'users', userEmail, collectionName)
      );
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    };

    fetchData();
  }, [isFocused]);

  const handleDelete = async () => {
    closeModal();
    await deleteDoc(
      doc(firestore, 'users', userEmail, collectionName, clickedProblem)
    );
    setData(data.filter((i) => i.id !== clickedProblem));
  };

  const toggleDeleteButton = () => {
    setShowDeleteButton((prev) => !prev);
  };

  const renderItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('BasicProblem', { problemId: item.id, userEmail });
    };

    return (
      <View style={styles.cell}>
        {!showDeleteButton && (
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.name}>
              한국사 능력 검정 시험 {Math.floor(parseInt(item.id) / 100)}회{' '}
              {parseInt(item.id) % 100}번
            </Text>
          </TouchableOpacity>
        )}
        {showDeleteButton && (
          <TouchableOpacity
            onPress={() => openModal(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.name}>
              한국사 능력 검정 시험 {Math.floor(parseInt(item.id) / 100)}회{' '}
              {parseInt(item.id) % 100}번
            </Text>
            <Feather name="x-square" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={toggleDeleteButton}>
          <FontAwesome name="trash" size={36} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
      <ItemDeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        problemId={clickedProblem}
        handleDelete={handleDelete}
      />
    </View>
  );
}

function ItemDeleteModal({ isOpen, onClose, problemId, handleDelete }) {
  return (
    <Modal
      isVisible={isOpen}
      onRequestClose={() => onClose()}
      onBackdropPress={() => onClose()}
    >
      <View style={styles.deleteModalView}>
        <Text style={{ fontSize: 25 }}>
          <Text style={{ color: 'red' }}>{problemId}</Text>번 문제를
          삭제하시겠습니까?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={{ fontSize: 20, color: 'gray' }}>취소</Text>
          </TouchableOpacity>
          <Text>{'  '}</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={{ fontSize: 20, color: 'red' }}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#bbd2ec',
  },
  cell: {
    borderRadius: 10,
    borderColor: '#E1F7F5',
    borderWidth: 2,
    padding: 10,
    marginBottom: 10,
    color: 'white',
    backgroundColor: '#7E8EF1',
  },
  name: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteModalView: {
    flex: 1,
    marginTop: '70%',
    margin: '5%',
    marginBottom: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'gray',
    padding: '2%',
    marginRight: '2%',
  },
  deleteButton: {
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'red',
    padding: '2%',
  },
});

export default WrongProblem;
