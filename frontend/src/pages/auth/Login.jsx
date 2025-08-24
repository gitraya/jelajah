import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { validator } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, error } = useAuth();

  const redirectPath = new URLSearchParams(search).get("redirect") || "/trips";

  const onSubmit = async (data) => {
    const isLoggedIn = await login(data.username, data.password);
    if (isLoggedIn) navigate(redirectPath);
  };

  return (
    <div className="container py-8 px-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Login to Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username" className="mb-2">
                Username*
              </Label>
              <Input
                id="username"
                aria-invalid={errors.username ? "true" : "false"}
                {...register("username", {
                  required: validator.required,
                  pattern: validator.username,
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="mb-1">
                Password*
              </Label>
              <div className="mb-2 text-xs *:text-muted-foreground">
                <small>
                  Password must be at least 8 characters long and contain at
                  least one uppercase letter, one lowercase letter, and one
                  number.
                </small>
              </div>
              <Input
                id="password"
                type="password"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password", {
                  required: validator.required,
                  pattern: validator.password,
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <Button type="submit">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
