import { createApp } from 'vue';

import Antd from 'ant-design-vue';
import './style/index.css';
import 'ant-design-vue/dist/antd.css';
import ProxyConfig from './index'

createApp(ProxyConfig).use(Antd)
  .mount('#app');

