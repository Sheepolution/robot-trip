import NOSConstants from '../Constants/NOSConstants';
import ElectionResult from '../Objects/ElectionResult';
import { Utils } from '../Utils/Utils';

var fetch = require('node-fetch');

export default class ElectionProvider {

    private static cachedMunicipalities: any = {};
    private static partyNames: any = {};

    public static async GetPartyNames() {
        const json = await this.GetJSON(`${NOSConstants.ELECTIONS_API_BASE_URL}index-t2wmrc.json`);
        for (const party of json.parties) {
            this.partyNames[party.key] = party.label;
        }
    }

    public static GetPartyName(key: string) {
        return this.partyNames[key];
    }

    public static async GetLatestElectionResults() {
        var municipalities = await this.GetElectionResultsMunicipalities();
        var allElectionResults = new Array<ElectionResult>();
        for (const municipality of municipalities) {
            allElectionResults.push(await this.GetElectionResultFromUrl(municipality));
            await Utils.Sleep(3);
        }

        return allElectionResults;
    }

    public static async GetElectionResultsMunicipalities() {
        const json = await this.GetJSON(`${NOSConstants.ELECTIONS_API_BASE_URL}index-t2wmrc.json`);
        const municipalities = new Array<any>();
        for (const view of json.views) {
            if (view.type == 0) {
                if (!this.cachedMunicipalities[view.key]) {
                    municipalities.push(view);
                    this.cachedMunicipalities[view.key] = true;
                    if (municipalities.length >= 8) {
                        break;
                    }
                }
            }
        }

        return municipalities;
    }

    private static async GetElectionResultFromUrl(municipality: any) {
        const electionResult = new ElectionResult();
        const json = await this.GetJSON(`${NOSConstants.ELECTIONS_API_BASE_URL}${municipality.key}.json`);
        electionResult.ParseJSON(municipality, json);
        return electionResult;
    }

    private static async GetJSON(url: string) {
        var response = await fetch(url);
        var json = await response.json();
        return json;
    }
}