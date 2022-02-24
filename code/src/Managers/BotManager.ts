import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import NOSEmbeds from '../Embeds/NOSEmbeds';
import NOSProvider from '../Providers/NOSProvider';
import SettingsConstants from '../Constants/SettingsConstants';
import { Message, TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';
import LiveBlog from '../Objects/LiveBlog';
import { NewsType } from '../Enums/NewsType';
import Article from '../Objects/Article';
import { ArticleCategories } from '../Enums/NewsCategories';
import ElectionProvider from '../Providers/ElectionsProvider';
import ElectionEmbeds from '../Embeds/ElectionEmbeds';

export default class BotManager {

    private static liveBlogChannel: TextChannel;
    private static sportsChannel: TextChannel;
    private static overzichtChannel: TextChannel;
    private static binnenlandChannel: TextChannel;
    private static buitenlandChannel: TextChannel;
    private static cultuurChannel: TextChannel;
    private static economieChannel: TextChannel;
    private static koningshuisChannel: TextChannel;
    private static opmerkelijkChannel: TextChannel;
    private static politiekChannel: TextChannel;
    private static techChannel: TextChannel;
    private static regionaalChannel: TextChannel;
    private static electionsChannel: TextChannel;

    public static async OnReady() {
        console.log('Robot Trip: Connected');
        BotManager.liveBlogChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_NEWS_ID);
        BotManager.overzichtChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_OVERZICHT_ID);
        BotManager.binnenlandChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_BINNENLAND_ID);
        BotManager.buitenlandChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_BUITENLAND_ID);
        BotManager.cultuurChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_CULTUUR_ID);
        BotManager.economieChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_ECONOMIE_ID);
        BotManager.koningshuisChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_KONINGSHUIS_ID);
        BotManager.opmerkelijkChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_OPMERKELIJK_ID);
        BotManager.politiekChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_POLITIEK_ID);
        BotManager.techChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_TECH_ID);
        BotManager.regionaalChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_REGIONAAL_ID);
        BotManager.electionsChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_ELECTIONS_ID);

        await NOSProvider.GetLatestLiveBlogs();
        await NOSProvider.GetLatestArticles();

        setInterval(async () => {
            BotManager.SendNewsLiveBlogs();
            await Utils.Sleep(7);
            BotManager.SendNewsArticles();
        }, Utils.GetMinutesInMiliSeconds(2));

        if (SettingsConstants.CHANNEL_SPORTS_ID) {
            BotManager.sportsChannel = <TextChannel>await DiscordService.FindChannelById(SettingsConstants.CHANNEL_SPORTS_ID);
            await NOSProvider.GetLatestSportLiveBlogs();
            setInterval(() => {
                BotManager.SendSportLiveBlogs();
            }, Utils.GetMinutesInMiliSeconds(5));
        }
    }

    public static GetLiveBlogChannel() {
        return BotManager.liveBlogChannel;
    }

    public static GetSportsChannel() {
        return BotManager.sportsChannel;
    }

    public static GetElectionsChannel() {
        return BotManager.electionsChannel;
    }

    public static async SendNewsLiveBlogs() {
        const liveBlogs = (await NOSProvider.GetLatestLiveBlogs()).reverse();
        this.SendLiveBlogs(liveBlogs);
    }

    public static async SendSportLiveBlogs() {
        const liveBlogs = (await NOSProvider.GetLatestSportLiveBlogs()).reverse();
        this.SendLiveBlogs(liveBlogs);
    }

    public static async SendNewsArticles() {
        const articles = (await NOSProvider.GetLatestArticles()).reverse();
        this.SendArticles(articles);
    }

    public static async SendElectionResults() {
        const electionResults = (await ElectionProvider.GetLatestElectionResults()).reverse();
        for (const electionResult of electionResults) {
            const message = await MessageService.SendMessageToElectionsChannel('', ElectionEmbeds.GetElectionResultEmbed(electionResult));
            await Utils.Sleep(2);
            await message.crosspost();
            await Utils.Sleep(15);
        }
    }

    private static async SendLiveBlogs(liveBlogs: Array<LiveBlog>) {
        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage != null) {
                oldMessage.edit('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
            }
        }

        for (const liveBlog of liveBlogs) {
            const oldMessage = liveBlog.GetMessage();

            if (oldMessage == null) {
                var message: Message;
                if (liveBlog.GetType() == NewsType.News) {
                    message = await MessageService.SendMessageToLiveBlogChannel('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
                } else {
                    message = await MessageService.SendMessageToSportsChannel('', NOSEmbeds.GetLiveBlogEmbed(liveBlog));
                }

                liveBlog.SetMessage(message);

                await Utils.Sleep(5);
                await message.crosspost();

                const urls = liveBlog.GetUrlsAsText();
                if (urls.length > 0) {
                    var additionalMessage: Message;
                    if (liveBlog.GetType() == NewsType.News) {
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

    private static async SendArticles(articles: Array<Article>) {
        for (const article of articles) {
            const oldMessages = article.GetMessages();

            if (oldMessages.length > 0) {
                for (const oldMessage of oldMessages) {
                    await oldMessage.edit('', NOSEmbeds.GetArticleEmbed(article));
                    await Utils.Sleep(3);
                }
            } else {
                const embed = NOSEmbeds.GetArticleEmbed(article);

                for (const category of article.GetCategories()) {
                    var channel: TextChannel;

                    switch (category) {
                        case ArticleCategories.Binnenland:
                            channel = this.binnenlandChannel;
                            break;
                        case ArticleCategories.Buitenland:
                            channel = this.buitenlandChannel;
                            break;
                        case ArticleCategories.Cultuur:
                            channel = this.cultuurChannel;
                            break;
                        case ArticleCategories.Economie:
                            channel = this.economieChannel;
                            break;
                        case ArticleCategories.Koningshuis:
                            channel = this.koningshuisChannel;
                            break;
                        case ArticleCategories.Opmerkelijk:
                            channel = this.opmerkelijkChannel;
                            break;
                        case ArticleCategories.Politiek:
                            channel = this.politiekChannel;
                            break;
                        case ArticleCategories.Regionaal:
                            channel = this.regionaalChannel;
                            break;
                        case ArticleCategories.Tech:
                            channel = this.techChannel;
                            break;
                        default:
                            channel = this.binnenlandChannel;
                    }

                    const message = await MessageService.SendMessage(channel, '', embed);

                    article.AddMessage(message);

                    await Utils.Sleep(5);
                    await message.crosspost();

                    await Utils.Sleep(5);
                }

                const message = await MessageService.SendMessage(this.overzichtChannel, '', embed);

                article.AddMessage(message);

                await Utils.Sleep(5);
                await message.crosspost();

                await Utils.Sleep(15);
            }
        }
    }
}