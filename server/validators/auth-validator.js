
const { z } = require("zod");

// Username/password login validation
const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(49, { message: "Username must be less than 50 characters" }),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 129 characters" }),
});

// Signup validation
const signUpSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(49, { message: "Username must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can contain only letters, numbers, and underscores",
    }),

  firstname: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(3, { message: "First name must be at least 3 characters" })
    .max(49, { message: "First name must be less than 50 characters" }),

  lastname: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(3, { message: "Last name must be at least 3 characters" })
    .max(49, { message: "Last name must be less than 50 characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(254, { message: "Email is too long" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(/^\d{10}$/, {
      message: "Phone number must contain exactly 10 digits",
    }),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 129 characters" }),
});

module.exports = { signUpSchema, loginSchema };
