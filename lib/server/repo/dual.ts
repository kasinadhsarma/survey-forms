export async function mirrorSafely(
    task: () => Promise<unknown>

): Promise<void> {
    try{
        await task();
    } catch(error){
        console.error ('Firestore mirror failed',error);
    }
}
/**
 * Reads from postgres if the postgres trows
 * the same read runs against run firestor & not found(null) is a real 
 * answer and is not retaired
 */
export async function readWithFallback<T> (
    primary : () => Promise <T>,
    fallback: () => Promise <T>,

) : Promise<T>{
    try{
        return await primary();
    }
    catch(error){
        console.error('postgres read failed using firestore ', error);
        return fallback();
    }
}