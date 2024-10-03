<template>
  <div class="chat-container">
    <h3>{{ roomName }}</h3>
    <div class="chat-messages" ref="chatMessages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="{'my-message': msg.senderId === userId, 'other-message': msg.senderId !== userId}"
      >
        <!-- 프로필과 사용자 이름, 전송 시간 표시 -->
        <div class="message-header">
          <img src="https://via.placeholder.com/40" alt="Profile Picture" class="profile-pic"/>
          <span class="username">{{ msg.senderName }}</span>
          <span class="timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
        </div>
        <!-- 메시지 내용 -->
        <div class="message-content">
          <!-- 파일 URL이 있을 경우 파일 링크를 보여줌 -->
          <template v-if="msg.fileURL && isImageFile(msg.fileURL)">
            
            <img :src="msg.fileURL" :key="msg.fileURL" alt="Uploaded Image" class="uploaded-image" />
            console.log(`Image URL in chat: ${msg.fileURL}`);
          </template>
          <!-- 이미지가 아닌 파일은 다운로드 링크로 표시 -->
          <template v-else-if="msg.fileURL">
            <a :href="msg.fileURL" target="_blank">📎 파일 다운로드</a>
          </template>
          <!-- 파일이 없을 경우 일반 텍스트 메시지 보여줌 -->
          <template v-else>
            {{ msg.content }}
          </template>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="messageContent" placeholder="메시지 입력..." @keyup.enter="sendMessage" />
      <input type="file" @change="onFileChange" ref="fileInput" /> <!-- 파일 업로드 입력 -->
      <button @click="sendMessage">전송</button>
    </div>
    <!-- 이미지 미리보기 영역 -->
    <div v-if="previewImage" class="image-preview">
      <h4>Image Preview:</h4>
      <img :src="previewImage" alt="Preview Image" class="uploaded-image" />
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
    const previewImage = ref(null); // 이미지 미리보기용 변수

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
        const reader = new FileReader();
        
        reader.onload = () => {
          previewImage.value = reader.result; // 파일을 미리보기용 데이터 URL로 변환
          console.log('Preview Image URL:', previewImage.value); // 미리보기 이미지 URL 확인
        };
        
        reader.readAsDataURL(selectedFile.value);
        console.log('Selected file:', selectedFile.value); // 선택된 파일 확인
      }
    };

    // 파일을 Firebase Storage에 업로드하는 함수
    const uploadFile = async () => {
      if (!selectedFile.value) return null;

      const fileRef = storageRef(storage, `uploads/${selectedFile.value.name}`);
      try {
        const snapshot = await uploadBytes(fileRef, selectedFile.value);
        const downloadURL = await getDownloadURL(snapshot.ref);
        selectedFile.value = null; // 파일 업로드 후 선택 파일 초기화
        console.log('Uploaded file URL:', downloadURL); // 업로드된 파일 URL 확인
        return downloadURL;
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    };

    // 이미지 파일 여부 확인 함수 
    const isImageFile = (url) => {
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);
      console.log('Checking if the URL is an image:', url); // URL이 이미지인지 확인
      return isImage;
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
        if (!newRoomId) return;
        const messagesCollection = collection(db, 'rooms', newRoomId, 'messages');
        const q = query(messagesCollection, orderBy('timestamp'));

        onSnapshot(q, (querySnapshot) => {
          messages.value = [];
          querySnapshot.forEach((doc) => {
            messages.value.push(doc.data());
          });
          console.log('Messages:', messages.value); // 가져온 메시지 목록 확인
          scrollToBottom(); // 메시지가 변경될 때마다 스크롤을 맨 아래로 이동
        });
      },
      { immediate: true } // 컴포넌트가 마운트될 때 즉시 실행
    );

    // 메시지 전송
    const sendMessage = async () => {
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
          lastMessage: message.content || '파일이 업로드되었습니다.', // 업로드된 파일을 표시하는 메시지
          lastMessageTimestamp: message.timestamp, // 마지막 메시지의 타임스탬프 추가

        });

        // 전송 후 초기화
        messageContent.value = '';
        previewImage.value = null; // 미리보기 초기화
        selectedFile.value = null; // 파일 선택 초기화
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
      onFileChange, // 파일 변경 이벤트 핸들러
      isImageFile,  // 이미지 파일 여부 확인
      previewImage, // 미리보기 이미지 데이터
    };
  },
};
</script>

<style scoped>
/* 스타일 설정 */
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
  flex-direction: column;
}

/* 메시지 스타일 */
.my-message,
.other-message {
  display: block;
  max-width: 60%;
  padding: 10px;
  border-radius: 15px;
  margin: 10px 0;
}

.my-message {
  background-color: #4caf50;
  align-self: flex-end;
  color: white;
  text-align: left;
}

.other-message {
  background-color: #e0e0e0;
  align-self: flex-start;
  color: black;
  text-align: left;
}

/* 프로필 이미지와 사용자 정보 */
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

.message-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
}

.timestamp {
  font-size: 12px;
  color: gray;
  text-align: right;
  margin-top: 5px;
}

/* 메시지 내용 */
.message-content {
  word-break: break-word;
  margin-top: 10px;
}

.message-text {
  font-size: 18px; /* 메시지 내용의 글자 크기를 크게 설정 */
}

/* 이미지 미리보기 */
.uploaded-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 10px;
}

/* 이미지 미리보기 컨테이너 */
.image-preview {
  margin-top: 10px;
}

</style>