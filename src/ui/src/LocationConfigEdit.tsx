import { Input } from 'ant-design-vue';
import Button from 'ant-design-vue/lib/button';
import { defineComponent, PropType } from 'vue';

export interface LocationData {
  name: string
  location: string
  proxyPass: string
}

export default defineComponent({
  name: 'LocationConfigEdit',
  props: {
    onRemove: {
      type: Function
    },
    onDuplicate: {
      type: Function
    },
    modelValue: {
      type: Object as PropType<LocationData>
    }
  },
  data() {
    return {
      editData: {} as LocationData
    };
  },
  emits: {
    'update:modelValue': (payload: LocationData) => true,
    remove: (...args: any[]) => {},
    duplicate: (...args: any[]) => {}
  },
  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          this.editData = this.modelValue as LocationData;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    updateModel() {
      this.$emit('update:modelValue', this.editData);
    }
  },
  render() {
    return (
      <div class="grid grid-cols-12 gap-4 p-4 border-gray-100 border-b hover:bg-gray-100">
        <div class="grid col-span-11 grid-cols-2 gap-4">
          <Input placeholder="名称" v-model={[this.editData.name, 'value']} />
          <Input placeholder="location" v-model={[this.editData.location, 'value']} />
          <Input class="col-span-full" placeholder="proxy_pass" v-model={[this.editData.proxyPass, 'value']} />
        </div>
        <div class="col-span-1 flex flex-col justify-around items-end">
          <Button shape="circle" title="复制" onClick={() => this.$emit('duplicate')}>
            🐣
          </Button>
          <Button shape="circle" type="danger" title="删除" onClick={() => this.$emit('remove')}>
            😵
          </Button>
        </div>
      </div>
    );
  }
});
