import NOSConstants from '../Constants/NOSConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { MessageEmbed } from 'discord.js';
import LiveBlog from '../Objects/LiveBlog';

export default class NOSEmbeds {

    public static GetLiveBlogEmbed(liveBlog:LiveBlog) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(liveBlog.GetTypeText(), NOSConstants.ICONS.NEWS)
            .setTitle(liveBlog.GetTitle())

        const text = liveBlog.GetText();
        if (text != null) {
            embed.setDescription(text);
        }

        const imageUrl = liveBlog.GetImageUrl();
        if (imageUrl != null) {
            embed.setImage(imageUrl);
            const imageCaption = liveBlog.GetImageCaption();
            if (imageCaption != null) {
                embed.setFooter(imageCaption);
            }
        }

        const videoUrl = liveBlog.GetVideoUrl();
        if (videoUrl != null) {
            const videoCaption = liveBlog.GetVideoCaption() || `[Bekijk de video](${videoUrl})`;
            if (videoCaption != null) {
                embed.addField('Video', videoCaption);
            }
        }

        const seeAlsoText = liveBlog.GetSeeAlsoListAsText();

        if (seeAlsoText.length > 0) {
            embed.addField('Bekijk ook', seeAlsoText);
        }

        const oldTitlesText = liveBlog.GetOldTitlesAsText();
        if (oldTitlesText.length > 0) {
            embed.addField('Afgekeurde titels', oldTitlesText);
        }

        return embed;
    }
}