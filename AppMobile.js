import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 메인 화면
import Sidebar from './Main/Sidebar';
import SideScreen from './Main/side';
import Statistics from './Main/statistics';
import Planner from './Main/planner';
import Login from './Main/login';
import CreateId from './Main/createId';
import HomeScreen from './Main/HomeScreen';

// 게시판
import BoardScreen from './Board/BoardScreen';

// 기출 문제
import PracticeRoundSelect from './Practice/PracticeRoundSelect';
import ProblemDetail from './Practice/ProblemDetail';
import PracticeResult from './Practice/PracticeResult';
import ProblemCommentary from './Practice/ProblemCommentary';

// 퀴즈 게임
import QuizGame from './Game/QuizGame';
import UnsolvedScreen from './Game/UnsolvedScreen';

// 네비게이터
const Stack = createStackNavigator();
const screens = [
  {
    name: 'Sidebar',
    component: Sidebar,
    options: { headerShown: false },
  },
  {
    name: 'SideScreen',
    component: SideScreen,
    options: { headerShown: false },
  },
  {
    name: 'Statistics',
    component: Statistics,
    options: { headerShown: false },
  },
  { name: 'Planner', component: Planner, options: { headerShown: false } },
  { name: 'Login', component: Login },
  { name: 'CreateId', component: CreateId, options: { headerShown: false } },
  {
    name: 'HomeScreen',
    component: HomeScreen,
  },
  {
    name: 'BoardScreen',
    component: BoardScreen,
    options: { headerShown: false },
  },
  {
    name: 'PracticeRoundSelect',
    component: PracticeRoundSelect,
    options: { headerShown: false },
  },
  {
    name: 'ProblemDetail',
    component: ProblemDetail,
    options: { headerShown: false },
  },
  {
    name: 'PracticeResult',
    component: PracticeResult,
    options: { headerShown: false },
  },
  {
    name: 'ProblemCommentary',
    component: ProblemCommentary,
    options: { headerShown: false },
  },
  { name: 'QuizGame', component: QuizGame, options: { headerShown: false } },
  {
    name: 'UnsolvedScreen',
    component: UnsolvedScreen,
    options: { headerShown: false },
  },
];

const AppMobile = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Sidebar">
        {screens.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppMobile;
