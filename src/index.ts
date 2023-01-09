import path from 'path';
import { getJSONFromFile } from './json_to_xml';
import { getXMLFromFile } from './xml_to_json';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const argumentPath = process.argv[2];

    if (!argumentPath) throw new Error("Filepath not specified. use '--path=file-to-xml'");

    const pathExtractor = new RegExp("--path=(.*)");
    const [, filePath] = pathExtractor.exec(argumentPath) || [];

    if (!filePath) throw new Error("Filepath format unspecified. use '--path=file-to-xml'");

    if (path.extname(filePath).toLowerCase() === '.xml') {
        console.log(JSON.stringify(await getXMLFromFile(filePath)));
    }

    if (path.extname(filePath).toLowerCase() === '.json') {
        console.log(await getJSONFromFile(filePath));
    }

}

main();