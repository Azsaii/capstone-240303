import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet } from 'react-native';
import PostCreate from './PostCreate';
import PostDetail from './PostDetail';
import BoardScreenUI from './BoardScreenUI';

const styles = StyleSheet.create({
  tabNavigator: {
    paddingTop: 10,
    backgroundColor: '#dfe9f5',
  },
  input: {
    marginBottom: 10,
  },
});

const QuestionBoard = ({ navigation }) => (
  <BoardScreenUI
    navigation={navigation}
    title="질문 게시판"
    boardName="questionBoard"
  />
);
const StudyTipBoard = ({ navigation }) => (
  <BoardScreenUI
    navigation={navigation}
    title="공부 팁 게시판"
    boardName="tipBoard"
  />
);
const ExamReviewBoard = ({ navigation }) => (
  <BoardScreenUI
    navigation={navigation}
    title="시험 후기 게시판"
    boardName="reviewBoard"
  />
);

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="QuestionBoard"
    screenOptions={{
      style: styles.tabNavigator,
    }}
  >
    <Tab.Screen name="질문 게시판" component={QuestionBoard} />
    <Tab.Screen name="공부 팁 게시판" component={StudyTipBoard} />
    <Tab.Screen name="시험 후기 게시판" component={ExamReviewBoard} />
  </Tab.Navigator>
);

const Stack = createStackNavigator();

const BoardScreen = () => (
  <Stack.Navigator initialRouteName="Tab">
    <Stack.Screen
      name="Tab"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PostCreate"
      component={PostCreate}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PostDetail"
      component={PostDetail}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default BoardScreen;
