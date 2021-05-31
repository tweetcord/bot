import { BaseCluster } from 'kurasuta';
import { Tweetcord } from './components/Client';

export default class extends BaseCluster {
    public client!: Tweetcord
    launch() {
        this.client.init()
    }
};
