import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from "@/components/login-form"
export const Route = createFileRoute('/login')({
    component: LoginPage,
});

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-muted p-6">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm/>
            </div>
        </div>
    )
}

