import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginRequest, RegisterRequest, AuthResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
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
    it('should send POST request with credentials', () => {
      const credentials: LoginRequest = {
        login: 'test@example.com',
        password: 'password123'
      };
      const mockResponse: AuthResponse = { token: 'fake-jwt-token' };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.token).toBe('fake-jwt-token');
      });

      const req = httpMock.expectOne('/api/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const credentials: LoginRequest = {
        login: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('/api/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should send POST request with user data', () => {
      const userData: RegisterRequest = {
        login: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      service.register(userData).subscribe();

      const req = httpMock.expectOne('/api/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush({});
    });
  });

  describe('Token management', () => {
    it('should set token in localStorage', () => {
      const token = 'test-token-123';
      service.setToken(token);
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should get token from localStorage', () => {
      const token = 'test-token-123';
      localStorage.setItem('token', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should remove token from localStorage on logout', () => {
      localStorage.setItem('token', 'test-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false after logout', () => {
      localStorage.setItem('token', 'test-token');
      service.logout();
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});