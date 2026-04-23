import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

// Define Zod schemas for user data
const UserIM = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

const UserVM = z.object({
    userId: z.string().uuid(),
    username: z.string().nullable(),
    email: z.string().nullable(),
});

const UserLoginIM = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});

export const schemas = {
    UserIM,
    UserVM,
    UserLoginIM,
};

// Define API endpoints
const endpoints = makeApi([
    {
        method: "post",
        path: "/api/Auth/Login",
        alias: "postApiAuthLogin",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: UserLoginIM,
            },
        ],
        response: z.void(),
    },
    {
        method: "post",
        path: "/api/Auth/Logout",
        alias: "postApiAuthLogout",
        requestFormat: "json",
        response: z.void(),
    },
    {
        method: "post",
        path: "/api/Auth/Register",
        alias: "postApiAuthRegister",
        requestFormat: "json",
        parameters: [
            {
                name: "body",
                type: "Body",
                schema: UserIM,
            },
        ],
        response: UserVM,
    },
    {
        method: "get",
        path: "/api/Auth/Self",
        alias: "getApiAuthSelf",
        requestFormat: "json",
        response: UserVM,
    },
]);

// Create a Zodios instance with the defined endpoints
export const api = new Zodios("https://localhost:7271", endpoints, {
    axiosConfig: {
        withCredentials: true,
    },
});

// Function to create a Zodios API client with a base URL and optional settings
export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}