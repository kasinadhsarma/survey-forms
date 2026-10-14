import {cert,getApps, initializeApp} from 'firebase-admin/app';
import {getFirestore, type Firestore} from 'firebase-admin/firestore'
import { getFirebaseEnv } from './env';


/**
 * returning the firestore database of admin app
 * first use get apps make safe when hot relaoading re runs
 * module becuase the app already exist then
 * why the replace a private key stored in .env has its new lines
 * written as the two charcters
 */

export function getDb():Firestore{
    if(getApps().length===0){
        const env = getFirebaseEnv();

        initializeApp({
            credential:cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n'
                ),
            }),
        });
    }
    return getFirestore();
}