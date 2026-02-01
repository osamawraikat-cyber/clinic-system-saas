'use server'

import { revalidatePath } from 'next/cache'

export async function revalidatePatientsPath() {
    revalidatePath('/patients')
    revalidatePath('/dashboard') // Also update dashboard counts
}
