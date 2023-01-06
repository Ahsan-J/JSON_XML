import fs from 'fs';
import path from 'path';

const attributePrefix = "$";

const readXMLContentStream = (filePath: string) => new Promise<string>((resolve, reject) => {

    if (!path.isAbsolute(filePath)) return reject(new Error("File path is not absolute"));

    if (path.extname(filePath).toLowerCase() !== '.xml') return reject(new Error(`${path.extname(filePath)} is not a valid XML file`));

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return reject(err);
        return resolve(data);
    })
})

const getAttributes = (attributes: string) => {

    if(!attributes) return null;

    const obj = {};
    const regex = new RegExp(/(?:(\w+)=?("|')([^'"\s]*)\2)*/, 'i');
    
    const s = attributes.trim().split(regex);

    for (let i = 0; i < s.length; i += 4) {
        const key = s[i + 1];
        const value = s[i + 3];
        if(key) obj[`${attributePrefix}${key}`] = value;
    }

    return obj;
}

const processXMLContent = (content: string) => {
    const elementRegex = /<(\w+)(\s+[^>]*)?>(.*?)<\/\1>/;

    const obj = {};
    const s = content.split(new RegExp(elementRegex, 'i'))

    for (let i = 0; i < s.length; i += 4) {
        const key = s[i + 1];
        const attributes = getAttributes(s[i + 2]);
        const value = new RegExp(elementRegex).test(s[i + 3]) ? processXMLContent(s[i + 3]) : s[i + 3];

        // if(attributes) console.log(obj[key],value,key);

        if (!key) continue;

        if (obj[key] && Array.isArray(obj[key])) {
            obj[key].push(value);
            continue;
        }

        if (obj[key] && typeof obj[key] === 'object') {
            obj[key] = [Object.assign({}, obj[key]), value];
            continue;
        }

        if (obj[key]) {
            obj[key] = [Object.assign(obj[key]), value];
            continue;
        }

        obj[key] = value;
    }

    return obj;

}

export const getXMLFromFile = async (filePath: string) => {
    const stream: string = await readXMLContentStream(path.resolve(process.cwd(), filePath));
    const cleanText = stream.replace(/\n/g, '').replace(/\r/g, '').replace(/>\s*</g, '><');
    return processXMLContent(cleanText);
}