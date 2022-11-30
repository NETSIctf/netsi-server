import { useContext, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { checkAdmin } from "../../components/LoginChecks";
import { CTFContext } from "./View";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Settings({ show, destroy }: { show: boolean, destroy: () => void }) {
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        checkAdmin().then(val => setAdmin(val));
    }, []);

    return (
        <Modal show={show} onHide={destroy} centered size="xl" >
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column" >
                {admin ?
                    <div>
                        <h3>Delete CTF:</h3>
                        <DeleteCTF />
                    </div>
                    : null}
            </Modal.Body>
        </Modal>
    )
}

function DeleteCTF() {

    const [ctfData, setCtfData] = useContext(CTFContext);

    const [deleteProcess, setDeleteProces] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [deletable, setDeletable] = useState(false);

    const navigate = useNavigate();

    function confirmInput(value: string) {
        setDeleteInput(value);
        if (value == `ctf/${ctfData.name}`) {
            setDeletable(true);
        } else setDeletable(false);
    }

    function confirmed() {
        setDeleting(true);
        axios.post(`/api/ctfs/delete`, { title: ctfData.name })
        .then(resolve => {
            navigate("/ctfs");
        })
        .catch(err => {
            setDeleting(false);
            alert("An error occured while deleting. Check console for details");
            console.error(err);
        })
    }

    return (
        <>
            {!deleteProcess ?
                <Button variant="danger" onClick={() => setDeleteProces(true)} >Delete CTF</Button>
                : <div className="d-flex flex-column" >
                    <em><strong>THIS CTF WIL BE PERMANENTLY AND IRREVERSIBLY DELETED.</strong></em>
                    <span>Please type ctf/{ctfData.name} to confirm:</span>
                    <div className="d-flex align-items-center" >
                        <Form.Control type="text" placeholder={`The name of the CTF:`} className="me-2" value={deleteInput} onChange={(e) => confirmInput(e.target.value)} />
                        <Button variant="danger" onClick={() => confirmed()} disabled={!deletable} >{deleting ? "Deleting..." : "Confirm"}</Button>
                    </div>
                </div>
            }
        </>
    )
}