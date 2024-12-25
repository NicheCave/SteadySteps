import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/register-form"; // Adjust the import path as needed

export const Route = createFileRoute("/register")({
    component: RegisterPage,
});

function RegisterPage() {
    return (
        <div className="flex min-h-screen w-screen items-center justify-center p-6">
            <RegisterForm />
        </div>
    );
}
