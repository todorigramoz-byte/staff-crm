export type JobStatus = "active" | "closed" | "draft";
export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type View =
  | "dashboard"
  | "leads"
  | "clients"
  | "invoices"
  | "bills"
  | "tasks"
  | "products"
  | "emails"
  | "settings";

export type { Client, Invoice, Appointment, Task } from "@animaapp/playground-react-sdk";
