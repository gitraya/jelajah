import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage, postAPIData, validator } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, error: loginError } = useAuth();
  const [error, setError] = useState(null);

  const redirectPath = new URLSearchParams(search).get("redirect") || "/trips";

  const onSubmit = async (data) => {
    try {
      await postAPIData("/auth/register/", data);
      const isLoggedIn = await login(data.username, data.password);
      if (isLoggedIn) navigate(redirectPath);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  return (
    <div className="container py-8 px-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
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
              <Label htmlFor="email" className="mb-2">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email", {
                  required: validator.required,
                  pattern: validator.email,
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="first_name" className="mb-2">
                First Name*
              </Label>
              <Input
                id="first_name"
                type="text"
                aria-invalid={errors.first_name ? "true" : "false"}
                {...register("first_name", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(50),
                })}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name" className="mb-2">
                Last Name
              </Label>
              <Input
                id="last_name"
                type="text"
                aria-invalid={errors.last_name ? "true" : "false"}
                {...register("last_name", {
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(50),
                })}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.last_name.message}
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

            <div>
              <Label htmlFor="password2" className="mb-2">
                Confirm Password*
              </Label>
              <Input
                id="password2"
                type="password"
                aria-invalid={errors.password2 ? "true" : "false"}
                {...register("password2", {
                  required: validator.required,
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
              />
              {errors.password2 && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password2.message}
                </p>
              )}
            </div>

            {(error || loginError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{error || loginError}</AlertTitle>
              </Alert>
            )}

            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
