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
        BotManager.liveBlogChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNEL_NEWS_ID);
        BotManager.sportsChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNEL_SPORTS_ID);

        await NOSProvider.GetLatestLiveBlogs();
        await NOSProvider.GetLatestSportLiveBlogs();

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

                await Utils.Sleep(2);
                await message.crosspost();

                const urls = liveBlog.GetUrlsAsText();
                if (urls.length > 0) {
                    var additionalMessage:Message;
                    if (liveBlog.GetType() == LiveBlogType.News) {
                        additionalMessage = await MessageService.SendMessageToLiveBlogChannel(urls);
                    } else {
                        additionalMessage = await MessageService.SendMessageToSportsChannel(urls);
                    }

                    await Utils.Sleep(2);
                    await additionalMessage.crosspost();
                }

                await Utils.Sleep(15);
            }
        }
    }
}
