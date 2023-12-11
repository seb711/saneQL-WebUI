import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import createModule from "../../saneql/saneql.mjs";
import { QueryLine } from "./QueryWrapper";

interface QueryHandlingUtils {
    queryResult: QueryLine[],
    updateQuery: (s: string | undefined) => void,
    handleQueryInput: () => void,
    handleExpandRow: (index: number, expanded: boolean) => void,
}

const QueryHandlingContext = createContext<QueryHandlingUtils | undefined>(undefined)

export function QueryHandlingProvider({ children }: PropsWithChildren) {

    const [module, setModule] = useState<unknown | null>(null);
    const [queryResult, setQueryResult] = useState<QueryLine[]>([]);
    const [query, setQueryString] = useState<string>("");

    const handleQueryInput = async () => {
        if (!query) {
            setQueryResult([]);
            return;
        }
        const editorLines = query.split("\n");

        const queryLines: QueryLine[] = editorLines.map((val: string, i: number): QueryLine => ({ expanded: false, displayString: val, queryString: editorLines.slice(0, i + 1).join("\n"), resultColumns: [], resultRows: [], error: "" }));

        const getQueryResult = (queryLines: QueryLine[], setQueryResult: any) => {
            const lines = queryLines.map(async (line) => {
                let sql = "";
        
                try {
                    sql = saneqlToSql(line.queryString);
                } catch (e: unknown) {
                    line.error = String(e)
                }

                if (sql != "") {
                    const {resultColumns, resultRows} : { resultColumns: string[]; resultRows: string[][]; } = await fetchQueryResult(sql);
                    line.resultColumns = resultColumns;
                    line.resultRows = resultRows;
                } 
                
                return line;
            })

            Promise.all(lines)
            .then((results) => {
                results[results.length - 1].expanded = true;
                setQueryResult(results);
              })
              .catch((error) => {
                console.error(`Error in Promise.all: ${error}`);
                setQueryResult([]); // Setting empty array in case of an error
              });
        }

        getQueryResult(queryLines, setQueryResult);
    }



    const handleExpandRow = (i: number, expanded: boolean) => {
        setQueryResult(prev => {
            prev[i].expanded = expanded;
            return [...prev];
        });
    }


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        createModule().then((Module) => {
            setModule(Module);
        });


    }, []);


    const fetchQueryResult = (q: string): Promise<{ resultColumns: string[]; resultRows: string[][]; }> => {
        return fetch("https://umbra.db.in.tum.de/api/query", {
            method: "POST",
            body: "set search_path = tpchSf1, public;\n" + q + " limit 4;"
        }).then(res => res.json()).then(res => {
            const resultColumns = res.results[0].columns.map((col: { name: string }) => col.name);

            const returnedResults = res.results[0].result;

            const resultRows: string[][] = [];

            for (let i = 0; i < returnedResults[0].length; ++i) {
                const row: string[] = [];
                returnedResults.forEach((res: string) => {
                    row.push(res[i]);
                })
                resultRows.push(row);
            }

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

    const saneqlToSql = (s: string) : string => {
        if (s[s.length - 1] == "\n") {
            return "";
        }
        try {
            return module.saneql_to_sql(s)
        } catch (e: unknown) {
            throw e
        }
    }

    return (
        <QueryHandlingContext.Provider value={{ handleQueryInput, updateQuery, queryResult, handleExpandRow }}>
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
