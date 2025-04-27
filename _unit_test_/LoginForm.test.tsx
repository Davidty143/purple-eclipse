import '@testing-library/jest-dom'
import { LoginForm } from '../app/(auth)/login/components/LoginForm';
import { render, screen } from '@testing-library/react';

jest.mock('../app/(auth)/login/components/SignInWithGoogleButton', () => {
    return function MockGoogleButton() {
      return <div data-testid="mock-google-button">Continue with Google</div>;
    }
});

describe('Login Form', () => {
    
    test('renders the login form', () =>{
        render(<LoginForm/>);
        const loginForm = screen.getByRole('form');
        expect(loginForm).toBeInTheDocument();
    });

    // test('renders sign in with google button', () => {
    //     render(<LoginForm/>);
    //     expect(screen.getByTestId('mock-google-button')).toBeInTheDocument(); 
    // });
});