import { defineComponent, PropType } from 'vue';
import { LocationData } from './LocationConfigEdit';

export interface ServerData {
  name: string
  serverName: string
  listen: string
  locations: LocationData[]
}

export default defineComponent({
  name: 'ServerListItem',
  props: {
    itemData: {
      type: Object as PropType<ServerData>,
      required: true
    }
  },
  render() {
    return (
      <div>
        <div class="text-base text-blue-400">{this.itemData.name}</div>
      </div>
    );
  }
});
