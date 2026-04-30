import { createApp } from 'vue';
import ArcoVue, { Message, Notification } from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue';
import router from './router';
import './styles/app.css';

const app = createApp(App);
app.config.globalProperties.$message = Message;
app.config.globalProperties.$notification = Notification;

// 全局错误兜底，避免组件级异常吞掉提示
app.config.errorHandler = (err) => {
  // eslint-disable-next-line no-console
  console.error('[GlobalError]', err);
  Message.error('页面出现异常，请刷新或联系管理员');
};

app.use(router).use(ArcoVue).mount('#app');

