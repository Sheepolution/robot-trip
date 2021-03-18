import NOSConstants from '../Constants/NOSConstants';
import { MessageEmbed } from 'discord.js';
import ElectionResult from '../Objects/ElectionResult';

export default class ElectionEmbeds {

    public static GetElectionResultEmbed(electionResult: ElectionResult) {
        const embed = new MessageEmbed()
            .setColor(NOSConstants.EMBED_COLOR)
            .setAuthor('Tweedekamer Verkiezingen 2021')
            .setTitle(electionResult.GetMunicipality());

        for (const party of electionResult.GetParties()) {
            const previous = party.GetPrevious();
            const current = party.GetCurrent();
            if (previous == '0,0' && current == '0,0') {
                continue;
            }

            const difference = party.GetDifference();

            embed.addField(party.GetName(), `2021: ${current}%\n2017: ${previous}%\n${difference == '0,0' ? '⚫' : difference.includes('-') ? '🔴' : '🟢'} ${difference}%`, true);
        }

        return embed;
    }
}