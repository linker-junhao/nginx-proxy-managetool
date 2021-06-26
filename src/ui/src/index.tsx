import { defineComponent, withModifiers } from 'vue';
import axios from 'axios';
import { Button, Checkbox, message } from 'ant-design-vue';
import ServerListItem, { ServerData } from './ServerListItem';
import ServerConfigEdit from './ServerConfigEdit';

axios.defaults.baseURL = 'http://localhost:9000/api';
export const genServerConfig = () => ({
  name: '未命名server配置',
  serverName: 'dev.example.com',
  listen: '80',
  locations: []
});


export default defineComponent({
  name: 'ProxyConfig',
  mounted() {
    axios.get('/base-config').then((res) => {
      this.serverConfigList = res.data as ServerData[];
    });
  },
  data(): {
    serverConfigList: ServerData[]
    activeIdx: number
    selectedServers: number[]
    } {
    return {
      serverConfigList: [],
      activeIdx: -1,
      selectedServers: []
    };
  },
  methods: {
    detectDumplicateApply(selected: ServerData[]): boolean {
      const tmpCount: {
        [key: string]: number
      } = {};
      const errs = new Set<string>();
      selected.forEach((server) => {
        const k = `${server.serverName}:${server.listen}`;
        if (tmpCount[k]) {
          tmpCount[k] += 1;
          errs.add(k);
        } else {
          tmpCount[k] = 1;
        }
      });
      if (errs.size > 0) {
        const msgs: string[] = [];
        errs.forEach((k) => {
          msgs.push(`[${k}]-${tmpCount[k]}`);
        });
        message.warning(`重复的server: ${msgs.join(';')}`);
        return false;
      }
      return true;
    },
    applyServers() {
      const selected = this.selectedServers
        .map((idx) => this.serverConfigList[idx])
        .filter((item) => item !== undefined);
      if (selected.length) {
        if (this.detectDumplicateApply(selected)) {
          axios.post('/use-config', selected).then((res) => {
            console.log(res.data);
            message.error('操作成功');
          }).catch(err => {
            message.error(err);
          });
        }
      } else {
        message.warning('没有server被选择');
      }
    },
    saveServesConfig() {
      console.log(this.serverConfigList);
      axios.post('/base-config', this.serverConfigList).then((res) => {
        console.log(res);
        message.success('操作成功');
      }).catch(err => {
        message.error(err);
      });
    },
    switchConfig(idx) {
      this.activeIdx = -1
      this.$nextTick(_ => {
        this.activeIdx = idx
      })
    }
  },
  render() {
    return (<div class="grid grid-cols-7 gap-4 w-11/12 m-auto py-4">
      <div class="col-span-2">
        <div class="mb-4 flex justify-between items-center">
          <span class="text-gray-600">
            Servers
          </span>
          <div>
            <Button class="mr-1.5" onClick={() => { this.serverConfigList.splice(0, 0, genServerConfig()) }} size="small">
            新增
            </Button>
            <Button onClick={this.applyServers} size="small" type="primary">
            应用
            </Button>
          </div>

        </div>
        <div>
          <Checkbox.Group class="w-full" v-model={[this.selectedServers, 'value']}>
            {
              this.serverConfigList.map((server, idx) => (
                <div key={idx} onClick={() => this.switchConfig(idx)}
                  class="relative pl-6 flex justify-between items-center px-2 py-2 bg-white border-b border-gray-300 cursor-pointer hover:bg-gray-100">
                  <Checkbox value={idx} class="absolute left-1"/>
                  <ServerListItem itemData={server} />
                  <Button type="danger" size="small" shape="circle" onClick={withModifiers(() => {
                    this.serverConfigList.splice(idx, 1)
                    this.saveServesConfig()
                  }, ['stop'])}>😵</Button>
                </div>
              ))
            }
          </Checkbox.Group>
        </div>
      </div>
      <div class="col-span-5">
        {
          this.serverConfigList.length && this.activeIdx >= 0
            ? (<ServerConfigEdit v-model={this.serverConfigList[this.activeIdx]}
              onSave={this.saveServesConfig} />) : (
              <div class="text-gray-300">
              先选中一个server以进行编辑
              </div>
            )
        }
      </div>
    </div>);
  }
});
