import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setLoggedIn, setUserEmail, setUserName } from '../state';
import {
  Text,
  View,
  Alert,
  Platform,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerToggleButton,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

import Statistics from './statistics';
import Login from './login';
import CreateId from './createId';
import HomeScreen from './HomeScreen';

import BoardScreen from '../Board/BoardScreen';
import PracticeRoundSelect from '../Practice/PracticeRoundSelect';
import QuizGame from '../Game/QuizGame';

import TypeProblem from '../Problem/TypeProblem';
import KillerProblem from '../Problem/KillerProblem';
import WrongProblem from '../Problem/WrongProblem';
import DictionaryStack from '../Problem/Dictionary';

import HistoryTalesScreen from '../HistoryVideo/HistoryTalesScreen';
import LikedVideosScreen from '../HistoryVideo/LikedVideosScreen';
import MapScreen from '../Map/map';

import RecommendationQuestion from '../RecommendationPractice/RecommendationQuestion';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const handleRefresh = () => { };
const Drawer = createDrawerNavigator();

const CustomBackButton = ({ navigation }) => {
  const route = useRoute();
  const handlePress = () => {
    if (route.name === '회원가입') {
      navigation.navigate('로그인');
    } else if (route.name === '역사이야기') {
      navigation.navigate('HomeScreen');
      handleRefresh();
    } else {
      navigation.goBack();
    }
  };
  return (
    <TouchableOpacity style={{ marginLeft: 10 }} onPress={handlePress}>
      <MaterialIcons name="arrow-back" size={30} color="black" />
    </TouchableOpacity>
  );
};

const CustomDrawerContent = (props) => (
  <DrawerContentScrollView {...props}>
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
        한국사 에듀
      </Text>
    </View>
    <DrawerItemList {...props} />
  </DrawerContentScrollView>
);

export default function Sidebar({ navigation }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const userEmail = useSelector((state) => state.userEmail);
  const isWeb = useSelector((state) => state.isWeb);
  const navigationRef = useRef();

  const handleLogin = (email) => {
    dispatch(setUserEmail(email));
    dispatch(setLoggedIn(true));
  };

  useEffect(() => {
    if (isLoggedIn && navigationRef.current) {
      navigationRef.current.navigate('HomeScreen');
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '예',
          onPress: () => {
            dispatch(setUserEmail(''));
            dispatch(setLoggedIn(false));
            dispatch(setUserName(''));
            navigation.replace('Sidebar');
          },
        },
        {
          text: '아니요',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Drawer.Navigator
      drawerType={isWeb ? 'permanent' : 'front'}
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'center',
        drawerPosition: 'right',
        headerLeft: () => <CustomBackButton navigation={navigation} />,
        headerRight: () => <DrawerToggleButton />,
      })}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="한국사 에듀"
        component={HomeScreen}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="home" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                홈 화면
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="기출문제"
        component={PracticeRoundSelect}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons
              name="format-list-numbered"
              size={19}
              color="black"
            />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                기출문제
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="시대별 풀이"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="access-time-filled" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                시대별 풀이
              </Text>
            </View>
          ),
        }}
      >
        {() => (
          <TypeProblem
            param={'era'}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="유형별 풀이"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="account-balance" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                유형별 풀이
              </Text>
            </View>
          ),
        }}
      >
        {() => (
          <TypeProblem
            param={'type'}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="킬러문제"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="do-not-disturb-on" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                킬러문제
              </Text>
            </View>
          ),
        }}
      >
        {() => <KillerProblem isLoggedIn={isLoggedIn} userEmail={userEmail} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="추천문제"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="recommend" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                추천문제
              </Text>
            </View>
          ),
        }}
      >
        {(props) =>
          isLoggedIn ? (
            <RecommendationQuestion />
          ) : (
            <Login {...props} onLogin={handleLogin} />
          )
        }
      </Drawer.Screen>
      <Drawer.Screen
        name="다시풀기"
        options={{
          headerShown: false,
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="book" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                다시풀기
              </Text>
            </View>
          ),
        }}
      >
        {(props) =>
          isLoggedIn ? (
            <WrongProblem userEmail={userEmail} />
          ) : (
            <Login {...props} onLogin={handleLogin} />
          )
        }
      </Drawer.Screen>
      <Drawer.Screen
        name="통계"
        component={Statistics}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="auto-graph" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                오답통계
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="역사이야기"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="play-circle-filled" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                역사이야기
              </Text>
            </View>
          ),
        }}
      >
        {(props) => (
          <HistoryTalesScreen
            {...props}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="즐겨 찾는 영상"
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="star" size={24} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                즐겨찾는 영상
              </Text>
            </View>
          ),
        }}
      >
        {(props) => (
          <LikedVideosScreen
            {...props}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="게시판"
        component={BoardScreen}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="speaker-notes" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                게시판
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="게임"
        component={QuizGame}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="videogame-asset" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                게임
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="용어사전"
        component={DictionaryStack}
        options={{
          headerShown: false,
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="menu-book" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                용어사전
              </Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="사건지도"
        component={MapScreen}
        options={{
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons name="map" size={19} color="black" />
          ),
          drawerLabel: ({ focused, color }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -26,
              }}
            >
              <Text
                style={{
                  color: focused ? 'blue' : 'black',
                  fontSize: 16,
                  marginBottom: 3,
                }}
              >
                사건지도
              </Text>
            </View>
          ),
        }}
      />
      {!isLoggedIn && (
        <Drawer.Screen
          name="로그인"
          options={({ route }) => ({
            drawerLabel: () => {
              return <Text>로그인</Text>;
            },
          })}
        >
          {(props) => <Login {...props} onLogin={handleLogin} />}
        </Drawer.Screen>
      )}

      {isLoggedIn && (
        <Drawer.Screen
          name="로그아웃"
          options={({ route }) => ({
            drawerLabel: () => {
              return <Text onPress={handleLogout}>로그아웃</Text>;
            },
            headerShown: false,
          })}
        >
          {() => {
            return null;
          }}
        </Drawer.Screen>
      )}

      {!isLoggedIn && <Drawer.Screen name="회원가입" component={CreateId} />}
    </Drawer.Navigator>
  );
}
