import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import createModule from "../../saneql/saneql.mjs";
import { QueryLine } from "./QueryWrapper";
import tpchQueries from '../../assets/tpchQueries';

interface QueryHandlingUtils {
    query: string,
    queryResult: QueryLine[],
    updateQuery: (s: string | undefined) => void,
    handleQueryInput: () => void,
    handleExpandRow: (index: number, expanded: boolean) => void,
    selectDefaultQuery: (num: number) => void
}

const QueryHandlingContext = createContext<QueryHandlingUtils | undefined>(undefined)

function ensureNewlineAtEnd(linesArray: string[]) {
    for (let i = 0; i < linesArray.length; i++) {
        if (!linesArray[i].endsWith('\n')) {
            linesArray[i] += '\n';
        }
    }
}

export function QueryHandlingProvider({ children }: PropsWithChildren) {

    const [module, setModule] = useState<any | null>(null);
    const [queryResult, setQueryResult] = useState<QueryLine[]>([]);
    const [query, setQueryString] = useState<string>("");

    const handleQueryInput = async () => {
        if (!query) {
            setQueryResult([]);
            return;
        }

        const editorLines = query.split("\n");

        ensureNewlineAtEnd(editorLines);

        const getQueryResult = (queryLines: string[], setQueryResult: any) => {            
            let currentError = "";
            let currentQueryString = "";

            const queryResult = queryLines.map(async (line, i) => {
                currentQueryString = editorLines.slice(0, i + 1).join("")
                // if there is a result we add the thing in the query result        
                try {
                    const output : {query: string, error: string} = saneqlToSql(currentQueryString);
                    if (output.error != "") {
                        console.log(output)
                        currentError = output.error;
                        return null;
                    } else {
                        const {resultColumns, resultRows} : { resultColumns: string[]; resultRows: string[][]; } = await fetchQueryResult(output.query);

                        const result: QueryLine = {
                            expanded: false, 
                            queryString: currentQueryString,
                            displayString: line,
                            lineRange: {start: i + 1, end: i + 1},
                            resultColumns: resultColumns,
                            resultRows: resultRows,
                            error: ""
                        };

                        currentError = "";
                        return result;
                    }
                } catch (e: unknown) {
                    console.error(e);
                }
                return null;
            })

            Promise.all(queryResult)
            .then((results) => {
                const finalQueryResult: QueryLine[] = [];

                const prevLine : QueryLine | null | undefined = results.find(element => element !== null);
                let prevLineNumber = prevLine && prevLine != null ? prevLine.lineRange.start - 1 : 0
                results.forEach((result) => {
                    if (result !== null) {
                        finalQueryResult.push({
                            ...result, 
                            lineRange: {start: prevLineNumber + 1, end: result.lineRange.end}
                        })
                        prevLineNumber = result.lineRange.end
                    }
                })

                // display error for last line
                if (currentError != "") {
                    finalQueryResult.push({
                        expanded: false, 
                            queryString: currentQueryString,
                            displayString: '',
                            lineRange: {start: editorLines.length - 1, end: editorLines.length},
                            resultColumns: [],
                            resultRows: [],
                            error: currentError
                    })
                } else {
                    finalQueryResult[finalQueryResult.length - 1].expanded = true;
                }

                console.log(finalQueryResult)

                setQueryResult(finalQueryResult);
              })
              .catch((error) => {
                console.error(`Error in Promise.all: ${error}`);
                setQueryResult([]); // Setting empty array in case of an error
              });
        }

        getQueryResult(editorLines, setQueryResult);
    }



    const handleExpandRow = (i: number, expanded: boolean) => {
        setQueryResult(prev => {
            prev[i].expanded = expanded;
            return [...prev];
        });
    }

    const selectDefaultQuery = (i: number) => {
        updateQuery(tpchQueries[i])
        setQueryResult([])
    }


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        createModule().then((Module) => {
            setModule(Module);
        });


    }, []);

    const dbConfig: {url: string, getQueryBody: (s: string) => string, getQueryResults: (o: any) => string[][], getQueryResultColumns: (o: any) => string[]}[] = [
        {
            url: "https://hyper-db.de/interface/query",
            getQueryBody: (s: string) => {
                s=(s + ";").replace(/[;][ \t\n]*$/,"");
                return "query=" + encodeURIComponent(s);
            },
            getQueryResults: (res: {result: string[][]}) => {
                return res.result.slice(0, 6);
            },
            getQueryResultColumns: (res: {columns: string[]}) => {
                return res.columns;
            }
        }, 
        {
            url: "https://umbra.db.in.tum.de/api/query",
            getQueryBody: (s: string) => {
                return "set search_path = tpchSf1, public;\n" + s + ";"
            },
            getQueryResults: (res: {results: {result: string[][]}[]}) => {
                return res.results[0].result.slice(0, 6);
            },
            getQueryResultColumns: (res: {results: {columns: {name: string}[]}[]}) => {
                return res.results[0].columns.map((col: { name: string }) => col.name);
            }
        }, 
    ]

    const fetchQueryResult = (q: string): Promise<{ resultColumns: string[]; resultRows: string[][]; }> => {
        return fetch(dbConfig[0].url, {
            method: "POST",
            body: dbConfig[0].getQueryBody(q)
        }).then(res => res.json()).then(res => {
            console.log(res);
            const resultColumns = dbConfig[0].getQueryResultColumns(res);

            const returnedResults = dbConfig[0].getQueryResults(res);

            const resultRows: string[][] = [];

            returnedResults.forEach((res: string[]) => {
                const row: string[] = [];

                res.forEach(val => {
                    row.push(val);
                })  
                resultRows.push(row);

            })

            console.log( resultColumns, resultRows)

            return {
                resultColumns, resultRows
            };
        });
    }

    const updateQuery = (val: string | undefined) => {
        if (val) {
            setQueryString(val);
        }
    }

    const saneqlToSql = (s: string) : {query: string, error: string} => {
        /* if (s[s.length - 1] == "\n") {
            return {query: '', error: 'last line is not a newline character'};
        } */
        try {
            const output = module.saneql_to_sql(s)
            return JSON.parse(output)
        } catch (e: any) {
            console.log(e)
            return {query: '', error: e.toString()};
        }
    }

    return (
        <QueryHandlingContext.Provider value={{ handleQueryInput, updateQuery, queryResult, handleExpandRow, selectDefaultQuery, query }}>
            {children}
        </QueryHandlingContext.Provider>
    );
}

export const useQueryHandlingUtils = (): QueryHandlingUtils => {
    const utils = useContext(QueryHandlingContext);
    if (!utils) {
        throw Error("No QueryHandlingContext found");
    }
    return utils;
}
