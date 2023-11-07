import { Message } from 'discord.js';
import NOSConstants from '../Constants/NOSConstants';
import { ArticleCategories } from '../Enums/NewsCategories';
import { NewsType } from '../Enums/NewsType';

export default class LiveBlog {

    private id: string;
    private title: string;
    private text: string;
    private url: string;
    private imageUrl: string;
    private type: NewsType;
    private categories: Array<ArticleCategories>;
    private messages: Array<Message>;

    constructor() {
        this.categories = new Array<ArticleCategories>();
        this.messages = new Array<Message>();
    }

    public GetId() {
        return this.id;
    }

    public SetId(id: string) {
        this.id = id;
    }

    public GetTitle() {
        return this.title;
    }

    public SetTitle(title: string) {
        this.title = title;
    }

    public GetTypeText() {
        switch (this.type) {
            case NewsType.News:
                return 'NOS Nieuws';
            case NewsType.Sport:
                return 'NOS Sport';
        }
    }

    public GetIcon() {
        switch (this.type) {
            case NewsType.News:
                return NOSConstants.ICONS.NEWS;
            case NewsType.Sport:
                return NOSConstants.ICONS.SPORT;
        }
    }

    public GetText() {
        return this.text;
    }

    public SetText(text: string) {
        this.text = text;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    public SetImageUrl(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    public SetType(newsType: NewsType) {
        this.type = newsType;
    }

    public GetUrl() {
        return this.url;
    }

    public SetUrl(url: string) {
        this.url = url;
    }

    public GetCategories() {
        return this.categories;
    }

    public GetCategoriesText() {
        return this.categories.join(', ');
    }

    public SetCategories(categories: Array<string>) {
        this.categories = new Array<ArticleCategories>();

        for (const category of categories) {
            switch (category) {
                case 'binnenland': this.categories.push(ArticleCategories.Binnenland);
                    break;
                case 'buitenland': this.categories.push(ArticleCategories.Buitenland);
                    break;
                case 'regio': this.categories.push(ArticleCategories.Regionaal);
                    break;
                case 'politiek': this.categories.push(ArticleCategories.Politiek);
                    break;
                case 'economie': this.categories.push(ArticleCategories.Economie);
                    break;
                case 'koningshuis': this.categories.push(ArticleCategories.Koningshuis);
                    break;
                case 'tech': this.categories.push(ArticleCategories.Tech);
                    break;
                case 'cultuur-en-media': this.categories.push(ArticleCategories.Cultuur);
                    break;
                case 'opmerkelijk': this.categories.push(ArticleCategories.Opmerkelijk);
                    break;
            }
        }
    }

    public GetMessages() {
        return this.messages;
    }

    public SetMessages(messages: Array<Message>) {
        this.messages = messages;
    }

    public AddMessage(message: Message) {
        this.messages.push(message);
    }
}