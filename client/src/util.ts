export function parseCookie(str: string) {
    return str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc: any, v: any) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});
}