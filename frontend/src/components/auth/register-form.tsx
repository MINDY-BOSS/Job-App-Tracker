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
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/auth.types";
import { FormError } from "./form-error";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", values);
      setToken(data.accessToken);
      setRedirecting(true);
      router.replace(ROUTES.dashboard);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError("email", { message: "An account with this email already exists. Try logging in." });
        setFocus("email");
        return;
      }
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-muted-foreground">Start tracking your job search in minutes.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormError message={serverError} />
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          placeholder="Create a password"
          hint="Use at least 8 characters."
          error={errors.password?.message}
          {...register("password")}
        />
        <SubmitButton loading={isSubmitting || redirecting} loadingText="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
