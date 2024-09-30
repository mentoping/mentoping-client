<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Vue Router 사용
import axios from 'axios';
import { useUserStore } from '../store/userStore'; // Pinia store import

export default {
  name: 'MentoringLogin',
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const userStore = useUserStore();
    const router = useRouter(); // Vue Router 가져오기

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:8089/api/login', {
          email: email.value,
          password: password.value,
        });
        userStore.setUser(response.data); // 로그인 성공 시 사용자 정보를 Pinia 스토어에 저장
        errorMessage.value = '';
        console.log('Login successful:', response.data);
        
        // 채팅 화면으로 이동
        router.push('/chat');
      } catch (error) {
        errorMessage.value = 'Invalid email or password';
        console.error('Login failed:', error);
      }
    };

    return {
      email,
      password,
      errorMessage,
      login,
    };
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
}

.error {
  color: red;
}
</style>
