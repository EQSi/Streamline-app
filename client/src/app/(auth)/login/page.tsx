import LoginForm from './form';
import AuthProvider from '@/src/components/SessionProvider';

export default function LoginPage() {
    return (
        <AuthProvider>
            <div className="w-full max-w-xl mx-auto p-4">
                <LoginForm />
            </div>
        </AuthProvider>
    );
}