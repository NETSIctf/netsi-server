import { useEffect, useState } from "react";
import Terminal, { ColorMode, TerminalInput, TerminalOutput } from "react-terminal-ui";

export default function Monitor() {
    const [termData, setTermData] = useState("");

    useEffect(() => {
        setTermData("")
    }, [])

    return (
        <div>
            <Terminal colorMode={ColorMode.Dark} prompt={`$`} >
                <TerminalOutput>
                    {termData}
                </TerminalOutput>
            </Terminal>
        </div>
    )
}