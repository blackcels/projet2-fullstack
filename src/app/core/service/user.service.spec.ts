import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, AuthService } from './user.service';
import { Register } from '../models/Register';
import { AuthRequest, AuthResponse } from './auth.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user', () => {
      const newUser: Register = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'john@test.com',
        password: 'password123'
      };

      service.register(newUser).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush({ message: 'User registered successfully' });
    });

    it('should handle registration error', () => {
      const newUser: Register = {
        firstName: 'John',
        lastName: 'Doe',
        login: 'existing@test.com',
        password: 'password123'
      };

      service.register(newUser).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('/api/auth/register');
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });
  });
});

describe('AuthService (core)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and return token', () => {
      const authRequest: AuthRequest = {
        login: 'test@example.com',
        password: 'password123'
      };
      const mockResponse: AuthResponse = { token: 'jwt-token-123' };

      service.login(authRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.token).toBe('jwt-token-123');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(authRequest);
      req.flush(mockResponse);
    });
  });

  describe('Token management', () => {
    it('should set token in localStorage', () => {
      const token = 'test-token';
      service.setToken(token);
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should get token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      service.removeToken();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove token', () => {
      localStorage.setItem('auth_token', 'test-token');
      service.logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});
