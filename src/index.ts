import { BaseCluster } from 'kurasuta';
import { Tweetcord } from './components/Client';

export default class extends BaseCluster {
    declare public client: Tweetcord
    launch() {
        this.client.init()
    }
};
