import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import NOSEmbeds from '../Embeds/NOSEmbeds';
import NOSProvider from '../Providers/NOSProvider';
import SettingsConstants from '../Constants/SettingsConstants';
import { Message, TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';
import LiveBlog from '../Objects/LiveBlog';
import { LiveBlogType } from '../Enums/LiveBlogType';

export default class BotManager {

    private static liveBlogChannel:TextChannel;
    private static sportsChannel:TextChannel;

    public static async OnReady() {
        console.log('Robot Trip: Connected');
        BotManager.liveBlogChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.LIVE_BLOG_CHANNEL_ID);
        BotManager.sportsChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.SPORTS_CHANNEL_ID);
        await NOSProvider.GetLatestLiveBlogs();

        setInterval(() => {
            BotManager.SendNewsLiveBlogs();
        }, Utils.GetMinutesInMiliSeconds(2))

        setInterval(() => {
            BotManager.SendSportLiveBlogs();
        }, Utils.GetMinutesInMiliSeconds(5))
    }

    public static GetLiveBlogChannel() {
        return BotManager.liveBlogChannel;
    }

    public static GetSportsChannel() {
        return BotManager.sportsChannel;
    }

    public static async SendNewsLiveBlogs() {
        const liveBlogs = (await NOSProvider.GetLatestLiveBlogs()).reverse();
        this.SendLiveBlogs(liveBlogs);
    }

    public static async SendSportLiveBlogs() {
        const liveBlogs = (await NOSProvider.GetLatestSportLiveBlogs()).reverse();
        this.SendLiveBlogs(liveBlogs);
    }

    private static async SendLiveBlogs(liveBlogs:Array<LiveBlog>) {
        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage != null) {
                oldMessage.edit('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
            }
        }

        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage == null) {
                var message:Message;
                if (liveBlog.GetType() == LiveBlogType.News) {
                    message = await MessageService.SendMessageToLiveBlogChannel('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
                } else {
                    message = await MessageService.SendMessageToSportsChannel('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
                }

                liveBlog.SetMessage(message);

                const urls = liveBlog.GetUrlsAsText();
                if (urls.length > 0) {
                    if (liveBlog.GetType() == LiveBlogType.News) {
                        MessageService.SendMessageToLiveBlogChannel(urls);
                    } else {
                        MessageService.SendMessageToSportsChannel(urls);
                    }
                }

                await Utils.Sleep(15);
            }
        }
    }
}
