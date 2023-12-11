import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
//@ts-ignore
import createModule from "../../saneql/saneql.mjs";

interface QueryHandlingUtils {
    queryResult: QueryWrapper,
    updateQuery: (s: string | undefined) => void,
    handleQueryInput: () => void,
    handleExpandRow: (index: number, expanded: boolean) => void,
    saneqlToSql: (s: string) => string,
}

const QueryHandlingContext = createContext<QueryHandlingUtils | undefined>(undefined)

export function QueryHandlingProvider({ children }: PropsWithChildren) {

    const [module, setModule] = useState<any | null>(null);
    const [queryResult, setQueryResult] = useState<QueryWrapper>({ lines: [] });
    const [query, setQueryString] = useState<string>("");

    const handleQueryInput = () => {
        if (!query) {
            setQueryResult({ lines: [] });
            return;
        }
        const editorLines = query.split("\n");

        const queryLines: QueryLine[] = editorLines.map((val: string, i: number): QueryLine => ({ expanded: false, displayString: val, queryString: editorLines.slice(0, i + 1).join("\n"), resultColumns: [], resultRows: [] }));

        setQueryResult(prev => {
            queryLines.forEach((line, i) => {
                // the query has not changed and therefore there is no need to update
                if (prev.lines.length > i && prev.lines[i].queryString == line.queryString) {
                    return;
                }
                // new Line
                if (prev.lines.length <= i) {
                    prev.lines.push(line);
                }
                // updated line
                if (prev.lines[i].queryString != line.queryString) {
                    prev.lines[i].displayString = line.displayString;
                    prev.lines[i].queryString = line.queryString;
                    prev.lines[i].resultColumns = line.resultColumns;
                    prev.lines[i].resultRows = line.resultRows;
                }

                const sql = saneqlToSql(line.queryString);

                if (sql != "") {
                    fetchQueryResult(sql, i);
                } else {
                    prev.lines[i].resultColumns = [];
                    prev.lines[i].resultRows = [];
                }
            })
            return { ...prev };
        })
    }


    const handleExpandRow = (i: number, expanded: boolean) => {
        setQueryResult(prev => {
            prev.lines[i].expanded = expanded;
            return { ...prev };
        });
    }


    useEffect(() => {
        // @ts-ignore
        createModule().then((Module) => {
            setModule(Module);
        });

        
    }, []);


    const fetchQueryResult = (q: string, index: number) => {
        fetch("https://umbra.db.in.tum.de/api/query", {
            method: "POST",
            body: "set search_path = tpchSf1, public;\n" + q + " limit 4;"
        }).then(res => res.json()).then(res => {
            setQueryResult(prev => {
                if (prev.lines[index].queryString != q) {

                    prev.lines[index].resultColumns = res.results[0].columns.map((col: { name: string }) => col.name);

                    const returnedResults = res.results[0].result;

                    const resultRows: string[][] = [];

                    for (let i = 0; i < returnedResults[0].length; ++i) {
                        const row: string[] = [];
                        returnedResults.forEach((res: string) => {
                            row.push(res[i]);
                        })
                        resultRows.push(row);
                    }

                    prev.lines[index].resultRows = resultRows;

                    return { ...prev };
                }
                return prev;
            });
        });
    }

    const updateQuery = (val: string | undefined) => {
        if (val) {
            setQueryString(val);
        }
    }

    const saneqlToSql = (s: string) => {
        if (s[s.length - 1] == "\n") {
            return "";
        }
        try {
            return module.saneql_to_sql(s)
        } catch (e) {
            console.error(e)
            return "";
        }
    }

    return (
        <QueryHandlingContext.Provider value={{ handleQueryInput, updateQuery, queryResult, saneqlToSql, handleExpandRow }}>
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
