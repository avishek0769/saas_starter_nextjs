import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function SignIn() {
    const { isLoaded, signIn, setActive } = useSignIn()
    const [emailAddress, setEmailAddress] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    if (!isLoaded) {
        return <div>Loading.....</div>
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) return;

        try {
            const result = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if(result.status == "complete") {
                setActive({ session: result.createdSessionId })
                router.push("/dashboard")
            }
            if(result.status != "complete") {
                console.error(JSON.stringify(result, null, 2));
            }
        }
        catch (error: any) {
            console.error("error", error.errors[0].message);
            setError(error.errors[0].message);

        }
    }

    return (
        <div>SignIn</div>
    )
}

export default SignIn