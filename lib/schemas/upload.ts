import {z} from "zod";

export const Allowed_FILE_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/plain',
] as const;

/** A file id is 32 lowercase hex charcters (a UUID without dashes) **/

export const  FILE_ID_PATTERN = /^[a-f0-9]{32}$/;

export const fileIdSchema = z
.string()
.regex(FILE_ID_PATTERN, 'Invalid file id');
export const fileIdParamSchema = z.object({
    id: fileIdSchema
});
export const uploadResultSchema = z.object({
    id :  fileIdSchema,
});

export type UploadResult = z.infer<typeof uploadResultSchema>;
