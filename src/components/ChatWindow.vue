<template>
  <div class="chat-container">
    <h3>{{ roomName }}</h3>
    <div class="chat-messages"  ref="chatMessages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="{'my-message': msg.senderId === userId, 'other-message': msg.senderId !== userId}"
      >
        <!-- 프로필과 사용자 이름, 전송 시간 표시 -->
        <div class="message-header" >
          <img src="https://via.placeholder.com/40" alt="Profile Picture" class="profile-pic"/>
          <span class="username">{{ msg.senderName }}</span>
          <span class="timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
        </div>
        <!-- 메시지 내용 -->
        <div class="message-content">{{ msg.content }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="messageContent" placeholder="메시지 입력..." @keyup.enter="sendMessage" />
      <input type="file" @change="onFileChange" /> <!-- 파일 업로드 입력 -->
      <button @click="sendMessage">전송</button>
    </div>
  </div>
</template>



<script>
import { ref, watch, nextTick } from 'vue';
import { useUserStore } from '../store/userStore'; // Pinia의 userStore 가져오기
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'ChatWindow',
  props: ['roomId', 'roomName'],
  setup(props) {
    const messages = ref([]);
    const messageContent = ref('');
    const chatMessages = ref(null); // 스크롤을 제어하기 위한 ref
    const selectedFile = ref(null); // 업로드할 파일을 저장할 변수

    // Firebase Storage 초기화
    const storage = getStorage();

    // Pinia의 userStore에서 사용자 정보 가져오기
    const userStore = useUserStore();
    
    // 사용자 정보 감시
    const userId = ref(null);
    const userName = ref(null);

    watch(
      () => userStore.user,
      (newUser) => {
        if (newUser) {
          userId.value = newUser.id;
          userName.value = newUser.name;
        }
      },
      { immediate: true } // 컴포넌트가 마운트될 때 즉시 실행
    );

    // 파일 선택 이벤트 핸들러
    const onFileChange = (event) => {
      if (event.target.files.length > 0) {
        selectedFile.value = event.target.files[0];
      }
    };

    // 파일을 Firebase Storage에 업로드하는 함수
    const uploadFile = async () => {
      if (!selectedFile.value) return null;

      const fileRef = storageRef(storage, `uploads/${selectedFile.value.name}`);
      try {
        const snapshot = await uploadBytes(fileRef, selectedFile.value);
        const downloadURL = await getDownloadURL(snapshot.ref);
        selectedFile.value = null; // 파일 업로드 후 초기화
        return downloadURL;
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    };

    // 스크롤을 맨 아래로 이동시키는 함수
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatMessages.value) {
          chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
        }
      });
    };

    // 채팅방의 메시지 가져오기
    watch(
      () => props.roomId,
      (newRoomId) => {
        console.log('Room ID:', newRoomId); // 디버깅을 위한 로그 추가

        if (!newRoomId) return;
        const messagesCollection = collection(db, 'rooms', newRoomId, 'messages');
        const q = query(messagesCollection, orderBy('timestamp'));

        onSnapshot(q, (querySnapshot) => {
          messages.value = [];
          querySnapshot.forEach((doc) => {
            messages.value.push(doc.data());
          });
          scrollToBottom(); // 메시지가 변경될 때마다 스크롤을 맨 아래로 이동
        });
      },
      { immediate: true } // 컴포넌트가 마운트될 때 즉시 실행
    );


     // lastMessage의 문자열이 20자 이상일 경우 잘라서 표시하는 함수
     const truncateMessage = (message) => {
    return message.length > 20 ? message.substring(0, 20) + '...' : message;
    };

    // // 메시지 전송
    // const sendMessage = async () => {
    //   console.log('Sending message:', userId, userName); // 디버깅을 위한 로그 추가
    //   console.log('Sending message.valuevalue:::', userId.value, userName.value); // 디버깅을 위한 로그 추가

    //   if (messageContent.value.trim() !== '' && props.roomId) {
    //     const message = {
    //       senderId: userId.value,
    //       senderName: userName.value,
    //       content: messageContent.value,
    //       timestamp: Date.now(),
    //     };
    //     try {
    //       // 메시지를 Firestore에 추가
    //       await addDoc(collection(db, 'rooms', props.roomId, 'messages'), message);

    //       // 채팅방의 lastMessage 필드 업데이트
    //       const roomRef = doc(db, 'rooms', props.roomId);
    //       await updateDoc(roomRef, {
    //         lastMessage: truncateMessage(message.content), // 메시지를 자르는 함수 적용
    //       });

    //       messageContent.value = '';
    //       scrollToBottom(); // 메시지가 전송되면 스크롤을 맨 아래로 이동

    //     } catch (error) {
    //       console.error('Error sending message:', error);
    //     }
    //   }
    // };

    const sendMessage = async () => {
      console.log('Sending message:', userId.value, userName.value); // 디버깅을 위한 로그 추가

      if (messageContent.value.trim() === '' && !selectedFile.value) return;

      const message = {
        senderId: userId.value,
        senderName: userName.value,
        content: messageContent.value,
        timestamp: Date.now(),
      };

      // 파일이 선택되어 있다면 업로드하고 URL을 메시지에 포함
      if (selectedFile.value) {
        const fileURL = await uploadFile();
        if (fileURL) {
          message.fileURL = fileURL;
        }
      }

      try {
        // 메시지를 Firestore에 추가
        await addDoc(collection(db, 'rooms', props.roomId, 'messages'), message);

        // 채팅방의 lastMessage 필드 업데이트
        const roomRef = doc(db, 'rooms', props.roomId);
        await updateDoc(roomRef, {

          lastMessage: truncateMessage(message.content) || '파일이 업로드되었습니다.', // 업로드된 파일을 표시하는 메시지
        });

        messageContent.value = '';
        scrollToBottom(); // 메시지가 전송되면 스크롤을 맨 아래로 이동

      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    // 타임스탬프를 포맷팅하는 함수
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      messages,
      messageContent,
      sendMessage,
      userId,
      formatTimestamp,
      scrollToBottom,
      chatMessages,
      truncateMessage,
      onFileChange, // 파일 변경 이벤트 핸들러
    };
  },
};
</script>
    


<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column; /* 수직으로 메시지들을 배치 */
}

/* 메시지 박스 스타일 */
.my-message,
.other-message {
  display: block; /* 각 메시지를 한 줄씩 차지하게 만듦 */
  max-width: 60%; /* 메시지 박스의 최대 너비 설정 */
  padding: 10px;
  border-radius: 15px;
  margin: 10px 0; /* 각 메시지 간의 간격 */
}

/* 본인 메시지 (오른쪽 정렬) */
.my-message {
  background-color: #4caf50;
  align-self: flex-end; /* 오른쪽 정렬 */
  color: white;
  text-align: right; /* 텍스트 오른쪽 정렬 */
}

/* 상대방 메시지 (왼쪽 정렬) */
.other-message {
  background-color: #e0e0e0;
  align-self: flex-start; /* 왼쪽 정렬 */
  color: black;
  text-align: left; /* 텍스트 왼쪽 정렬 */
}

/* 사용자 이름과 프로필 이미지 */
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.timestamp {
  font-size: 12px;
  color: gray;
}

/* 메시지 내용 */
.message-content {
  word-break: break-word;
}

/* 채팅 입력 */
.chat-input {
  display: flex;
  margin-top: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
}

.chat-input button {
  padding: 10px;
}
</style>
