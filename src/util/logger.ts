import * as signale from 'signale';
const options: signale.SignaleOptions<'command'> | undefined = {
    config: { displayDate: true, displayTimestamp: true },
    types: {
        command: {
            badge: '💬',
            color: 'gray',
            label: 'command',
            logLevel: 'debug'
        }
    }
};

const logger: signale.Signale<signale.DefaultMethods | 'command'> = new signale.Signale(options);

export const baseLogger = logger;