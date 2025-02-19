import LoginForm from './form';
import AuthProvider from '../../../../components/SessionProvider';

export default function LoginPage() {
    return (
        <AuthProvider>
            <div className="w-full max-w-xl">
                <LoginForm />
            </div>
        </AuthProvider>
    );
}