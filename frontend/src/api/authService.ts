import Cookies from 'js-cookie';
import { api } from '@/api/interceptor';
import { 
    ApiResponse, 
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    RefreshTokenRequest,
    User
} from '@/types';

class AuthService {
    public async registerUser(user: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/register', 'POST', user);
        if (response.access_token) {
            Cookies.set('access_token', response.access_token, { expires: 1 });
            Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
        }
        return response;

    }

    public async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/login', 'POST', credentials);
        console.log(response);
        if (response.access_token) {
            Cookies.set('access_token', response.access_token, { expires: 1 });
            Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
        }
        return response;

    }

    public async getUserByToken(accessToken: string): Promise<ApiResponse<User> | null> {
        if (!accessToken) {
            return null;
        }
        return api.fetchRequest('/api/auth/me', 'GET', null, true);
    }

    public async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/refresh', 'POST', { token: refreshToken });
        if (response.access_token) {
            Cookies.set('access_token', response.access_token, { expires: 1 });
            Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
        }
        return response;

    }

    public async logout(refreshToken: string): Promise<ApiResponse<void>> {
        const request: RefreshTokenRequest = { token: refreshToken };
        return api.fetchRequest('/api/auth/logout', 'POST', request);
    }
}

export const authService = new AuthService();