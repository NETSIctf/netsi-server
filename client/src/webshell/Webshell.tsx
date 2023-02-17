import { useEffect, useState } from "react";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from "react-terminal-ui";
import { checkLoginNavigate } from "../components/LoginChecks";

import io from "socket.io-client";

const socket = io({ autoConnect: false });

type monDataType = { data: string, headers: any };

type monDataOptions = {
    showHeaders: boolean
}

const helpMessage = `
set - Sets an Option
get - Gets a value
help - Shows this help page
clear - Clears console

LIST OF OPTIONS:
showheaders - true/false - Shows the header field or not.
`

export default function Webshell() {
    const [termData, setTermData] = useState<(TerminalOutput | TerminalInput)[]>([]);

    const [options, setOptions_nomerge] = useState<monDataOptions>({ showHeaders: false });

    function appendTermData(input: any, type: "output" | "input" = "output") {
        if (type == "output") {
            setTermData(prev => [...prev, <TerminalOutput key={prev.length}>{input}</TerminalOutput>]);
        } else if (type == "input") {
            setTermData(prev => [...prev, <TerminalInput key={prev.length}>{input}</TerminalInput>]);
        }
    }

    function setOptions(options: Partial<monDataOptions>) {
        setOptions_nomerge(prev => ({ ...prev, ...options }));
    }

    useEffect(() => { // SOCKET INIT CODE
        socket.connect();

        appendTermData("Connecting to socket...")

        socket.on("connect", () => {
            appendTermData("Connected");
            appendTermData(`Now monitoring endpoint ${location.origin}/api/monitor`);

            socket.emit("initMonitor");
        });

        socket.on('disconnect', function () {
            appendTermData("Socket Disconnected");
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.disconnect();

            setTermData([]);
        }
    }, []);
    useEffect(() => { // also socket stuff
        socket.on("monDataInit", (d: string) => {
            var data: monDataType[] = JSON.parse(d);
            setTermData(prev => {
                var toAdd: TerminalOutput = [];
                data.forEach((i, count) => {
                    toAdd.push(<TerminalOutput key={prev.length + count}>
                        {i.data}<br />
                        {options.showHeaders ? JSON.stringify(i.headers) : null}
                    </TerminalOutput>)
                })

                return [...prev, toAdd];
            })
        });

        socket.on("monDataUpdate", (d: string) => {
            var data: monDataType = JSON.parse(d);
            console.log(options.showHeaders);
            appendTermData(<>{data.data}<br />{options.showHeaders ? JSON.stringify(data.headers) : null}</>)
        })

        return () => {
            socket.off("monDataInit");
            socket.off("monDataUpdate");
        }
    }, [options])

    function commands(text: string) {
        appendTermData(text, "input");

        const args = text.split(" ");
        switch (args[0]) {
            case "help":
                appendTermData(helpMessage);
                break;
            case "clear":
                setTermData([]);
                break;
            case "set":
                cmdOptionSet(args.slice(1, args.length));
                break;
            case "get":
                break;
            default:
                appendTermData(`Unknown Command: ${args[0]}`);
        }
    }
    function cmdOptionSet(args: string[]) {
        switch (args[0]) {
            case "showheaders":
                if (args[1] == "true") {
                    setOptions({ showHeaders: true });
                } else if (args[1] == "false") {
                    setOptions({ showHeaders: false });
                } else {
                    appendTermData(`Recieved Invalid Input for showheaders: ${args[1]}`);
                    break;
                }
                appendTermData(`showheaders: ${args[1]}`);
                break;
            default:
                appendTermData(`setOption: unknown property ${args[0]}`);
        }
    }

    return (
        <div className="h-100" >
            <Terminal colorMode={ColorMode.Dark} prompt={`$`} onInput={(text) => commands(text)} >
                {termData}
            </Terminal>
        </div>
    )
}
