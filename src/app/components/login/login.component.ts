import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  selectedTabIndex = 0;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    console.log('🎯 LoginComponent: Constructor called');
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    console.log('✅ LoginComponent: loginForm créé');

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: LoginComponent.passwordMatchValidator });
    console.log('✅ LoginComponent: registerForm créé');
  }

  ngOnInit(): void {
    console.log('🚀 LoginComponent.ngOnInit: Composant initialisé');
    
    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      console.log('🔄 LoginComponent.ngOnInit: Utilisateur déjà connecté, redirection vers /tasks');
      this.router.navigate(['/tasks']);
    } else {
      console.log('🔄 LoginComponent.ngOnInit: Utilisateur non connecté, affichage du formulaire');
    }
  }

  onSubmit(): void {
    console.log('📝 LoginComponent.onSubmit: Début de la soumission');
    console.log('📝 LoginComponent.onSubmit: Form valid =', this.loginForm.valid);
    console.log('📝 LoginComponent.onSubmit: Form values =', { 
      email: this.loginForm.value.email, 
      password: '***' 
    });
    
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      console.log('🔄 LoginComponent.onSubmit: Début de la connexion...');
      
      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('✅ LoginComponent.onSubmit: Connexion réussie =', response);
          this.isLoading = false;
          this.snackBar.open('Connexion réussie !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Vérifier que l'utilisateur est bien connecté avant redirection
          console.log('🔄 LoginComponent.onSubmit: Vérification du statut de connexion...');
          console.log('🔄 LoginComponent.onSubmit: isLoggedIn =', this.authService.isLoggedIn());
          console.log('🔄 LoginComponent.onSubmit: Token =', this.authService.getToken() ? 'existe' : 'absent');
          
          // Petite attente pour s'assurer que le localStorage est mis à jour
          setTimeout(() => {
            console.log('🔄 LoginComponent.onSubmit: Redirection vers /tasks (après vérification)');
            console.log('🔄 LoginComponent.onSubmit: isLoggedIn final =', this.authService.isLoggedIn());
            this.router.navigate(['/tasks']);
          }, 100);
        },
        error: (error) => {
          console.error('❌ LoginComponent.onSubmit: Erreur de connexion =', error);
          this.isLoading = false;
          this.snackBar.open(error, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.log('⚠️ LoginComponent.onSubmit: Formulaire invalide ou en cours de chargement');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName === 'email' ? 'Email' : 'Mot de passe'} requis`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }

  getRegisterErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.hasError('required')) {
      const labels: { [key: string]: string } = {
        'email': 'Email',
        'username': 'Nom',
        'password': 'Mot de passe',
        'confirmPassword': 'Confirmation du mot de passe'
      };
      return `${labels[fieldName]} requis`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      if (fieldName === 'password') {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
      if (fieldName === 'username') {
        return 'Le nom doit contenir au moins 2 caractères';
      }
    }
    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  onRegister(): void {
    console.log('📝 LoginComponent.onRegister: Début de l\'inscription');
    console.log('📝 LoginComponent.onRegister: Form valid =', this.registerForm.valid);
    console.log('📝 LoginComponent.onRegister: Form values =', { 
      email: this.registerForm.value.email, 
      username: this.registerForm.value.username,
      password: '***' 
    });
    
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      console.log('🔄 LoginComponent.onRegister: Début de l\'inscription...');
      
      const userData: RegisterRequest = {
        email: this.registerForm.value.email,
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        role: 'user' // Valeur par défaut pour les nouveaux utilisateurs
      };
      
      console.log('📤 LoginComponent.onRegister: Données envoyées =', {
        ...userData,
        password: '***'
      });

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('✅ LoginComponent.onRegister: Inscription réussie =', response);
          this.isLoading = false;
          this.snackBar.open('Compte créé avec succès !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          console.log('🔄 LoginComponent.onRegister: Redirection vers /tasks');
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('❌ LoginComponent.onRegister: Erreur d\'inscription =', error);
          this.isLoading = false;
          this.snackBar.open(error, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.log('⚠️ LoginComponent.onRegister: Formulaire invalide ou en cours de chargement');
      this.markRegisterFormGroupTouched();
    }
  }

  private markRegisterFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private static passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
