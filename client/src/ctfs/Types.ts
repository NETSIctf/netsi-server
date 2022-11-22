export type challenge = {
  name: string,
  description: string,
  points: number,
  solved_by: string,
  flag: string,
}

export type ctfData = {
  name: string,
  description: string,
  start: string,
  end: string,
  members: string[],
  challenges: challenge[],
}