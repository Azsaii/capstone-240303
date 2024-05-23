import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform, TextInput } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

// JSON 파일 불러오기
const historicalSites = require('./Map.json');
const eraRanges = {
  preThreeKingdoms: { start: -9999, end: -18 },
  threeKingdoms: { start: -19, end: 697 },
  northSouthStates: { start: 698, end: 897 },
  laterThreeKingdoms: { start: 898, end: 935 },
  goryeo: { start: 936, end: 1391 },
  joseon: { start: 1392, end: 1896 },
  openingPeriod: { start: 1897, end: 1909 },
  japaneseOccupation: { start: 1910, end: 1945 },
  postLiberation: { start: 1945, end: 2024 },
};

export default function MapScreen() {
  const [year, setYear] = useState('1500');
  const [startYear, setStartYear] = useState('-9999');
  const [endYear, setEndYear] = useState('-18');
  const [isMarkerPressed, setIsMarkerPressed] = useState(false);
  const [markerEid, setMarkerEid] = useState(null);
  const navigation = useNavigation();
  const handleMarkerPress = (eid) => {
    setIsMarkerPressed(true);
    setMarkerEid(eid);
  };
  const handleMapPress = () => {
    setIsMarkerPressed(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.selectEraView}>
        <TextInput
          style={styles.input}
          onChangeText={setStartYear}
          value={startYear}
          placeholder="시작년도"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={setEndYear}
          value={endYear}
          placeholder="종료년도"
          keyboardType="numeric"
        />
        {Platform.OS === 'android' && (
          <Picker
            selectedValue={year}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) => {
              setYear(itemValue);
              setStartYear(eraRanges[itemValue].start.toString());
              setEndYear(eraRanges[itemValue].end.toString());
            }}
          >
            <Picker.Item label="전삼국 -9999~-18" value="preThreeKingdoms" />
            <Picker.Item label="삼국 -19~697" value="threeKingdoms" />
            <Picker.Item label="남북국 698~897" value="northSouthStates" />
            <Picker.Item label="후삼국 898~935" value="laterThreeKingdoms" />
            <Picker.Item label="고려 936~1391" value="goryeo" />
            <Picker.Item label="조선 1392~1896" value="joseon" />
            <Picker.Item label="개항기 1897~1909" value="openingPeriod" />
            <Picker.Item
              label="일제강점기 1910~1945"
              value="japaneseOccupation"
            />
            <Picker.Item label="해방이후 1945~2024" value="postLiberation" />
          </Picker>
        )}
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.5665,
          longitude: 127.978,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onPress={handleMapPress}
      >
        {historicalSites
          .filter((site) => {
            const era = parseInt(site.era);
            const start = parseInt(startYear);
            const end = parseInt(endYear);
            return era >= start && era <= end;
          })
          .map((site, index) => (
            <Marker
              key={site.key}
              coordinate={{
                latitude: site.latitude,
                longitude: site.longitude,
              }}
              title={site.title}
              description={site.description}
              onPress={() => handleMarkerPress(site.eid)}
            >
              <Callout style={styles.callout}>
                <Text style={styles.title}>{site.title}</Text>
                <Text>{site.description}</Text>
              </Callout>
            </Marker>
          ))}
      </MapView>
      {isMarkerPressed && (
        <View style={styles.dictionaryButtonContainer}>
          <Button
            title="용어사전 →"
            onPress={() =>
              navigation.navigate('용어사전', {
                screen: 'Explain',
                params: {
                  eid: markerEid,
                  fromMap: true,
                },
              })
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  callout: {
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold', // 글씨를 굵게
    fontSize: 20, // 글씨 크기는 20
  },
  map: {
    width: '100%',
    height: '86%',
  },
  title: {
    fontWeight: 'bold',
  },
  titleView: {
    width: '100%',
    height: '5%',
    alignItems: 'center', // 가로 방향으로 가운데 정렬
    marginTop: 10,
  },
  selectEraView: {
    flexDirection: 'row', // 가로 방향으로 요소들을 나열
    width: '100%',
    height: '12%',
    alignItems: 'center', // 요소들을 가로축에서 중앙 정렬
    justifyContent: 'space-around', // 요소들 사이에 고르게 공간을 배분
  },
  input: {
    flex: 1, // 가용 공간을 균등하게 차지
    height: '60%',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 5, // 양쪽 여백
  },
  picker: {
    flex: 1, // 가용 공간을 균등하게 차지
    height: '40%',
  },
  dictionaryButtonContainer: {
    position: 'absolute', // 위치를 절대적으로 설정
    width: '100%',
    bottom: 0, // 화면 하단에 위치
    zIndex: 1, // 다른 뷰들 위에 떠 있게 설정
  },
});
