export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
}