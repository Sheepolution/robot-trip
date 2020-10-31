import NOSConstants from '../Constants/NOSConstants';
import { LiveBlogType } from '../Enums/LiveBlogType';
import LiveBlog from '../Objects/LiveBlog';

var fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');
const $ = require('jquery')(window);

export default class NOSProvider {

    private static previousLiveBlogs: Array<LiveBlog> = new Array<LiveBlog>();

    public static async GetLatestLiveBlogs() {
        var urls = await this.GetLiveBlogUrls();
        var allLiveBlogs = new Array<LiveBlog>();
        for (const url of urls) {
            allLiveBlogs = allLiveBlogs.concat(await this.GetLiveBlogsFromUrl(`${NOSConstants.BASE_URL}${url}`));
        }

        return allLiveBlogs;
    }

    private static async GetLiveBlogUrls() {
        const html = await this.GetHomepageHTML();
        const matches: Array<string> = Array.from(new Set(html.match(/(\/liveblog\/.+?\.html)/g)));
        return matches;
    }

    private static async GetLiveBlogsFromUrl(url: string) {
        const liveBlogs = new Array<LiveBlog>();
        const html = await this.GetHTML(url);
        var i = 0;
        for (const liveBlogHTML of $(html).find('.liveblog__update')) {
            i += 1;
            if (i >= 6) {
                break;
            }

            var success = true;

            const blogQuery = $(liveBlogHTML);
            var liveBlog = new LiveBlog();
            const title = blogQuery.find('.liveblog__update__title.js-liveblog-update-title').text();
            const body = blogQuery.find('.liveblog__elements');

            liveBlog.SetTitle(title);
            liveBlog.SetType(LiveBlogType.News);

            for (const child of body.children()) {
                const childQuery = $(child);
                if (childQuery.is('p')) {
                    var text = childQuery.text();
                    for (const aTag of childQuery.find('a')) {
                        const aTagQuery = $(aTag);
                        const replace = aTagQuery.text();
                        const url = aTagQuery.attr('href');
                        text = text.replace(replace, `[${replace}](${url})`);
                    }

                    var previous = this.previousLiveBlogs.find(p => p.GetTitle() == title || p.GetFirstText() == text);
                    if (previous != null) {
                        if (previous.GetTitle() == title && previous.GetFirstText() == text) {
                            // We've already posted this liveblog and it seems to be exactly the same.
                            success = false;
                            break;
                        }

                        liveBlog.SetMessage(previous.GetMessage());
                        var previousIndex = this.previousLiveBlogs.indexOf(previous);
                        this.previousLiveBlogs.splice(previousIndex, 1);
                        liveBlog.AddOldTitles(liveBlog.GetOldTitles());
                        liveBlog.AddOldTitle(liveBlog.GetTitle());
                    }

                    liveBlog.AddText(text);
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
                        const externalLink = childQuery.find('[class^="ext-"]').first();
                        if (externalLink.length > 0) {
                            liveBlog.AddUrl(externalLink.attr('href'));
                        }
                    }
                }
            }

            if (success) {
                const text = liveBlog.GetText();
                if (text == null) {
                    var previous = this.previousLiveBlogs.find(p => p.GetTitle() == title);
                    if (previous != null) {
                        continue;
                    }

                }

                liveBlogs.push(liveBlog);
                this.previousLiveBlogs.push(liveBlog);
            }
        }

        return liveBlogs;
    }

    private static async GetHomepageHTML() {
        return await this.GetHTML(`${NOSConstants.BASE_URL}/nieuws/`);
    }

    private static async GetHTML(url: string) {
        var response = await fetch(url);
        var html = await response.text();
        return html;
    }
}