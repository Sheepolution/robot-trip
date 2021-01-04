import { Message } from 'discord.js';
import NOSConstants from '../Constants/NOSConstants';
import { LiveBlogType } from '../Enums/LiveBlogType';

export default class LiveBlog {

    private id:string;
    private title:string;
    private firstText:string;
    private text:string;
    private type:LiveBlogType;
    private imageUrl:string;
    private imageCaption:string;
    private videoUrl:string;
    private videoCaption:string;
    private urls:Array<string>;
    private seeAlsoList:Array<string>;
    private oldTitles:Array<string>;
    private message:Message;

    constructor() {
        this.urls = new Array<string>();
        this.seeAlsoList = new Array<string>();
        this.oldTitles = new Array<string>();
    }

    public GetId() {
        return this.title;
    }

    public SetId(id:string) {
        this.id = id;
    }

    public GetTitle() {
        return this.title;
    }

    public SetTitle(title:string) {
        if (this.title != null) {
            this.AddOldTitle(this.title);
        }

        this.title = title;
    }

    public GetType() {
        return this.type;
    }

    public GetTypeText() {
        switch (this.type) {
            case LiveBlogType.News:
                return 'NOS Liveblog';
            case LiveBlogType.Sport:
                return 'NOS Liveblog - Sport';
        }
    }

    public GetIcon() {
        switch (this.type) {
            case LiveBlogType.News:
                return NOSConstants.ICONS.NEWS
            case LiveBlogType.Sport:
                return NOSConstants.ICONS.SPORT
        }
    }

    public SetType(type:LiveBlogType) {
        this.type = type;
    }

    public GetFirstText() {
        return this.firstText;
    }

    public GetText() {
        return this.text;
    }

    public AddText(text:string) {
        if (this.text == null) {
            this.firstText = text;
            this.text = text;
            return;
        }

        if (this.text.length + text.length > 2046) {
            return;
        }

        this.text += `\n\n${text}`;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    public SetImageUrl(imageUrl:string) {
        this.imageUrl = imageUrl;
    }

    public GetImageCaption() {
        return this.imageCaption;
    }

    public SetImageCaption(text:string) {
        this.imageCaption = text;
    }

    public GetVideoUrl() {
        return this.videoUrl;
    }

    public SetVideoUrl(videoUrl:string) {
        this.videoUrl = videoUrl;
    }

    public GetVideoCaption() {
        return this.videoCaption;
    }

    public SetVideoCaption(text:string) {
        this.videoCaption = text;
    }

    public GetUrls() {
        return this.urls;
    }

    public GetUrlsAsText() {
        return this.urls.join('\n');
    }

    public AddUrl(url:string) {
        this.urls.push(url);
    }

    public GetSeeAlsoList() {
        return this.seeAlsoList;
    }

    public GetSeeAlsoListAsText() {
        return this.seeAlsoList.join('\n');
    }

    public AddSeeAlso(seeAlso:string) {
        this.seeAlsoList.push(seeAlso);
    }

    public GetOldTitles() {
        return this.oldTitles;
    }

    public GetOldTitlesAsText() {
        return this.oldTitles.join('\n');
    }

    public AddOldTitle(oldTitle:string) {
        this.oldTitles.push(oldTitle);
    }

    public AddOldTitles(oldTitle:Array<string>) {
        this.oldTitles = this.oldTitles.concat(oldTitle);
    }

    public GetMessage() {
        return this.message;
    }

    public SetMessage(message:Message) {
        this.message = message;
    }
}