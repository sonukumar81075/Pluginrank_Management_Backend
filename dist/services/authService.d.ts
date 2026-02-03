import mongoose from 'mongoose';
export declare function register(email: string, password: string, name: string): Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
        plan: "free" | "paid";
        createdAt: string | undefined;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}>;
export declare function login(email: string, password: string): Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
        plan: "free" | "paid";
        createdAt: string | undefined;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}>;
export declare function refresh(refreshToken: string): Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
        plan: "free" | "paid";
        createdAt: string | undefined;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}>;
export declare function logout(refreshToken: string | undefined): Promise<void>;
export declare function getMe(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    plan: "free" | "paid";
    createdAt: string | undefined;
} | null>;
export declare function ensureSubscription(userId: mongoose.Types.ObjectId, plan: 'free' | 'paid'): Promise<mongoose.Document<unknown, {}, import("../models/Subscription").ISubscription, {}, {}> & import("../models/Subscription").ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=authService.d.ts.map