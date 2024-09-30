<template>
  <div class="chat-room">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 채팅방 목록 -->
    <ChatRoomList @select-room="selectChatRoom" />

    <!-- 채팅창 -->
    <ChatWindow :roomId="selectedRoomId" :roomName="selectedRoomName" />
  </div>
</template>

<script>
import Sidebar from './ChatSidebar.vue';
import ChatRoomList from './ChatRoomList.vue';
import ChatWindow from './ChatWindow.vue';
import { ref } from 'vue';

export default {
  name: 'ChatRoom',
  components: {
    Sidebar,
    ChatRoomList,
    ChatWindow,
  },
  setup() {
    const selectedRoomId = ref(null);
    const selectedRoomName = ref('');

    // 채팅방 선택 시 호출되는 함수
    const selectChatRoom = (roomId) => {
      selectedRoomId.value = roomId;
      selectedRoomName.value = `채팅방 ${roomId}`; // 예시로 채팅방 이름 설정
    };

    return {
      selectedRoomId,
      selectedRoomName,
      selectChatRoom,
    };
  },
};
</script>

<style scoped>
.chat-room {
  display: flex;
  height: 100vh;
}
</style>
