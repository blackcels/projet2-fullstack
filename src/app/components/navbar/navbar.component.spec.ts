import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../core/service/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: jest.Mocked<Router>;
  let authService: AuthService;

  beforeEach(async () => {
    const routerMock = {
      navigate: jest.fn()
    };

    const activatedRouteMock = {};

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        AuthService
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as jest.Mocked<Router>;
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have logout method', () => {
    expect(component.logout).toBeDefined();
  });

  it('should remove token and navigate to login on logout', () => {
    localStorage.setItem('token', 'test-token');
    component.isLoggedIn = true;
    
    component.logout();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to login even when no token exists', () => {
    component.logout();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should render toolbar with title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
    expect(compiled.textContent).toContain('Gestion Étudiants');
  });

  it('should render students button when logged in', () => {
    localStorage.setItem('token', 'test-token');
    component.ngOnInit();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button[routerLink="/students"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Étudiants');
  });

  it('should render logout button when logged in', () => {
    localStorage.setItem('token', 'test-token');
    component.ngOnInit();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    const logoutButton = Array.from(buttons).find((btn: any) => 
      btn.textContent.includes('Déconnexion')
    );
    expect(logoutButton).toBeTruthy();
  });

  it('should not render action buttons when not logged in', () => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('should update isLoggedIn on logout', () => {
    localStorage.setItem('token', 'test-token');
    component.isLoggedIn = true;
    
    component.logout();
    
    expect(component.isLoggedIn).toBe(false);
  });
});