import { getServerSession } from "next-auth";
import { tokenService } from "./token-service";
import { authOptions } from "../auth";

export { tokenService } from "./token-service";
export * from "./token-constants";
export * from "./token-permissions";
export * from "./token-validator";
export * from "../auth";

export async function getSession() {
    return getServerSession(authOptions);
}
