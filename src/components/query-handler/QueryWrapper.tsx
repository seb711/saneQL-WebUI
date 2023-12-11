export interface QueryLine {
    expanded: boolean;
    displayString: string;
    queryString: string;
    resultColumns: string[];
    resultRows: string[][]; 
    error: string;
}
