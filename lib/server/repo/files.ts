import { randomUUID} from "crypto";
import { getDb } from "../firestore";

type StoredFiles = {
    name: string;
    type: string;
    data: string
}

/**
 * save files as firestore document and returns random id
 */

export async function saveFile(file:File): Promise<string>{
    const id = randomUUID().replace(/-/g,'');
    const bytes = Buffer.from (await file.arrayBuffer());
    const doc: StoredFiles = {
        name : file.name,
        type : file.type,
        data : bytes.toString(
            'base64'
        ),

    };
    await getDb().collection('files').doc(id).set(doc);
    return id;
}

/**
 * loads the store file or null if the id is unknown
 */

export async function loadFile(id:string){
    const snap = await getDb().collection('files').doc(id).get();
    if (!snap.exists){
        return null;
    }
    const doc = snap.data() as StoredFiles;
    return{
        name: doc.name,
        type: doc.type,
        bytes : Buffer.from (doc.data,'base64'),
    };
}

export async function  fileExists(id:string): Promise<boolean>{
    return ( 
        await getDb().collection('files').doc(id).get()
    ).exists;
}