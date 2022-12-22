export default function Challenges() {
    return <div className="d-flex flex-column justify-content-center text-center" >
        <h1>Challenges</h1>
        <div id="challenges" >
            <Challenge />
            <Challenge />
            <Challenge />
            <Challenge />
            <Challenge />
            <Challenge />
            <Challenge />
        </div>
    </div>
}

function Challenge() {
    return <div className="border rounded d-flex flex-column" >
        <h1>Challenge_title</h1>
        <section>
            challenge_description
        </section>
    </div>
}