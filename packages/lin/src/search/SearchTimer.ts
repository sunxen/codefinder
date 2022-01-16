import * as constants from '../constants'

export default class SearchTimer {
    private timeout = false;

    constructor() {
        setTimeout(() => {
            this.timeout = true
        }, constants.MAX_SEARCH_TIME)
    }

    public isTimeout(): boolean {
        return this.timeout
    }
}
