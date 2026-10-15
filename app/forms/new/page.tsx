import { Suspense } from "react";
import { FormBuilder } from "@/components/FormBuilder";
import { page } from "@/lib/responsive/pattrens/forms";

/**
 * the builder site inside suspanse : its filed array create random id's
 * 
 */

export default function NewFormPage(){
    return(
        <main className={page.main}>
            <h1 className={page.heading}>
                New Form
            </h1>
            <Suspense fallback = {<p className = {page.muted}>
                Loading ...
            </p>}>
            <FormBuilder />
            </Suspense>
        </main>
    )
}