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

const keyIsAttribute = (key: string) => {
    return key.slice(0, process.env.ATTRIBUTE_PREFIX?.length || 1) == process.env.ATTRIBUTE_PREFIX;
}

const generateAttributes = (jsonObject: { [key in string]: string | number | boolean }) => {
    return Object.keys(jsonObject).reduce((result, key) => {
        if(keyIsAttribute(key)) {
            const value = jsonObject[key];
            result += ` ${key.slice(1, key.length)}="${value}"`;
        }
        return result;
    }, "");
}

const generateChildren = (jsonObject: { [key in string]: string | number | boolean }) => {
    return Object.keys(jsonObject).reduce((result, key) => {
        if(!keyIsAttribute(key)) {
            const value = jsonObject[key];
            result[key] = value;
        }
        return result;
    }, {});
}

const processJSONObject = (jsonObject: any, parentKey?: string) => {
    let result = '';

    if (typeof jsonObject === 'object') {
        for (const key in jsonObject) {
            const value = jsonObject[key];
            
            if (Array.isArray(value)) {
                result = result + `${processJSONObject(value, key)}`;
            } else {
                const attributes = generateAttributes(value);
                const children = generateChildren(value);

                if(Object.keys(children).length) {
                    result = result + `<${parentKey || key}${attributes}>${processJSONObject(children)}</${parentKey || key}>`;
                } else {
                    result = result + `<${parentKey || key}${attributes}/>`;
                }
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
    return `<?xml version="1.0"?>${processJSONObject(JSON.parse(cleanText))}`;
}