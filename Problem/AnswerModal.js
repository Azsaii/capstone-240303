import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';

export default function AnswerModal({ isOpen, onClose, problem, answer }) {
  return (
    <Modal
      isVisible={isOpen}
      onRequestClose={() => onClose()}
      onBackdropPress={() => onClose()}
      style={{ margin: 0 }}
    >
      <View style={styles.modalView}>
        <Text>{problem}</Text>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {answer === null ? (
            <Text>데이터 로드중</Text>
          ) : (
            <View>
              <Text>정답 : {answer.answer}번</Text>
              <Text
                style={{ borderBottomWidth: 1, borderBottomColor: 'black' }}
              >
                {'\n'}해설
              </Text>
              <Text>{answer.commentary}</Text>
              <Text
                style={{ borderBottomWidth: 1, borderBottomColor: 'black' }}
              >
                {'\n'}오답 해설
              </Text>
              <Text>{answer.wrongCommentary}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    marginTop: 150,
    margin: 30,
    marginBottom: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
