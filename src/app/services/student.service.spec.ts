import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../models/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/students';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentService]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all students', () => {
      const mockStudents: Student[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          dateOfBirth: '2000-01-01'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@test.com',
          dateOfBirth: '2001-02-02'
        }
      ];

      service.getAll().subscribe(students => {
        expect(students).toEqual(mockStudents);
        expect(students.length).toBe(2);
        expect(students[0].firstName).toBe('John');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudents);
    });

    it('should return empty array when no students exist', () => {
      service.getAll().subscribe(students => {
        expect(students).toEqual([]);
        expect(students.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should retrieve a student by id', () => {
      const mockStudent: Student = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        dateOfBirth: '2000-01-01'
      };

      service.getById(1).subscribe(student => {
        expect(student).toEqual(mockStudent);
        expect(student.id).toBe(1);
        expect(student.firstName).toBe('John');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudent);
    });

    it('should handle error when student not found', () => {
      service.getById(999).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new student', () => {
      const newStudent: CreateStudentRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        dateOfBirth: '2000-01-01'
      };

      const createdStudent: Student = {
        id: 1,
        ...newStudent
      };

      service.create(newStudent).subscribe(student => {
        expect(student).toEqual(createdStudent);
        expect(student.id).toBe(1);
        expect(student.email).toBe('john@test.com');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newStudent);
      req.flush(createdStudent);
    });

    it('should handle validation error', () => {
      const invalidStudent: CreateStudentRequest = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        dateOfBirth: '2000-01-01'
      };

      service.create(invalidStudent).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing student', () => {
      const updateData: UpdateStudentRequest = {
        firstName: 'Jonathan',
        email: 'jonathan@test.com'
      };

      const updatedStudent: Student = {
        id: 1,
        firstName: 'Jonathan',
        lastName: 'Doe',
        email: 'jonathan@test.com',
        dateOfBirth: '2000-01-01'
      };

      service.update(1, updateData).subscribe(student => {
        expect(student).toEqual(updatedStudent);
        expect(student.firstName).toBe('Jonathan');
        expect(student.email).toBe('jonathan@test.com');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedStudent);
    });

    it('should handle error when updating non-existent student', () => {
      const updateData: UpdateStudentRequest = {
        firstName: 'John'
      };

      service.update(999, updateData).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete a student', () => {
      service.delete(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent student', () => {
      service.delete(999).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getByEmail', () => {
    it('should retrieve a student by email', () => {
      const mockStudent: Student = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        dateOfBirth: '2000-01-01'
      };

      service.getByEmail('john@test.com').subscribe(student => {
        expect(student).toEqual(mockStudent);
        expect(student.email).toBe('john@test.com');
      });

      const req = httpMock.expectOne(`${apiUrl}/email/john@test.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudent);
    });

    it('should handle error when student not found by email', () => {
      service.getByEmail('nonexistent@test.com').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/email/nonexistent@test.com`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});