/**
 * Builds the json body every error response uses so we can alwas
 * read error.message and error.code in same place
 */

export function errorBody (code: string, message: string){
    return{
        error:{
            code,
            message,
        },
    };
}