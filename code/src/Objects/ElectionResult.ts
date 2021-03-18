import ElectionResultParty from './ElectionVoteParty';
import ElectionVoteParty from './ElectionVoteParty';

export default class ElectionResult {

    private municipality: string;
    private parties: Array<ElectionResultParty>;

    constructor() {
        this.parties = new Array<ElectionResultParty>();
    }

    public ParseJSON(municipality: any, json: any) {
        this.municipality = municipality.label;
        for (const party of json.parties) {
            const electionVoteParty = new ElectionVoteParty();
            electionVoteParty.ParseJSON(party);
            this.parties.push(electionVoteParty);
        }
    }

    public GetMunicipality() {
        return this.municipality;
    }

    public GetParties() {
        return this.parties;
    }
}