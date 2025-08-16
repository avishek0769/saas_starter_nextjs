"use client"
import { useSignUp } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


function SignUp() {
    const { signUp, isLoaded, setActive } = useSignUp()
    const [emailAddress, setEmailAddress] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [pendingVerification, setPendingVerification] = useState<boolean>()
    const [code, setCode] = useState<string>("")
    const [error, setError] = useState<string>()
    const [showPassword, setShowPassword] = useState<boolean>()
    const router = useRouter()

    if (!isLoaded) {
        return (
            <div>Loading....</div>
        )
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) return null;

        try {
            await signUp.create({
                emailAddress,
                password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setPendingVerification(true)
        }
        catch (error: any) {
            console.log(JSON.stringify(error, null, 2))
            setError(error.errors[0].message)
        }
    }

    async function onPressVerify(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) return null;

        try {
            const completeSignup = await signUp.attemptEmailAddressVerification({ code })
            setActive({ session: completeSignup.createdSessionId })
            router.push("/dashboard")
        }
        catch (error: any) {
            console.log(JSON.stringify(error, null, 2))
            setError(error.errors[0].message)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign Up for Todo Master
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!pendingVerification ? (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={onPressVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter verification code"
                                    required
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full">
                                Verify Email
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default SignUp