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
    registerDate: z.string().nullable().optional(),
    lastLogin: z.string().nullable().optional(),
});

const ProfileUM = z.object({
    username: z.string().min(2).max(64),
    email: z.string().email(),
});

const PasswordUM = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

const UserLoginIM = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});

const HabitIM = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1500).nullable().optional(),
    frequency: z.string().max(50).nullable().optional(),
});

const HabitVM = z.object({
    habitId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    frequency: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

const GoalIM = z.object({
    habitId: z.string().uuid(),
    target: z.number(),
    currentProgress: z.number().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
});

const GoalVM = z.object({
    goalId: z.string().uuid(),
    habitId: z.string().uuid().nullable(),
    target: z.number().nullable(),
    currentProgress: z.number().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    createdAt: z.string().nullable(),
});

const HabitLogIM = z.object({
    habitId: z.string().uuid(),
    logDate: z.string(),
    status: z.string().max(50).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
});

const HabitLogVM = z.object({
    logId: z.string().uuid(),
    habitId: z.string().uuid(),
    logDate: z.string(),
    status: z.string().nullable(),
    notes: z.string().nullable(),
});

const AccountExportVM = z.object({
    exportedAt: z.string(),
    account: UserVM,
    habits: z.array(HabitVM),
    goals: z.array(GoalVM),
    habitLogs: z.array(HabitLogVM),
});

export const schemas = {
    UserIM,
    UserVM,
    UserLoginIM,
    ProfileUM,
    PasswordUM,
    HabitIM,
    HabitVM,
    GoalIM,
    GoalVM,
    HabitLogIM,
    HabitLogVM,
    AccountExportVM,
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
    {
        method: "put",
        path: "/api/User/Profile",
        alias: "putApiUserProfile",
        requestFormat: "json",
        parameters: [{ name: "body", type: "Body", schema: ProfileUM }],
        response: UserVM,
    },
    {
        method: "put",
        path: "/api/User/Password",
        alias: "putApiUserPassword",
        requestFormat: "json",
        parameters: [{ name: "body", type: "Body", schema: PasswordUM }],
        response: z.void(),
    },
    {
        method: "get",
        path: "/api/User/Export",
        alias: "getApiUserExport",
        requestFormat: "json",
        response: AccountExportVM,
    },
    {
        method: "delete",
        path: "/api/User/Account",
        alias: "deleteApiUserAccount",
        requestFormat: "json",
        response: z.void(),
    },
    {
        method: "get",
        path: "/api/Habit",
        alias: "getApiHabit",
        requestFormat: "json",
        response: z.array(HabitVM),
    },
    {
        method: "get",
        path: "/api/Habit/:id",
        alias: "getApiHabitId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: HabitVM,
    },
    {
        method: "post",
        path: "/api/Habit",
        alias: "postApiHabit",
        requestFormat: "json",
        parameters: [{ name: "body", type: "Body", schema: HabitIM }],
        response: HabitVM,
    },
    {
        method: "put",
        path: "/api/Habit/:id",
        alias: "putApiHabitId",
        requestFormat: "json",
        parameters: [
            { name: "id", type: "Path", schema: z.string().uuid() },
            { name: "body", type: "Body", schema: HabitIM },
        ],
        response: HabitVM,
    },
    {
        method: "delete",
        path: "/api/Habit/:id",
        alias: "deleteApiHabitId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: z.void(),
    },
    {
        method: "get",
        path: "/api/Goal",
        alias: "getApiGoal",
        requestFormat: "json",
        response: z.array(GoalVM),
    },
    {
        method: "get",
        path: "/api/Goal/:id",
        alias: "getApiGoalId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: GoalVM,
    },
    {
        method: "post",
        path: "/api/Goal",
        alias: "postApiGoal",
        requestFormat: "json",
        parameters: [{ name: "body", type: "Body", schema: GoalIM }],
        response: GoalVM,
    },
    {
        method: "put",
        path: "/api/Goal/:id",
        alias: "putApiGoalId",
        requestFormat: "json",
        parameters: [
            { name: "id", type: "Path", schema: z.string().uuid() },
            { name: "body", type: "Body", schema: GoalIM },
        ],
        response: GoalVM,
    },
    {
        method: "delete",
        path: "/api/Goal/:id",
        alias: "deleteApiGoalId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: z.void(),
    },
    {
        method: "get",
        path: "/api/HabitLog",
        alias: "getApiHabitLog",
        requestFormat: "json",
        parameters: [
            { name: "habitId", type: "Query", schema: z.string().uuid().optional() },
        ],
        response: z.array(HabitLogVM),
    },
    {
        method: "get",
        path: "/api/HabitLog/:id",
        alias: "getApiHabitLogId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: HabitLogVM,
    },
    {
        method: "post",
        path: "/api/HabitLog",
        alias: "postApiHabitLog",
        requestFormat: "json",
        parameters: [{ name: "body", type: "Body", schema: HabitLogIM }],
        response: HabitLogVM,
    },
    {
        method: "put",
        path: "/api/HabitLog/:id",
        alias: "putApiHabitLogId",
        requestFormat: "json",
        parameters: [
            { name: "id", type: "Path", schema: z.string().uuid() },
            { name: "body", type: "Body", schema: HabitLogIM },
        ],
        response: HabitLogVM,
    },
    {
        method: "delete",
        path: "/api/HabitLog/:id",
        alias: "deleteApiHabitLogId",
        requestFormat: "json",
        parameters: [{ name: "id", type: "Path", schema: z.string().uuid() }],
        response: z.void(),
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