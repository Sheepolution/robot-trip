import NOSConstants from '../Constants/NOSConstants';
import { NewsType } from '../Enums/NewsType';
import Article from '../Objects/Article';
import LiveBlog from '../Objects/LiveBlog';

var fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');
const $ = require('jquery')(window);

export default class NOSProvider {

    private static previousLiveBlogs: Array<LiveBlog> = new Array<LiveBlog>();
    private static previousArticles: Array<Article> = new Array<Article>();
    private static newsHtml: string;

    public static async GetLatestLiveBlogs() {
        var urls = await this.GetLiveBlogUrls();
        var allLiveBlogs = new Array<LiveBlog>();
        for (const url of urls) {
            allLiveBlogs = allLiveBlogs.concat(await this.GetLiveBlogsFromUrl(`${NOSConstants.BASE_URL}${url}`, NewsType.News));
        }

        return allLiveBlogs;
    }

    public static async GetLatestSportLiveBlogs() {
        var urls = await this.GetSportLiveBlogUrls();
        var allLiveBlogs = new Array<LiveBlog>();
        for (const url of urls) {
            allLiveBlogs = allLiveBlogs.concat(await this.GetLiveBlogsFromUrl(`${NOSConstants.BASE_URL}${url}`, NewsType.Sport));
        }

        return allLiveBlogs;
    }

    public static async GetLatestArticles() {
        return (await this.GetArticlesFromHtml(this.newsHtml, NewsType.News)).reverse();
    }

    private static async GetLiveBlogUrls() {
        const html = await this.GetNewsPageHTML();
        const matches: Array<string> = Array.from(new Set(html.match(/(?<=href=")\/(liveblog\/\d+?-|collectie\/\d+?\/liveblog\/).+?(?=")/g)));
        return matches;
    }

    private static async GetSportLiveBlogUrls() {
        const html = await this.GetSportsPageHTML();
        const matches: Array<string> = Array.from(new Set(html.match(/(?<=href=")\/(liveblog\/\d+?-|collectie\/\d+?\/liveblog\/).+?(?=")/g)));
        return matches;
    }

    private static async GetLiveBlogsFromUrl(url: string, newsType: NewsType) {
        const liveBlogs = new Array<LiveBlog>();
        const html = await this.GetHTML(url);
        var i = 0;
        for (const liveBlogHTML of $(html).find('.liveblog__update')) {
            i += 1;
            if (i >= 6) {
                break;
            }

            const blogQuery = $(liveBlogHTML);
            var liveBlog = new LiveBlog();
            const id = blogQuery.attr('id').substr('UPDATE-container-'.length);
            const title = blogQuery.find('.liveblog__update__title.js-liveblog-update-title').text();
            const body = blogQuery.find('.liveblog__elements');

            liveBlog.SetId(id);
            liveBlog.SetTitle(title);
            liveBlog.SetType(newsType);

            for (const child of body.children()) {
                const childQuery = $(child);
                if (childQuery.is('p')) {
                    var paragraph = childQuery.text();
                    for (const aTag of childQuery.find('a')) {
                        const aTagQuery = $(aTag);
                        const replace = aTagQuery.text();
                        const url = aTagQuery.attr('href');
                        paragraph = paragraph.replace(replace, `[${replace}](${url})`);
                    }

                    liveBlog.AddText(paragraph);
                } else if (childQuery.is('div')) {
                    if (childQuery.hasClass('block_image')) {
                        const imgUrl = childQuery.find('img').attr('src');
                        const imageCaption = childQuery.find('.caption_content').text().replaceAll('\\n', '').trim();
                        liveBlog.SetImageUrl(imgUrl);
                        liveBlog.SetImageCaption(imageCaption);
                    } else if (childQuery.hasClass('block_video')) {
                        const imgUrl = childQuery.find('img').attr('src');
                        const videoUrl = childQuery.find('.video-play').find('a').attr('href');
                        const videoCaption = childQuery.find('.caption_content').text().replaceAll('\\n', '').trim();
                        liveBlog.SetImageUrl(imgUrl);
                        liveBlog.SetVideoUrl(`${NOSConstants.BASE_URL}${videoUrl}`);
                        liveBlog.SetVideoCaption(`[${videoCaption}](${NOSConstants.BASE_URL}${videoUrl})`);
                    } else if (childQuery.hasClass('list-also-see')) {
                        for (const seeAlso of childQuery.find('.block__link.internallink')) {
                            const seeAlsoQuery = $(seeAlso);
                            const url = seeAlsoQuery.find('a').first().attr('href');
                            const text = seeAlsoQuery.find('.list-latest__content.internallink__link').text();
                            liveBlog.AddSeeAlso(`[${text}](${NOSConstants.BASE_URL}${url})`);
                        }
                    } else if (childQuery.hasClass('block_largecenter')) {
                        const imgUrl = childQuery.find('.media-full').attr('src');
                        const imageCaption = childQuery.find('.caption_content').find('.space-right').text().replaceAll('\\n', '').trim();
                        const videoUrl = childQuery.find('.video-play').find('a').attr('href');
                        if (videoUrl != null) {
                            liveBlog.SetVideoUrl(videoUrl);
                            liveBlog.SetVideoCaption(imageCaption);
                        }
                        liveBlog.SetImageUrl(imgUrl);
                        liveBlog.SetImageCaption(imageCaption);
                    } else {
                        const externalLink = childQuery.find('a[class*="ext-"]').first();
                        if (externalLink.length > 0) {
                            liveBlog.AddUrl(externalLink.attr('href'));
                        }
                    }
                }
            }

            var previous = this.previousLiveBlogs.find(p => p.GetId() == id);
            if (previous != null) {
                if (previous.GetTitle() == title && previous.GetText() == liveBlog.GetText()) {
                    // We've already posted this live blog and it seems to be exactly the same.
                    continue;
                }

                liveBlog.SetMessage(previous.GetMessage());
                var previousIndex = this.previousLiveBlogs.indexOf(previous);
                this.previousLiveBlogs.splice(previousIndex, 1);
                liveBlog.AddOldTitles(previous.GetOldTitles());
                const previousTitle = previous.GetTitle();
                if (previousTitle != title && !liveBlog.GetOldTitles().includes(previousTitle)) {
                    liveBlog.AddOldTitle(previousTitle);
                }
            }

            liveBlogs.push(liveBlog);
            this.previousLiveBlogs.push(liveBlog);
        }

        return liveBlogs;
    }

    private static GetArticlesFromHtml(html: string, newsType: NewsType) {
        const articles = new Array<Article>();

        var i = 0;
        for (const listHtml of $(html).find('.list-items__item')) {
            i += 1;
            if (i >= 6) {
                break;
            }

            const articleQuery = $(listHtml);
            var article = new Article();
            const url = articleQuery.find('a').attr('href');
            const title = articleQuery.find('.list-items__title').text();
            const text = articleQuery.find('.list-items__description').text();
            const imgUrl = articleQuery.find('.list-items__image').attr('src');
            const categories = articleQuery.find('.list-items__category').text().slice(2).trim().replace(/[\s]{2,}/g, '_').replace(',', '').split('_');

            if (!url.startsWith('/artikel/')) {
                continue;
            }

            const id = url.substring('/artikel/'.length, url.indexOf('-'));

            article.SetId(id);
            article.SetTitle(title);
            article.SetText(text);

            var previous = this.previousArticles.find(p => p.GetId() == id);
            if (previous != null) {
                if (previous.GetTitle() == title && previous.GetText() == text) {
                    // We've already posted this article and it seems to be exactly the same.
                    continue;
                }

                article.SetMessages(previous.GetMessages());
                var previousIndex = this.previousArticles.indexOf(previous);
                this.previousArticles.splice(previousIndex, 1);
            }

            article.SetType(newsType);
            article.SetCategories(categories);
            article.SetUrl(`${NOSConstants.BASE_URL}${url}`);
            article.SetImageUrl(imgUrl);

            articles.push(article);
            this.previousArticles.push(article);
        }

        return articles;
    }

    private static async GetNewsPageHTML() {
        const html = await this.GetHTML(`${NOSConstants.BASE_URL}/nieuws/`);
        this.newsHtml = html;
        return html;
    }

    private static async GetSportsPageHTML() {
        return await this.GetHTML(`${NOSConstants.BASE_URL}/sport/`);
    }

    private static async GetHTML(url: string) {
        var response = await fetch(url);
        var html = await response.text();
        return html;
    }
}