import ElectionProvider from '../Providers/ElectionsProvider';

export default class ElectionResultParty {

    private name: string;
    private previous: string;
    private current: string;
    private difference: string;

    public ParseJSON(json: any) {
        this.name = ElectionProvider.GetPartyName(json.key);
        this.previous = json.results.previous.percentage;
        this.current = json.results.current.percentage;
        this.difference = json.results.diff.percentage;
    }

    public GetName() {
        return this.name;
    }

    public GetPrevious() {
        return this.previous;
    }

    public GetCurrent() {
        return this.current;
    }

    public GetDifference() {
        return this.difference;
    }
}