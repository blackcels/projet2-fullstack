import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';

// Mock NavbarComponent
@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '<div></div>'
})
class MockNavbarComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    const mockRouter = {
      url: '/students',
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, MockNavbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    })
    .overrideComponent(AppComponent, {
      remove: { imports: [NavbarComponent] },
      add: { imports: [MockNavbarComponent] }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have the 'etudiant-frontend' title", () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('etudiant-frontend');
  });
});
