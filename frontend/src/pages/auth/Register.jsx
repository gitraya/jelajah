import { ArrowLeft, Check, Eye, EyeOff, Globe } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  getErrorMessage,
  postAPIData,
  validatePassword,
  validator,
} from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { login, error: loginError, loading: isLoading } = useAuth();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const query = new URLSearchParams(search);

  const redirectPath = query.get("redirect") || "/trips";
  const defaultEmail = query.get("email") || "";
  const tripId = query.get("tripId") || "";
  const response = query.get("response") || "ACCEPTED"; // Default to ACCEPTED if not provided

  const onSubmit = async (data) => {
    try {
      await postAPIData("/auth/register/", data);
      const isLoggedIn = await login(data.username, data.password);
      if (isLoggedIn) {
        if (tripId) {
          await postAPIData(`/trips/${tripId}/respond-invitation/`, {
            response,
          });
        }
        navigate(redirectPath);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const passwordChecks = validatePassword(watch("password"));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => navigate("/trips/")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Browse
          </button>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Jelajah</h1>
          </div>
          <p className="text-muted-foreground">
            Create your account to start planning
          </p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Join the community of travelers and start your next adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {(error || loginError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  className={errors.username ? "border-destructive" : ""}
                  aria-invalid={errors.username ? "true" : "false"}
                  {...register("username", {
                    required: validator.required,
                    pattern: validator.username,
                  })}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Enter your first name"
                  className={errors.first_name ? "border-destructive" : ""}
                  aria-invalid={errors.first_name ? "true" : "false"}
                  {...register("first_name", {
                    required: validator.required,
                    minLength: validator.minLength(2),
                    maxLength: validator.maxLength(50),
                  })}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Enter your last name"
                  className={errors.last_name ? "border-destructive" : ""}
                  aria-invalid={errors.last_name ? "true" : "false"}
                  {...register("last_name", {
                    required: validator.required,
                    minLength: validator.minLength(2),
                    maxLength: validator.maxLength(50),
                  })}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className={errors.email ? "border-destructive" : ""}
                  aria-invalid={errors.email ? "true" : "false"}
                  defaultValue={defaultEmail}
                  disabled={!!defaultEmail}
                  {...register("email", {
                    required: validator.required,
                    pattern: validator.email,
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                    aria-invalid={errors.password ? "true" : "false"}
                    {...register("password", {
                      required: validator.required,
                      pattern: validator.password,
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}

                {/* Password strength indicator */}
                {watch("password") && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Password requirements:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${
                          passwordChecks.length
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordChecks.length ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        8+ characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordChecks.uppercase
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordChecks.uppercase
                              ? "opacity-100"
                              : "opacity-30"
                          }`}
                        />
                        Uppercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordChecks.lowercase
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordChecks.lowercase
                              ? "opacity-100"
                              : "opacity-30"
                          }`}
                        />
                        Lowercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordChecks.number
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordChecks.number ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="password2"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={
                      errors.password2 ? "border-destructive pr-10" : "pr-10"
                    }
                    aria-invalid={errors.password2 ? "true" : "false"}
                    {...register("password2", {
                      required: validator.required,
                      pattern: validator.password,
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password2 && (
                  <p className="text-sm text-destructive">
                    {errors.password2.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate(`/login${search}`)}
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Benefits */}
        <div className="text-center space-y-2">
          <div className="text-xs text-muted-foreground">What you'll get:</div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>• Plan unlimited trips</span>
            <span>• Share with friends</span>
            <span>• Track expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
