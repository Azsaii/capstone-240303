import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Picker } from '@react-native-picker/picker';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { Button } from 'react-native-paper';

const HistoryTalesScreen = ({ navigation, isLoggedIn, userEmail }) => {
    const [videos, setVideos] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('고조선');
    const [selectedTypeKeywords, setSelectedTypeKeywords] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태를 관리할 새로운 상태 변수


    const flatListRef = useRef();

    const addFavorite = async (video) => {

        if (!isLoggedIn) {
            Alert.alert(
                '경고!',
                '해당 영상을 즐겨 찾기에 추가하실려면 로그인을 해주세요',
                [
                    {
                        text: '예',

                        onPress: () => navigation.navigate('로그인'),
                    }
                ]
            );
            return;

        }

        try {
            const userSnapshot = await getDoc(doc(firestore, "users", userEmail));
            if (userSnapshot.exists()) {
                addDoc(collection(firestore, "users", userEmail, "LikedVideos"), {
                    videoId: video.videoId,
                })
                    .then((docRef) => {
                        console.log("Document written with ID: ", docRef.id);
                        Alert.alert(
                            '성공!',
                            '해당 영상이 즐겨찾기에 추가 되었습니다!'
                        );
                    })
                    .catch((e) => {
                        console.error("Error adding document: ", e);
                    });
            } else {
                console.error("User not found");
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    };

    const fetchVideos = async () => {

        setIsLoading(true); //로딩 시작

        let filteredDocs = [];

        try {
            const snapshot = await getDocs(collection(firestore, 'Videos'));
            snapshot.forEach((doc) => {
                let data = doc.data();
                let categories = data.category;

                for (let i = 0; i < categories.length; i++) {

                    if (selectedTypeKeywords.includes(categories[i]) || selectedKeyword === categories[i]) {

                        filteredDocs.push(data);
                        break;
                    }
                }
            });
            
            setVideos(filteredDocs);

        } catch (error) {
            console.error("Error getting documents: ", error);
        } finally {
            setIsLoading(false); //로딩 종료
        }

    }


    useEffect(() => {
        fetchVideos();
    }, [selectedKeyword, selectedTypeKeywords]);

    return (
        <View style={styles.container}>
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 20 }}><AntDesign name="clockcircleo" size={25} color="black" /> 시대 별</Text>
                <Picker
                    selectedValue={selectedKeyword}
                    mode='dropdown'
                    onValueChange={(itemValue) => {
                        setSelectedKeyword(itemValue);
                    }}

                    style={{ marginBottom: 10 }}

                >
                    <Picker.Item label="고조선" value="고조선" />
                    <Picker.Item label="삼국" value="삼국" />
                    <Picker.Item label="남북국 시대" value="남북국" />
                    <Picker.Item label="후삼국" value="후삼국" />
                    <Picker.Item label="고려" value="고려" />
                    <Picker.Item label="조선" value="조선" />
                    <Picker.Item label="개항기" value="개항기" />
                    <Picker.Item label="일제강점기" value="일제강점기" />
                    <Picker.Item label="해방 이후" value="해방 이후" />
                </Picker>

                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}><Feather name="list" size={25} color="black" /> 유형 별</Text>

                <MultipleSelectList
                    data={[
                        { key: '1', value: '문화' },
                        { key: '2', value: '유물' },
                        { key: '3', value: '사건' },
                        { key: '4', value: '인물' },
                        { key: '5', value: '장소' },
                        { key: '6', value: '그림' },
                        { key: '7', value: '제도' },
                        { key: '8', value: '기구' },
                        { key: '9', value: '조약' },
                        { key: '10', value: '단체' },
                    ]}
                    setSelected={(val) => setSelectedTypeKeywords(val)}
                    save="value"
                />

            </View>


            <FlatList
                    ref={flatListRef}
                    data={videos}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
                    contentContainerStyle={{ padding: 10 }}
                    renderItem={({ item }) => (
                        <View style={{marginBottom: 30}}>
                            <YoutubePlayer
                                height={200}
                                videoId={item.videoId}
                            />
                            <TouchableOpacity onPress={() => addFavorite(item)}>
                                <Button icon="star" mode="elevated" buttonColor='yellow' textColor='black'>즐겨찾기</Button>
                            </TouchableOpacity>
                        </View>
                        )
                    }
                />
        </View>
    );
};


const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },


    container: {
        backgroundColor: 'white',
        padding: 15,
        flex: 1,
        flexDirection: 'column'
    }
});

export default HistoryTalesScreen;