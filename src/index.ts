import { BaseCluster } from 'kurasuta';

export default class extends BaseCluster {
    launch() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
};
