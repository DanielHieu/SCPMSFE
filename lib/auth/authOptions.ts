import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/lib/auth/User";
import { ParkingLot } from "@/types/ParkingLot";

declare module "next-auth" {
    interface Session {
        user: User;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                parkingLotId: { label: "Parking Lot", type: "number" }
            },
            async authorize(credentials) {
                try{
                    console.log("Received credentials:", credentials);

                    if (!credentials?.username || !credentials?.password || !credentials?.parkingLotId) {
                        console.log("Missing required credentials");
                        return null;
                    }
    
                    const { username, password, parkingLotId } = credentials;
                    const nParkingLotId = Number(parkingLotId);
                    
                    // TODO: Implement your actual authentication logic here
                    const response = await fetch(process.env.API_URL + "/api/staff/authorize", {
                        method: "POST",
                        body: JSON.stringify({ username, password, parkingLotId: nParkingLotId }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
    
                    if (!response.ok) {
                        console.log("Authentication failed - invalid credentials");
                        return null;
                    }
                    
                    const data = await response.json();
                    console.log("Authentication successful - data:", data);
    
                    if (!data.success) {
                        console.log("Authentication failed - invalid credentials");
                        return null;
                    }
    
                    const user = data.user;
                    const parkingLot = data.parkingLot;
    
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        parkingLot: parkingLot
                    } as User;
                } catch (error) {
                    console.error("Error authorizing user:", error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const customUser = user as User;
                token.id = customUser.id;
                token.parkingLot = customUser.parkingLot;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    parkingLot: token.parkingLot as ParkingLot,
                };
            }
            return session;
        },
    },
};
