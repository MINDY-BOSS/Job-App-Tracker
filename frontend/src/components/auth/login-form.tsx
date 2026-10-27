"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { api, getApiErrorMessage } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/auth.types";
import { FormError } from "./form-error";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", values);
      setToken(data.accessToken);
      setRedirecting(true);
      router.replace(ROUTES.dashboard);
    } catch (error) {
      setServerError(
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Incorrect email or password."
          : getApiErrorMessage(error),
      );
    }
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-muted-foreground">Log in to pick up where you left off.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormError message={serverError} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <SubmitButton loading={isSubmitting || redirecting} loadingText="Logging in…">
          Log in
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to JobTracker?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
