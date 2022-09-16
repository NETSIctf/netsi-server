import { XTerm } from "xterm-for-react";
import React, { createRef, useEffect, useRef } from "react";

export default class Monitor extends React.Component {
    xtermRef = React.createRef<XTerm>()

    constructor(props: any) {
        super(props)
        // Create a ref
        
        this.state = {
            input: "",
        }
    }

    componentDidMount() {
        // Add the starting text to the terminal
        this.xtermRef.current?.terminal.writeln(
            "Please enter any string then press enter:"
        );
        this.xtermRef.current?.terminal.write("echo> ");
    }

    render() {
        return (
            <>
                {/* Create a new terminal and set it's ref. */}
                <XTerm
                    ref={this.xtermRef}
                    onData={(data) => {
                        const code = data.charCodeAt(0);
                        // If the user hits empty and there is something typed echo it.
                        if (code === 13 && this.state.input.length > 0) {
                            this.xtermRef.current?.terminal.write(
                                "\r\nYou typed: '" + this.state.input + "'\r\n"
                            );
                            this.xtermRef.current?.terminal.write("echo> ");
                            this.setState({input: ""})
                        } else if (code < 32 || code === 127) { // Disable control Keys such as arrow keys
                            return;
                        } else { // Add general key press characters to the terminal
                            this.xtermRef.current?.terminal.write(data);
                            this.setState({input: this.state.input + data})
                        }
                    }}
                />
            </>
        )
    }
}

/*export default function Monitor() {
    const term = useRef<XTerm>(null);

    useEffect(() => {
        term.current?.terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
    }, [])
    
    function termInput(data: string) { 
        //console.log(data);
        term.current?.terminal.write(data);
        console.log(term.current?.terminal.buffer);
    }

    return (
        <div>
            <XTerm ref={term} onData={d => termInput(d)} options={{theme: {background: "#202b33", foreground: "#f5f8fa"}, lineHeight: 3}} />
        </div>
    )
}*/