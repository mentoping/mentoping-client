<template>
  <aside class="sidebar">
    <div class="profile">
      <img src="https://via.placeholder.com/100" alt="Profile Picture" />
      <h3>{{userName}}</h3>
    </div>
    <nav>
      <ul>
        <li>멘토 프로필</li>
        <li>멘티 프로필</li>
        <li>채팅</li>
        <li>Like</li>
        <li>알림함</li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from '../store/userStore'; // Import user store

export default {
  name: 'ChatSidebar',
  setup() {
    const userStore = useUserStore();

    // 사용자의 이름을 가져오는 계산된 속성
    const userName = computed(() => {
      return userStore.user ? userStore.user.name : 'Guest';
    });

    return {
      userName,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #f5f5f5;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile img {
  border-radius: 50%;
}
</style>
