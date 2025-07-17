import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://todof.woopear.fr/api/v1';
  // En développement, utiliser le proxy Angular pour éviter CORS
  private readonly DEV_API_URL = '/api/v1';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  
  private get apiUrl(): string {
    // Utiliser le proxy en développement, l'API directe en production
    return window.location.hostname === 'localhost' ? this.DEV_API_URL : this.API_URL;
  }
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 AuthService: Constructor called');
    console.log('🔧 AuthService: API_URL =', this.API_URL);
    console.log('🔧 AuthService: DEV_API_URL =', this.DEV_API_URL);
    console.log('🔧 AuthService: apiUrl utilisée =', this.apiUrl);
    console.log('🔧 AuthService: hostname =', window.location.hostname);
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    this.checkExistingAuth();
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 AuthService.login: Début de la connexion');
    console.log('🔐 AuthService.login: credentials =', { email: credentials.email, password: '***' });
    console.log('🔐 AuthService.login: URL =', `${this.apiUrl}/user/login`);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ AuthService.login: Réponse reçue =', response);
          this.setAuthData(response);
        }),
        catchError(error => {
          console.error('❌ AuthService.login: Erreur =', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    console.log('📝 AuthService.register: Début de l\'inscription');
    console.log('📝 AuthService.register: userData =', { 
      email: userData.email, 
      username: userData.username, 
      password: '***',
      role: userData.role 
    });
    console.log('📝 AuthService.register: URL =', `${this.apiUrl}/user/register`);
    console.log('📝 AuthService.register: Payload complet =', {
      ...userData,
      password: '***'
    });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/register`, userData)
      .pipe(
        tap(response => {
          console.log('✅ AuthService.register: Réponse reçue =', response);
          this.setAuthData(response);
        }),
        catchError(error => {
          console.error('❌ AuthService.register: Erreur =', error);
          console.error('❌ AuthService.register: Status =', error.status);
          console.error('❌ AuthService.register: Error body =', error.error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    console.log('🚪 AuthService.logout: Début de la déconnexion');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    console.log('🚪 AuthService.logout: Données supprimées, redirection vers /login');
    this.router.navigate(['/login']);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    const isValid = !!token && !this.isTokenExpired(token);
    console.log('🔍 AuthService.isLoggedIn: token =', token ? 'existe' : 'absent');
    console.log('🔍 AuthService.isLoggedIn: isValid =', isValid);
    return isValid;
  }

  /**
   * Obtenir le token d'authentification
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('🔑 AuthService.getToken: Lecture du localStorage');
    console.log('🔑 AuthService.getToken: TOKEN_KEY =', this.TOKEN_KEY);
    console.log('🔑 AuthService.getToken: token =', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir les headers avec le token d'authentification
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Rafraîchir le token (si l'API le supporte)
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        tap(response => {
          this.setAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  getUserProfile(): Observable<User> {
    console.log('👤 AuthService.getUserProfile: Récupération du profil utilisateur');
    
    return this.http.get<any>(`${this.apiUrl}/user/profil`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('✅ AuthService.getUserProfile: Réponse reçue =', response);
        // L'API retourne probablement {data: userData}
        const userData = response.data || response;
        console.log('✅ AuthService.getUserProfile: Données utilisateur =', userData);
        return userData;
      }),
      tap(user => {
        // Mettre à jour l'utilisateur actuel si les données sont plus récentes
        this.currentUserSubject.next(user);
        // Sauvegarder en localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError(error => {
        console.error('❌ AuthService.getUserProfile: Erreur =', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Stocker les données d'authentification
   */
  private setAuthData(response: LoginResponse): void {
    console.log('💾 AuthService.setAuthData: Stockage des données auth');
    console.log('💾 AuthService.setAuthData: response =', response);
    console.log('💾 AuthService.setAuthData: response.data =', response.data);
    
    // Analyse de la structure de la réponse
    if (response.data) {
      console.log('💾 AuthService.setAuthData: Clés dans response.data =', Object.keys(response.data));
    }
    
    // Tentative d'extraction du token et de l'utilisateur
    let token: string | null = null;
    let user: any = null;
    
    if (response.data) {
      // Cas direct: token et user dans data
      if ('token' in response.data && response.data.token) {
        token = response.data.token;
        user = response.data.user;
      }
      // Cas alternatif: chercher dans la structure
      else {
        const responseAny = response.data as any;
        if (responseAny.token) {
          token = responseAny.token;
          user = responseAny.user || responseAny;
        }
      }
    }
    
    console.log('💾 AuthService.setAuthData: token extrait =', token ? 'existe' : 'absent');
    console.log('💾 AuthService.setAuthData: user extrait =', user);
    
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      
      // Stocker l'utilisateur s'il existe
      if (user && user.email) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        console.log('✅ AuthService.setAuthData: Utilisateur avec données complètes stocké');
      } else {
        // Si pas d'utilisateur dans la réponse, extraire l'email du token JWT ou utiliser une API profile
        console.log('⚠️ AuthService.setAuthData: Pas de données utilisateur dans la réponse');
        console.log('⚠️ AuthService.setAuthData: Tentative de récupération via token JWT ou API profile');
        
        // Tentative d'extraction de l'email depuis le JWT
        const userFromToken = this.extractUserFromToken(token);
        if (userFromToken) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(userFromToken));
          this.currentUserSubject.next(userFromToken);
          console.log('✅ AuthService.setAuthData: Utilisateur extrait du token JWT');
        } else {
          // En dernier recours, utiliser un objet minimal mais ne pas utiliser de données de test
          const minimalUser = { email: 'utilisateur@inconnu.com', id: 'unknown' };
          localStorage.setItem(this.USER_KEY, JSON.stringify(minimalUser));
          this.currentUserSubject.next(minimalUser);
          console.log('⚠️ AuthService.setAuthData: Utilisateur minimal créé');
        }
      }
      
      console.log('✅ AuthService.setAuthData: Token stocké:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ AuthService.setAuthData: Token non trouvé dans la réponse');
      console.error('❌ AuthService.setAuthData: Structure complète:', JSON.stringify(response, null, 2));
    }
  }

  /**
   * Vérifier l'authentification existante au démarrage
   */
  private checkExistingAuth(): void {
    console.log('🔄 AuthService.checkExistingAuth: Vérification au démarrage');
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);
    
    console.log('🔄 AuthService.checkExistingAuth: token =', token ? 'existe' : 'absent');
    console.log('🔄 AuthService.checkExistingAuth: userStr =', userStr ? 'existe' : 'absent');
    
    if (token && userStr && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ AuthService.checkExistingAuth: Utilisateur restauré =', user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('❌ AuthService.checkExistingAuth: Erreur parsing user =', error);
        this.logout();
      }
    } else {
      console.log('⚠️ AuthService.checkExistingAuth: Pas d\'auth valide, logout');
      this.logout();
    }
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Décoder le token JWT pour vérifier l'expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convertir en millisecondes
      return Date.now() > expiry;
    } catch (error) {
      return true; // Si on ne peut pas décoder le token, on considère qu'il est expiré
    }
  }

  /**
   * Extraire les données utilisateur depuis le token JWT
   */
  private extractUserFromToken(token: string): User | null {
    try {
      console.log('🔍 AuthService.extractUserFromToken: Début extraction JWT');
      
      // Décoder le JWT (partie payload)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ AuthService.extractUserFromToken: Format JWT invalide');
        return null;
      }
      
      const payload = parts[1];
      const decodedPayload = atob(payload);
      const userData = JSON.parse(decodedPayload);
      
      console.log('🔍 AuthService.extractUserFromToken: Payload décodé =', userData);
      
      // Extraire les informations utilisateur du payload
      if (userData.email || userData.sub || userData.username) {
        const extractedUser: User = {
          id: userData.sub || userData.id || userData.user_id || 'unknown',
          email: userData.email || userData.username || 'unknown@unknown.com',
          username: userData.username || userData.name || userData.email || 'Unknown User',
          role: userData.role || 'user'
        };
        
        console.log('✅ AuthService.extractUserFromToken: Utilisateur extrait =', extractedUser);
        return extractedUser;
      } else {
        console.log('⚠️ AuthService.extractUserFromToken: Pas de données utilisateur dans le token');
        return null;
      }
    } catch (error) {
      console.error('❌ AuthService.extractUserFromToken: Erreur lors du décodage:', error);
      return null;
    }
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ AuthService.handleError: Erreur HTTP =', error);
    console.error('❌ AuthService.handleError: status =', error.status);
    console.error('❌ AuthService.handleError: error.error =', error.error);
    
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
      console.error('❌ AuthService.handleError: Erreur côté client =', errorMessage);
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Service non disponible';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }
      console.error('❌ AuthService.handleError: Erreur côté serveur =', errorMessage);
    }
    
    return throwError(errorMessage);
  }
}
