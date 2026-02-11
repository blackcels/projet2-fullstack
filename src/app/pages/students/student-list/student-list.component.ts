import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'actions'];
  isLoading = false;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Erreur lors du chargement des étudiants', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  createStudent(): void {
    this.router.navigate(['/students/new']);
  }

  editStudent(id: number): void {
    this.router.navigate(['/students/edit', id]);
  }

  deleteStudent(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      this.studentService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Étudiant supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  viewStudent(id: number): void {
    this.router.navigate(['/students', id]);
  }
}