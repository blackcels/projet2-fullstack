import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../services/student.service';
import { CreateStudentRequest, UpdateStudentRequest } from '../../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode = false;
  studentId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: [''],
      phoneNumber: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentId = +id;
      this.loadStudent(this.studentId);
    }
  }

  loadStudent(id: number): void {
    this.isLoading = true;
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
          phoneNumber: student.phoneNumber,
          address: student.address
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.snackBar.open('Erreur lors du chargement de l\'étudiant', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading = true;
      const formValue = this.studentForm.value;
      
      const studentData = {
        ...formValue,
        dateOfBirth: formValue.dateOfBirth 
          ? new Date(formValue.dateOfBirth).toISOString().split('T')[0]
          : undefined
      };

      if (this.isEditMode && this.studentId) {
        this.updateStudent(this.studentId, studentData);
      } else {
        this.createStudent(studentData);
      }
    }
  }

  createStudent(student: CreateStudentRequest): void {
    this.studentService.create(student).subscribe({
      next: () => {
        this.snackBar.open('Étudiant créé avec succès', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Error creating student:', error);
        const message = error.error || 'Erreur lors de la création';
        this.snackBar.open(message, 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  updateStudent(id: number, student: UpdateStudentRequest): void {
    this.studentService.update(id, student).subscribe({
      next: () => {
        this.snackBar.open('Étudiant modifié avec succès', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Error updating student:', error);
        const message = error.error || 'Erreur lors de la modification';
        this.snackBar.open(message, 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/students']);
  }
}