import { useEffect, useState } from "react";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from "react-terminal-ui";

export default function Monitor() {
    const [termData, setTermData] = useState<TerminalOutput[]>([<TerminalOutput>Connecting to server WebSocket...</TerminalOutput>]);

    return (
        <div>
            <Terminal colorMode={ColorMode.Dark} prompt={`$`} onInput={()=>{}} >
                {termData}
            </Terminal>
        </div>
    )
}