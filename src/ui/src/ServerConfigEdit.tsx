import { Input, message } from 'ant-design-vue';
import Button from 'ant-design-vue/lib/button';
import { defineComponent, PropType, withModifiers } from 'vue';
import LocationConfigEdit, { LocationData } from './LocationConfigEdit';
import { ServerData } from './ServerListItem';

export const genLocationConfig = (): LocationData => ({
  name: '',
  location: '',
  proxyPass: ''
});

export default defineComponent({
  name: 'ServerConfigEdit',
  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.editData = JSON.parse(JSON.stringify(val));
        }
      },
      immediate: true,
      deep: true
    }
  },
  emits: {
    'update:modelValue': (payload: ServerData) => true,
    save: (...args: any[]) => {}
  },
  props: {
    modelValue: {
      type: Object as PropType<ServerData>
    },
    onSave: {
      type: Function
    }
  },
  data() {
    return {
      editData: {} as ServerData
    };
  },
  methods: {
    createNewLocationConfig() {
      this.editData.locations?.splice(0, 0, genLocationConfig());
    },
    saveServerConfig() {
      const tmpCount: {
        [key: string]: number
      } = {};
      const errLocations = new Set<string>();
      this.editData.locations.forEach((loc) => {
        const k = `${loc.location}`;
        if (tmpCount[k]) {
          tmpCount[k] += 1;
          errLocations.add(k);
        } else {
          tmpCount[k] = 1;
        }
      });
      if (errLocations.size > 0) {
        const msgs: string[] = [];
        errLocations.forEach((k) => {
          msgs.push(`[${k}]${tmpCount[k]}`);
        });
        message.warning(`重复的location: ${msgs.join(';')}`);
      } else {
        this.$emit('update:modelValue', this.editData);
        this.$emit('save');
      }
    }
  },
  render() {
    return (
      <div class="relative h-screen flex flex-col justify-start">
        <div class="w-full">
          <div class="border-b border-gray-100 pb-3 mb-3 px-4 flex justify-end">
            <Button class="mr-1.5" type="primary" onClick={this.saveServerConfig}>保存</Button>
            <Button onClick={ withModifiers(this.createNewLocationConfig, ['stop', 'prevent'])}>新增</Button>
          </div>
          <div class="border-b border-gray-100 pb-3 mb-3 px-4">
            <div class="grid grid-cols-3 gap-3">
              <Input placeholder="配置名称" v-model={[this.editData.name, 'value']} />
              <Input placeholder="server_name" v-model={[this.editData.serverName, 'value']} />
              <Input placeholder="listen" v-model={[this.editData.listen, 'value']} />
            </div>
          </div>
        </div>
        <div class="overflow-y-scroll">
          {
            this.editData.locations?.map((location: LocationData, idx: number) => (
              <LocationConfigEdit
                onRemove={() => {
                  this.editData.locations.splice(idx, 1);
                }}
                onDuplicate={() => {
                  this.editData.locations.splice(idx, 0, JSON.parse(JSON.stringify(location)));
                }}
                key={idx} v-model={[location, 'modelValue']} />
            ))
          }
        </div>
        <div>
        </div>
      </div>
    );
  }
});
