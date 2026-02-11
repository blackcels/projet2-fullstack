import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
      setToken: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router);
    
    // Spy on router methods
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('login')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should have valid form when fields are filled', () => {
    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid form submission', fakeAsync(() => {
    const mockResponse = { token: 'fake-token' };
    authService.login.mockReturnValue(of(mockResponse));

    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(authService.login).toHaveBeenCalledWith({
      login: 'test@example.com',
      password: 'password123'
    });
  }));

  it('should set token and navigate on successful login', fakeAsync(() => {
    const mockResponse = { token: 'fake-token' };
    authService.login.mockReturnValue(of(mockResponse));

    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();
    tick();

    expect(authService.setToken).toHaveBeenCalledWith('fake-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/students');
    expect(component.loading).toBe(false);
  }));

  it('should display error message on login failure', fakeAsync(() => {
    const errorResponse = {
      error: { message: 'Invalid credentials' }
    };
    authService.login.mockReturnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  }));

  it('should display default error message when error has no message', fakeAsync(() => {
    authService.login.mockReturnValue(throwError(() => ({})));

    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Échec de la connexion');
  }));

  it('should reset form on onReset', () => {
    component.loginForm.patchValue({
      login: 'test@example.com',
      password: 'password123'
    });
    component.submitted = true;
    component.errorMessage = 'Some error';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.loginForm.value).toEqual({ login: null, password: null });
    expect(component.errorMessage).toBeNull();
  });

  it('should expose form controls via getter', () => {
    const controls = component.form;
    expect(controls['login']).toBe(component.loginForm.get('login'));
    expect(controls['password']).toBe(component.loginForm.get('password'));
  });
});
