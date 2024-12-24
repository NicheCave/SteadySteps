import * as React from "react";
import { Outlet, createRootRoute, useMatch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, 
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { apiHooks } from "@/client-hooks";
import { schemas } from "@/client";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const { data: user, status } = apiHooks.useGetApiAuthSelf(undefined, {
        retry: false,
    });
    const navigate = useNavigate();
    const isLoginPage = useMatch({ from: "/login", shouldThrow: false });
    const isRegisterPage = useMatch({ from: "/register", shouldThrow: false });

    React.useEffect(() => {
        (async () => {
            if (status === "error" && !isLoginPage && !isRegisterPage) {
                await navigate({ to: "/login" });
            }
        })();
    }, [user, isLoginPage, isRegisterPage, navigate, status]);

    return (
        <React.Fragment>
            <div className="fixed bottom-4 right-4 flex items-center space-x-4">
                <ModeToggle/>
                {user ? <AvatarDropdown user={user} /> : null}
            </div>
            <Toaster/>
            <Outlet/>
        </React.Fragment>
    );
}

function AvatarDropdown({ user }: { user: z.infer<typeof schemas.UserVM> }) {
    const { toast } = useToast(); // Hook to show toast notifications
    const { mutate: logout } = apiHooks.usePostApiAuthLogout();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                // Show success toast on successful logout
                toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out.",
                });
                setIsDialogOpen(false); // Close the dialog
            },
            onError: () => {
                // Show error toast if logout fails
                toast({
                    title: "Logout Failed",
                    description: "An error occurred while trying to log you out.",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 w-12 h-12"
                >
                    <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-800 border-none flex justify-center items-center">
                            <User className="w-6 h-6 text-black dark:text-white" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 z-50 rounded-lg shadow-md px-6 py-4 w-64"
            >
                <DropdownMenuLabel className="px-0 py-2 text-base font-semibold">
                    <p className="text-lg font-bold leading-none">
                        {user.username || "Unknown User"}
                    </p>
                    <p className="text-sm leading-none text-muted-foreground mt-2">
                        {user.email || "No Email"}
                    </p>
                </DropdownMenuLabel>
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will log you out of your account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>
                                Logout
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()} // Prevent auto-closing of the DropdownMenu
                        onClick={() => setIsDialogOpen(true)}
                        className="text-xl text-red-600 hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-3 rounded-md flex justify-center items-center"
                    >
                        Logout
                    </DropdownMenuItem>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
