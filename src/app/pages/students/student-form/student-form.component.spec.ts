import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models/student.model';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: jest.Mocked<Router>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let activatedRoute: any;

  const mockStudent: Student = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    dateOfBirth: '2000-01-01',
    phoneNumber: '123456789',
    address: '123 Test St'
  };

  beforeEach(async () => {
    const studentServiceMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn()
    };

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn()
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        StudentFormComponent, 
        ReactiveFormsModule
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).overrideComponent(StudentFormComponent, {
      set: {
        templateUrl: undefined,
        styleUrls: []
      }
    }).compileComponents();

    studentService = TestBed.inject(StudentService) as jest.Mocked<StudentService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      fixture = TestBed.createComponent(StudentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in create mode', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.studentForm).toBeDefined();
    });

    it('should have invalid form when required fields are empty', () => {
      expect(component.studentForm.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.studentForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should have valid form when required fields are filled', () => {
      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      });
      expect(component.studentForm.valid).toBeTruthy();
    });

    it('should create student on valid form submission', fakeAsync(() => {
      studentService.create.mockReturnValue(of(mockStudent));
      jest.spyOn(snackBar, 'open').mockReturnValue({} as any);

      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      });

      component.onSubmit();
      tick();

      expect(studentService.create).toHaveBeenCalled();
    }));

    it('should navigate to students list after successful creation', fakeAsync(() => {
      studentService.create.mockReturnValue(of(mockStudent));

      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com'
      });

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/students']);
    }));

    it('should handle error when creating student', fakeAsync(() => {
      const errorResponse = { error: 'Email already exists' };
      studentService.create.mockReturnValue(throwError(() => errorResponse));

      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@test.com'
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(studentService.create).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      studentService.getById.mockReturnValue(of(mockStudent));
      fixture = TestBed.createComponent(StudentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in edit mode when id is present', () => {
      expect(component.isEditMode).toBe(true);
      expect(component.studentId).toBe(1);
    });

    it('should load student data on init in edit mode', fakeAsync(() => {
      tick();
      expect(studentService.getById).toHaveBeenCalledWith(1);
      expect(component.studentForm.value.firstName).toBe('John');
      expect(component.studentForm.value.lastName).toBe('Doe');
      expect(component.studentForm.value.email).toBe('john@test.com');
    }));

    it('should handle error when loading student', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue('999');
      studentService.getById.mockReturnValue(throwError(() => new Error('Not found')));
      
      const newFixture = TestBed.createComponent(StudentFormComponent);
      newFixture.detectChanges();
      tick();

      expect(studentService.getById).toHaveBeenCalledWith(999);
    }));

    it('should update student on valid form submission', fakeAsync(() => {
      studentService.update.mockReturnValue(of(mockStudent));

      component.studentForm.patchValue({
        firstName: 'Jonathan',
        email: 'jonathan@test.com'
      });

      component.onSubmit();
      tick();

      expect(studentService.update).toHaveBeenCalledWith(1, expect.any(Object));
    }));

    it('should navigate to students list after successful update', fakeAsync(() => {
      studentService.update.mockReturnValue(of(mockStudent));

      component.studentForm.patchValue({
        firstName: 'Jonathan'
      });

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/students']);
    }));

    it('should handle error when updating student', fakeAsync(() => {
      const errorResponse = { error: 'Update failed' };
      studentService.update.mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
    }));
  });

  describe('Common functionality', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      fixture = TestBed.createComponent(StudentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should cancel and navigate back to students list', () => {
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/students']);
    });

    it('should format date correctly when submitting', fakeAsync(() => {
      studentService.create.mockReturnValue(of(mockStudent));

      const testDate = new Date('2000-01-15');
      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        dateOfBirth: testDate
      });

      component.onSubmit();
      tick();

      expect(studentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dateOfBirth: '2000-01-15'
        })
      );
    }));

    it('should handle undefined dateOfBirth', fakeAsync(() => {
      studentService.create.mockReturnValue(of(mockStudent));

      component.studentForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        dateOfBirth: null
      });

      component.onSubmit();
      tick();

      expect(studentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dateOfBirth: undefined
        })
      );
    }));
  });
});