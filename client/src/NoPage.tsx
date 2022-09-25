export default function NoPage() {
    return (
        <div style={{ textAlign: "center" }}>
            <h1>404</h1>
            <h2>NOBODY EXPECTS THE 404 PAGE</h2>
            <div>
                {window.location.href}
            </div>
        </div>
    )
}