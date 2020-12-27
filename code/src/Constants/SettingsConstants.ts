export default class SettingsConstants {
    public static readonly COLORS = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        DEFAULT:'#e61e14',
    }

    public static readonly PREFIX = ';';

    public static readonly BOT_ID = process.env.BOT_ID || '';
    public static readonly ADMIN_ID = process.env.ADMIN_ID || '';
    public static readonly LIVE_BLOG_CHANNEL_ID = process.env.LIVE_BLOG_CHANNEL_ID || '';
    public static readonly SPORTS_CHANNEL_ID = process.env.SPORTS_CHANNEL_ID || '';

}
