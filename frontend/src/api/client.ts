import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Student {
  roll: number;
  name: string;
  balance: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  available: number; // 1 = yes, 0 = no
}

export interface Issue {
  id: number;
  student_roll: number;
  student_name: string;
  book_id: number;
  book_title: string;
  isbn: string;
  issue_date: string;
  return_date: string | null;
  fine: number;
  status: "issued" | "returned";
}

export interface FineSummary {
  id: number;
  student_roll: number;
  student_name: string;
  book_title: string;
  issue_date: string;
  balance: number;
  fine: number;
}

// ── Students ──────────────────────────────────────────────────────────────────
export const getStudents = () => api.get<Student[]>("/students").then((r) => r.data);
export const getStudent  = (roll: number) => api.get<Student>(`/students/${roll}`).then((r) => r.data);
export const getStudentIssues = (roll: number) => api.get<Issue[]>(`/students/${roll}/issues`).then((r) => r.data);
export const createStudent = (data: Omit<Student, "balance"> & { balance?: number }) =>
  api.post<Student>("/students", data).then((r) => r.data);
export const updateStudent = (roll: number, data: Partial<Omit<Student, "roll">>) =>
  api.put<Student>(`/students/${roll}`, data).then((r) => r.data);
export const deleteStudent = (roll: number) =>
  api.delete(`/students/${roll}`).then((r) => r.data);

// ── Books ─────────────────────────────────────────────────────────────────────
export const getBooks = (params?: { available?: boolean; search?: string }) =>
  api.get<Book[]>("/books", { params }).then((r) => r.data);
export const createBook = (data: Omit<Book, "id">) =>
  api.post<Book>("/books", data).then((r) => r.data);
export const updateBook = (id: number, data: Partial<Omit<Book, "id">>) =>
  api.put<Book>(`/books/${id}`, data).then((r) => r.data);
export const deleteBook = (id: number) =>
  api.delete(`/books/${id}`).then((r) => r.data);

// ── Issues ────────────────────────────────────────────────────────────────────
export const getIssues = (params?: { status?: string; student_roll?: number }) =>
  api.get<Issue[]>("/issues", { params }).then((r) => r.data);
export const issueBook = (student_roll: number, book_id: number) =>
  api.post<Issue>("/issues", { student_roll, book_id }).then((r) => r.data);
export const returnBook = (issueId: number) =>
  api.post<Issue & { message: string }>(`/issues/${issueId}/return`).then((r) => r.data);
export const getFinesSummary = () =>
  api.get<FineSummary[]>("/issues/fines/summary").then((r) => r.data);
