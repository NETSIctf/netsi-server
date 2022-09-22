import { useEffect, useState } from "react";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from "react-terminal-ui";

import io from "socket.io-client";

const socket = io({ autoConnect: false });

type monDataInitType = { data: string, headers: any };

export default function Monitor() {
    const [termData, setTermData] = useState<(TerminalOutput | TerminalInput)[]>([]);

    const [options, setOptions] = useState();

    useEffect(() => { // SOCKET INIT CODE
        socket.connect();

        setTermData((arr) => [...arr, <TerminalOutput key={arr.length} >Connecting to server WebSocket...</TerminalOutput>]);

        socket.on("connect", () => {
            setTermData((arr) => [...arr, <TerminalOutput key={arr.length} >Connected</TerminalOutput>]);

            socket.emit("initMonitor");
        });

        socket.on('disconnect', function () {
            setTermData((arr) => [...arr, <TerminalOutput key={arr.length} >Socket Disconnected</TerminalOutput>]);
        });

        socket.on("monDataInit", (d: string) => {
            var data: monDataInitType[] = JSON.parse(d);
            setTermData(prev => {
                var toAdd: TerminalOutput = [];
                data.forEach((i, count) => {
                    toAdd.push(<TerminalOutput key={prev.length + count}>
                        {i.data}<br />
                        {JSON.stringify(i.headers)}
                    </TerminalOutput>)
                })


                return [...prev, toAdd];
            })
        });

        socket.on("monDataUpdate", (d: string) => {
            var data: monDataInitType = JSON.parse(d);
            setTermData(prev => [...prev, <TerminalOutput key={prev.length}>{data.data}<br />{JSON.stringify(data.headers)}</TerminalOutput>]);
        })

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("monDataInit");
            socket.off("monDataUpdate");
            socket.disconnect();

            setTermData([]);
        }
    }, []);

    return (
        <div>
            <Terminal colorMode={ColorMode.Dark} prompt={`$`} onInput={() => { }} >
                {termData}
            </Terminal>
        </div>
    )
}