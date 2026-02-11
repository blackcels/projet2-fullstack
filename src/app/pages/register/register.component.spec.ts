import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const authServiceMock = {
      register: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    
    // Mock window.alert
    global.alert = jest.fn();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('login')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('firstName')).toBeDefined();
    expect(component.registerForm.get('lastName')).toBeDefined();
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const loginControl = component.registerForm.get('login');
    loginControl?.setValue('invalid-email');
    expect(loginControl?.hasError('email')).toBeTruthy();

    loginControl?.setValue('valid@email.com');
    expect(loginControl?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should have valid form when all fields are correctly filled', () => {
    component.registerForm.patchValue({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should call authService.register on valid form submission', () => {
    authService.register.mockReturnValue(of(undefined)); // ✅ CHANGÉ ICI

    component.registerForm.patchValue({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });

    component.onSubmit();

    expect(component.loading).toBe(true);
    expect(authService.register).toHaveBeenCalledWith({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  it('should show alert and navigate on successful registration', fakeAsync(() => { // ✅ CHANGÉ ICI
    authService.register.mockReturnValue(of(undefined)); // ✅ CHANGÉ ICI

    component.registerForm.patchValue({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });

    component.onSubmit();
    tick(); // ✅ CHANGÉ ICI

    expect(global.alert).toHaveBeenCalledWith('Inscription réussie ! Vous pouvez vous connecter.');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should display error message on registration failure', fakeAsync(() => { // ✅ CHANGÉ ICI
    const errorResponse = { error: 'Email already exists' };
    authService.register.mockReturnValue(throwError(() => errorResponse));

    component.registerForm.patchValue({
      login: 'existing@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });

    component.onSubmit();
    tick(); // ✅ CHANGÉ ICI

    expect(component.errorMessage).toBe('Email already exists');
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should display default error message when error has no message', fakeAsync(() => { // ✅ CHANGÉ ICI
    authService.register.mockReturnValue(throwError(() => ({})));

    component.registerForm.patchValue({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });

    component.onSubmit();
    tick(); // ✅ CHANGÉ ICI

    expect(component.errorMessage).toBe('Erreur lors de l\'inscription');
  }));

  it('should reset form on onReset', () => {
    component.registerForm.patchValue({
      login: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    component.submitted = true;
    component.errorMessage = 'Some error';

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.registerForm.value).toEqual({
      login: null,
      password: null,
      firstName: null,
      lastName: null
    });
    expect(component.errorMessage).toBeNull();
  });

  it('should expose form controls via getter', () => {
    const controls = component.form;
    expect(controls['login']).toBe(component.registerForm.get('login'));
    expect(controls['password']).toBe(component.registerForm.get('password'));
    expect(controls['firstName']).toBe(component.registerForm.get('firstName'));
    expect(controls['lastName']).toBe(component.registerForm.get('lastName'));
  });
});
