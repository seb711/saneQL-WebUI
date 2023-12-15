export interface QueryLine {
    expanded: boolean;
    displayString: string;
    queryString: string;
    lineRange: {start: number, end: number};
    resultColumns: string[];
    resultRows: string[][]; 
    error: string;
}
