import { catalogClient, extractData } from "../client";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/api";

/**
 * Create a new user
 */
export async function createUser(request: CreateUserRequest): Promise<User> {
  const formData = new FormData();
  if (request.email) formData.append("email", request.email);
  formData.append("firebase_id", request.firebase_id);
  if (request.first_name) formData.append("first_name", request.first_name);
  if (request.last_name) formData.append("last_name", request.last_name);
  if (request.mobile) formData.append("mobile", request.mobile);
  if (request.user_name) formData.append("user_name", request.user_name);
  if (request.photo_url) formData.append("photo_url", request.photo_url);

  const response = await catalogClient.post<{ data: User }>(
    "/api/v1/users",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return extractData(response);
}

/**
 * Get user by Firebase ID
 */
export async function getUserByFirebaseId(
  firebaseId: string
): Promise<User | null> {
  const response = await catalogClient.get<{ data: User | null }>(
    `/api/v1/users/users/${firebaseId}`
  );
  return extractData(response);
}

/**
 * Update user
 */
export async function updateUser(
  firebaseId: string,
  request: UpdateUserRequest
): Promise<User> {
  const response = await catalogClient.put<{ data: User }>(
    `/api/v1/users/users/${firebaseId}`,
    request
  );
  return extractData(response);
}

/**
 * Delete user
 */
export async function deleteUser(firebaseId: string): Promise<void> {
  await catalogClient.delete(`/api/v1/users/users/${firebaseId}`);
}
