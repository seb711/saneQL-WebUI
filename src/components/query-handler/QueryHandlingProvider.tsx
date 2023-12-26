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

        const getQueryResult = (queryLines: string[], setQueryResult: any) => {            
            const queryResult = queryLines.map(async (line, i) => {
                const currentQueryString = queryLines.slice(0, i + 1).join("")
                // if there is a result we add the thing in the query result        
                const output : {query: string, error: string} = saneqlToSql(currentQueryString);

                if (output.error != "") {
                    const result: QueryLine = {
                        expanded: false, 
                        queryString: currentQueryString,
                        displayString: line,
                        lineRange: {start: i + 1, end: i + 1},
                        resultColumns: [],
                        resultRows: [],
                        error: output.error
                    };

                    return result;
                } else {
                    const {resultColumns, resultRows} : { resultColumns: string[]; resultRows: string[][]; } = await fetchQueryResult(output.query, i + 1 < queryLines.length);

                    const result: QueryLine = {
                        expanded: false, 
                        queryString: currentQueryString,
                        displayString: line,
                        lineRange: {start: i + 1, end: i + 1},
                        resultColumns: resultColumns,
                        resultRows: resultRows,
                        error: ""
                    };

                    return result;
                }

            })

            Promise.all(queryResult)
            .then((results) => {
                const finalQueryResult: QueryLine[] = [];

                const prevLine : QueryLine | undefined = results.find(element => element.error == "" );
                let prevLineNumber = prevLine ? prevLine.lineRange.start - 1 : 0
                results.forEach((result) => {
                    if (result.error == "") {
                        finalQueryResult.push({
                            ...result, 
                            lineRange: {start: prevLineNumber + 1, end: result.lineRange.end}
                        })
                        prevLineNumber = result.lineRange.end
                    }
                })

                // display error for last line
                if (results.length > 0 && results[results.length - 1].error !+ "") {
                    finalQueryResult.push(results[results.length - 1])
                } else {
                    finalQueryResult[finalQueryResult.length - 1].expanded = true;
                }

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

    const dbConfig: {url: string, getQueryBody: (s: string, limit: boolean) => string, getQueryResults: (o: any) => string[][], getQueryResultColumns: (o: any) => string[]}[] = [
        {
            url: "https://hyper-db.de/interface/query",
            getQueryBody: (s: string) => {
                s=(s + ";").replace(/[;][ \t\n]*$/,"");
                return "query=" + encodeURIComponent(s);
            },
            getQueryResults: (res: {result: string[][]}) => {
                return res.result;
            },
            getQueryResultColumns: (res: {columns: string[]}) => {
                return res.columns;
            }
        }, 
        {
            url: "https://umbra.db.in.tum.de/api/query",
            getQueryBody: (s: string, limit: boolean) => {
                let limitedQuery = s;
                const limitStr = s.match(/limit\s[0-9]+/)?.[0];

                let maxLimit : number = 26;

                if (limit) {
                    maxLimit = 6
                }

                if(limitStr) {
                    const limit = Number.parseInt(limitStr.replace("limit ", ""));
                    if (limit > 6) {
                        limitedQuery = limitedQuery.replace(/limit\s[0-9]+/, ` limit ${maxLimit}`)
                    }
                } else {
                    limitedQuery += ` limit ${maxLimit}`;
                }

                return "set search_path = tpchSf1, public;\n" + limitedQuery;
            },
            getQueryResults: (res: {results: {result: string[][]}[]}) => {
                const values = res.results[0].result;
                const transposedResult = new Array(values[0].length).fill(0).map(() => new Array<string>(values.length).fill(""));
                
                for (let i = 0; i < values.length; ++i) {
                    for (let j = 0; j < values[0].length; ++j) {
                        transposedResult[j][i] = values[i][j];
                    }
                }

                return transposedResult;
            },
            getQueryResultColumns: (res: {results: {columns: {name: string}[]}[]}) => {
                return res.results[0].columns.map((col: { name: string }) => col.name);
            }
        }, 
    ]

    const fetchQueryResult = (q: string, limit: boolean): Promise<{ resultColumns: string[]; resultRows: string[][]; }> => {
        const config = dbConfig[1];

        return fetch(config.url, {
            method: "POST",
            body: config.getQueryBody(q, limit)
        }).then(res => res.json()).then(res => {
            const resultColumns = config.getQueryResultColumns(res);

            const returnedResults = config.getQueryResults(res);

            const resultRows: string[][] = [];

            returnedResults.forEach((res: string[]) => {
                const row: string[] = [];

                res.forEach(val => {
                    row.push(val);
                })  
                resultRows.push(row);
            })

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
