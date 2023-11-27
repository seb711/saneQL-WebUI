import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import createModule from "../../saneql/saneql.mjs";

interface QueryHandlingUtils {
    performQuery: (s: string) => void,
    queryResult: string,
    saneqlToSql: (s: string) => string
}

const QueryHandlingContext = createContext<QueryHandlingUtils | undefined>(undefined)

export function QueryHandlingProvider({children}: PropsWithChildren) {

    const [module, setModule] = useState<any | null>(null);
    const [queryResult, setQueryResult] = useState("");


    useEffect(() => {
        createModule().then((Module) => {
            setModule(Module);
        });
    }, []);


    const fetchQueryResult = (q: string) => {
        fetch("https://umbra.db.in.tum.de/api/query", {
            method: "POST",
            body: "set search_path = tpchSf1, public;\n" + q + " limit 4;"
        }).then(res => res.json()).then(res => {
            const colWidth = 15;
            let s = "";
            s += res.results[0].columns.map(c => c.name.padEnd(colWidth, " ").slice(0, c.name.length > colWidth ? colWidth - 3 : colWidth) + (c.name.length > colWidth ? "..." : "")).join(" | ") + "\n";
            s += "-".repeat(res.results[0].columns.length * (colWidth + 3)) + "\n";
            for (let i = 0; i < res.results[0].result[0].length; i++) {
                const row: string[] = [];
                for (let j = 0; j < res.results[0].columns.length; j++) {
                    const val = res.results[0].result[j][i].toString();
                    row.push(val.padEnd(colWidth, " ").slice(0, val.length > colWidth ? colWidth - 3 : colWidth) + (val.length > colWidth ? "..." : ""))
                }
                s += row.join(" | ") + "\n";
            }
            setQueryResult(s);
        });
    }

    const saneqlToSql = (s: string) => {
        if (s[s.length - 1] != "\n") {
            return "";
        }
        try {
            return module.saneql_to_sql(s)
        } catch (e) {
            console.error(e.toString())
            return "";
        }
    }

    const performQuery = (sqlQuery: string) => {
        fetchQueryResult(sqlQuery);
    }

    return (
        <QueryHandlingContext.Provider value={{performQuery, queryResult, saneqlToSql}}>
            {children}
        </QueryHandlingContext.Provider>
    );
}

export const useQueryHandlingUtils = () : QueryHandlingUtils => {
    const utils = useContext(QueryHandlingContext);
    if(!utils) {
        throw Error("No QueryHandlingContext found");
    }
    return utils;
}
