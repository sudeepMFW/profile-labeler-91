import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const VALID_USERS = [
    "Aravinth", "Daniel", "Manish", "Afjal",
    "Praveen", "Uday", "Venu", "Vinod"
];
//login page

const Login = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username) {
            toast.error("Please select a user");
            return;
        }

        setIsLoading(true);
        // Store user locally without API call
        localStorage.setItem("user", username);
        toast.success(`Logged in as ${username}`);
        navigate("/");
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Profile Labeler</CardTitle>
                    <CardDescription>Select your name to start labeling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            User Name
                        </label>
                        <Select onValueChange={setUsername} value={username}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {VALID_USERS.map((user) => (
                                    <SelectItem key={user} value={user}>
                                        {user}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02]"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
//just to push that it

export default Login;
