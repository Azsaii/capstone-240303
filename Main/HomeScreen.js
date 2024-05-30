import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  Linking,
} from 'react-native'; // StyleSheet import 추가
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

const currentDate = new Date();
const testDate = new Date('2024-08-10');
const imageurl =
  'https://firebasestorage.googleapis.com/v0/b/capstone-ac206.appspot.com/o/%EB%B0%B0%EA%B2%BD.webp?alt=media&token=cabac6ad-77a8-4c88-9366-a33cd01c5bf6';

const timeDifference = testDate - currentDate;
const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

const LinkButtonPressed = () => {
  const examScheduleLink =
    'https://www.historyexam.go.kr/pageLink.do?link=examSchedule&netfunnel_key=E934081640D391F04FC56AC6C042B32037B017A93AECD22ED318655502C0D5E0FA9916BC7EEDE001B98B1F659245D8B5B481AF320FC49BDFDDA9E487CC5FA5E3C219884E7E69AE8FCA7EF380A6F8D3B91CF6BADBB12E604C00464C9F2FE9B694EE4301E896CCCBABBF1C7F32CA7A9D942C312C302C30';
  Linking.openURL(examScheduleLink).catch((err) =>
    console.error('링크를 여는 중 오류 발생:', err)
  );
};

const HomeScreen = ({ navigation }) => {
  const userName = useSelector((state) => state.userName);


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
        >
          <MaterialIcons name="home" size={30} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <>
      <View style={[styles.container]}>
        <View style={styles.imagecontainer}>
          <Image source={{ uri: imageurl }} style={styles.image} />
        </View>
        <View style={styles.titlecontainer}>
          <Text style={styles.title}>한국사 능력 검정 시험</Text>
          <Text style={{ fontSize: 15 }}>
            {userName.length !== 0 ? <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {userName}님,
            </Text>
              : <></>}
            환영합니다.
          </Text>
          <StatusBar style="auto" />
        </View>
        <View style={styles.horizontalLine}>
          <Text style={styles.gogo}>바로가기</Text>
        </View>
        <View style={styles.buttonttopContainer}>
          <TouchableOpacity
            style={styles.buttontop}
            onPress={() => navigation.navigate('기출문제')}
          >
            <Text style={styles.buttontopText}>기출문제 풀이</Text>
            <MaterialIcons
              name="format-list-numbered"
              size={30}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttontop}
            onPress={() => navigation.navigate('시대별 풀이')}
          >
            <Text style={styles.buttontopText}>시대별 풀이</Text>
            <MaterialIcons
              name="access-time-filled"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttontop}
            onPress={() => navigation.navigate('유형별 풀이')}
          >
            <Text style={styles.buttontopText}>유형별 풀이</Text>
            <MaterialIcons name="account-balance" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.boardContainer}>
          <TouchableOpacity
            style={styles.buttonboard}
            onPress={() => navigation.navigate('게시판')}
          >
            <Text style={styles.buttonboardText}>게시판 바로가기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.horizontalLine2}></View>

        <View style={styles.skyBlueBoxContainer}>
          <View style={styles.skyBlueBox}>
            <Text style={styles.dateText}>
              시험까지 {dayDifference}일 남았습니다.
            </Text>
            <Text style={styles.boxText}>
              시험일 : {testDate.getFullYear()}-{testDate.getMonth() + 1}-
              {testDate.getDate()}
            </Text>
            <TouchableOpacity
              style={styles.buttonLink}
              onPress={LinkButtonPressed}
            >
              <Text style={styles.buttonDateText}>시험 일정 확인하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    widht: '100%',
    height: '100%',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  imagecontainer: {
    width: '100%',
    height: '30%',
    position: 'absolute',
    flex: 1,
  },
  titlecontainer: {
    width: '100%',
    height: '35%',
    padding: 15,
  },
  boardContainer: {
    width: '100%',
    height: '13%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skyBlueBoxContainer: {
    widtt: '100%',
    height: '24%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  horizontalLine: {
    width: '100%',
    height: '5%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  horizontalLine2: {
    width: '100%',
    height: '1%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  gogo: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonttopContainer: {
    width: '100%',
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttontop: {
    width: '30%',
    height: '100%',
    backgroundColor: 'orange',
    borderRadius: 5,
    marginRight: 5,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLink: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    width: 300,
    height: 40,
    marginLeft: 22,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttontopText: {
    color: 'white',
    fontSize: 15,
    marginBottom: 20,
  },
  skyBlueBox: {
    backgroundColor: 'skyblue',
    width: 350,
    height: 140,
    borderRadius: 10,
  },
  boxText: {
    color: 'black',
    fontSize: 15,
    marginBottom: 10,
    marginTop: 6,
    marginLeft: 20,
  },
  dateText: {
    color: 'black',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 10,
    fontWeight: 'bold',
  },
  buttonDateText: {
    color: 'black',
    fontSize: 15,
  },
  buttonboard: {
    width: '95%',
    height: '57%',
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center', 
    borderRadius: 10,
  },
  buttonboardText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
