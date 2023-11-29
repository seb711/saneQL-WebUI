interface QueryLine {
    expanded: boolean;
    displayString: string;
    queryString: string;
    resultColumns: string[];
    resultRows: string[][]; 
}

interface QueryWrapper {
    lines: QueryLine[]
}