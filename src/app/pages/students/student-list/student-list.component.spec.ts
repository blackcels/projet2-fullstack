import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models/student.model';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: jest.Mocked<Router>;
  let snackBar: jest.Mocked<MatSnackBar>;

  const mockStudents: Student[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phoneNumber: '123456789'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com',
      phoneNumber: '987654321'
    }
  ];

  beforeEach(async () => {
    const studentServiceMock = {
      getAll: jest.fn(),
      delete: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn().mockReturnValue({ 
        onAction: () => of(void 0),
        afterDismissed: () => of({ dismissedByAction: false })
      })
    };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    studentService = TestBed.inject(StudentService) as jest.Mocked<StudentService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;

    global.confirm = jest.fn();
  });

  beforeEach(() => {
    studentService.getAll.mockReturnValue(of(mockStudents));
    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    fixture.detectChanges();
    expect(studentService.getAll).toHaveBeenCalled();
    expect(component.students).toEqual(mockStudents);
    expect(component.isLoading).toBe(false);
  });

  it('should navigate to create student form', () => {
    component.createStudent();
    expect(router.navigate).toHaveBeenCalledWith(['/students/new']);
  });

  it('should navigate to edit student form', () => {
    component.editStudent(1);
    expect(router.navigate).toHaveBeenCalledWith(['/students/edit', 1]);
  });

  it('should navigate to view student', () => {
    component.viewStudent(1);
    expect(router.navigate).toHaveBeenCalledWith(['/students', 1]);
  });

  it('should delete student when confirmed', () => {
    (global.confirm as jest.Mock).mockReturnValue(true);
    studentService.delete.mockReturnValue(of(undefined));
    studentService.getAll.mockReturnValue(of(mockStudents));

    component.deleteStudent(1);

    expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cet étudiant ?');
    expect(studentService.delete).toHaveBeenCalledWith(1);
  });

  it('should not delete student when cancelled', () => {
    (global.confirm as jest.Mock).mockReturnValue(false);

    component.deleteStudent(1);

    expect(studentService.delete).not.toHaveBeenCalled();
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toEqual([
      'id',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'actions'
    ]);
  });
});