import path from 'path';
import fs from 'fs';

const readJSONContentStream = (filePath: string) => new Promise<string>((resolve, reject) => {

    if (!path.isAbsolute(filePath)) return reject(new Error("File path is not absolute"));

    if (path.extname(filePath).toLowerCase() !== '.json') return reject(new Error(`${path.extname(filePath)} is not a valid JSON file`));

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return reject(err);
        return resolve(data);
    })
})

const processJSONObject = (jsonObject: any, parentKey?: string) => {
    let result = '';

    if (typeof jsonObject === 'object') {
        for (const key in jsonObject) {
            const value = jsonObject[key];

            if (Array.isArray(value)) {
                result = result + `${processJSONObject(value, key)}`;
            } else {
                result = result + `<${parentKey || key}>${processJSONObject(value)}</${parentKey || key}>`;
            }
        }
    }

    if (typeof jsonObject === 'string') {
        result += jsonObject;
    }

    if (typeof jsonObject === 'number' || typeof jsonObject === 'bigint' || typeof jsonObject === 'boolean' || typeof jsonObject === 'symbol') {
        result += jsonObject.toString();
    }

    return result;
}

export const getJSONFromFile = async (filePath: string) => {
    const stream: string = await readJSONContentStream(path.resolve(process.cwd(), filePath));
    const cleanText = stream.replace(/\n/g, '').replace(/\r/g, '').replace(/>\s*</g, '><');
    return processJSONObject(JSON.parse(cleanText));
}