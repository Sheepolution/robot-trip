require('dotenv').config();

import BotManager from './Managers/BotManager';
import Discord from './Providers/Discord';
import './Utils/MonkeyPatches';
import './Providers/SQL';

class Main {

    constructor() {
        Discord.SetEventReadyCallback(BotManager.OnReady);
        // Discord.SetEventMessageCallback(BotManager.OnMessage);
        // Discord.SetEventReactionAddCallback(BotManager.OnReaction);
        // Discord.SetEventReactionRemoveCallback(BotManager.OnReaction);
        Discord.Init();
    }
}

new Main();