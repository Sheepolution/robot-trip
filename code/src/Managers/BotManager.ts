import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import NOSEmbeds from '../Embeds/NOSEmbeds';
import NOSProvider from '../Providers/NOSProvider';
import SettingsConstants from '../Constants/SettingsConstants';
import { TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';

export default class BotManager {

    private static liveBlogChannel:TextChannel;

    public static async OnReady() {
        console.log('Robot Trip: Connected');
        BotManager.liveBlogChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.LIVE_BLOG_CHANNEL_ID);
        await NOSProvider.GetLatestLiveBlogs();
        setInterval(() => {
            BotManager.SendLiveBlogs();
        }, Utils.GetMinutesInMiliSeconds(2))
    }

    public static GetLiveBlogChannel() {
        return BotManager.liveBlogChannel;
    }

    public static async SendLiveBlogs() {
        const liveBlogs = (await NOSProvider.GetLatestLiveBlogs()).reverse();
        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage != null) {
                oldMessage.edit('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
            }
        }

        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage == null) {
                const message = await MessageService.SendMessageToLiveBlogChannel('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
                liveBlog.SetMessage(message);

                const urls = liveBlog.GetUrlsAsText();
                if (urls.length > 0) {
                    MessageService.SendMessageToLiveBlogChannel(urls);
                }
                await Utils.Sleep(15);
            }
        }
    }
}
