import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export default async function ProtectedPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin",
                permanent: false,
            },
        };
    }

    return <div>Protected Content</div>;
}
