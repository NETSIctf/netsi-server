import sqlite3 from "sqlite3";

export function updateMembers(members:string[], ctfName: string, db: sqlite3.Database): [number, string]{
  /*
      update members in db
      args: members: string[], ctfName: string - members to update, ctf name
      returns: [number, string] - [status code, message]
  */

  let returnVal: [number, string] = [200, "success"];
  db.run("UPDATE ctfs SET members = ? WHERE name = ?", [members.join(","), ctfName], (err) => {
    if (err) {
      console.error(err);
      returnVal = [500, "server error"];
      return;
    }
    returnVal = [200, "success"];
    return;
  })

  // if members are empty, set members to null
  if (members.length === 0) {
    db.run("UPDATE ctfs SET members = ? WHERE name = ?", [null, ctfName], (err) => {
      if (err) {
        console.error(err);
        returnVal = [500, "server error"];
        return;
      }
      returnVal = [200, "success"];
      return;
    })
  }

  return returnVal;
}

export function serverErr(err: Error | null, res: any) {
  // handle server errors
  if (err) {
    console.error(err, res);
    res.status(500)
    res.end("server error");
    return true;
  }

  return false;
}

export function CTFNotFoundErr(row: any, res: any) {
  // handle ctf not found errors
  if (!row) {
    res.status(404);
    res.end("ctf not found");
    return true;
  }

  return false;
}

export function challengeNotFoundErr(row: any, res: any) {
  // handle challenge not found errors
  if (!row) {
    res.status(404);
    res.end("challenge not found");
    return true;
  }

  return false;
}

export function nameTooLongErr(err: any, res: any) {
  const maxNameLength = 64;
  /* TODO fix
  if (err.message == `CHECK constraint failed: length(name) < ${maxNameLength + 1}`) {
    res.status(400);
    res.end(`Name cannot be greater than ${maxNameLength} characters`);
    return true;
  }*/

  return false;
}

export function descriptionTooLongErr(err: any, res: any) {
  /* TODO fix
  const maxDescriptionLength = 1024;
  console.log("DEBUG err message", err)
  if (err.message == `CHECK constraint failed: length(description) < ${maxDescriptionLength + 1}`) {
    res.status(400);
    res.end(`Description cannot be greater than ${maxDescriptionLength} characters`);
    return true;
  }*/

  return false;
}

export function pointsMustBeGreaterThanZeroErr(err: any, res: any) {
  /* TODO fix
  console.log("DEBUG err message", err);
  if (err.message.includes(`CHECK constraint failed: points >= 0`)) {
    res.status(400);
    res.end("Points must be greater or equal to 0");
    return true;
  }*/
  return false
}

export function success(res: any) {
  // handle success
  res.status(200);
  res.end("success");
  return true;
}
