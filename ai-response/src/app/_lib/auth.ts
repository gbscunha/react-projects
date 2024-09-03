import {AuthOptions} from "next-auth"

export const authOptions: AuthOptions = {
    secret: process.env.NEXT_AUTH_SECRET,
    providers: []
}