import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, Heading, RadioGroupField, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';;
import { View, Radio } from '@aws-amplify/ui-react';
import { usePathname, useRouter } from 'next/navigation';




//https://docs.amplify.aws/javascript/build-a-backend/auth/use-existing-cognito-resources/

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
        },
    },
});

const components = {
    Header() {
        return (
            <View className="mt-4 mb-7">
                <Heading level={3} className="!text-2xl !font-bold">
                    Serendib
                    <span className='text-secondary-500 fonrt-light hover:!text-primary-300'>
                        Estate
                    </span>
                </Heading>
                <p className='text-muted-foreground mt-2'>
                    <span className='font-bold'>Welcome! </span>
                    Please sign in to continue.
                </p>

            </View>
        )
    },
    SignIn: {
        Footer() {
            const { toSignUp } = useAuthenticator();
            return (
                <View className="text-center mt-4">
                    <p className='text-muted-foreground'>
                        Don&apos;t have an account? {' '}

                        <button
                            className='text-text-primary hover:underline bg-transparent border-none p-0'
                            onClick={toSignUp}>
                            Sign up here
                        </button>
                    </p>
                </View>
            )
        }
    },
    SignUp: {
        FormFields() {
            const { validationErrors } = useAuthenticator();
            return (
                <>
                    <Authenticator.SignUp.FormFields />
                    <RadioGroupField
                        legend="Role"
                        name="custom:role"
                        errorMessage={validationErrors['custom:role']}
                        hasError={!!validationErrors['custom:role']}
                        isRequired
                    >
                        <Radio value="tenant">Tenant</Radio>
                        <Radio value="manager">Manager</Radio>
                    </RadioGroupField>
                </>
            )
        },
        Footer() {
            const { toSignIn } = useAuthenticator();
            return (
                <View className="text-center mt-4">
                    <p className='text-muted-foreground'>
                        Already have an account? {' '}

                        <button
                            className='text-text-primary hover:underline bg-transparent border-none p-0'
                            onClick={toSignIn}>
                            Sign in
                        </button>
                    </p>
                </View>
            )
        }
    }
}

const FormFields = {
    signIn: {
        username: {
            placeholder: 'Enter your email',
            isRequired: true,
            label: 'Email',
        },
        password: {
            placeholder: 'Enter your password',
            isRequired: true,
            label: 'Password',
        },
    },
    signUp: {
        username: {
            order: 1,
            placeholder: 'Choose a username',
            isRequired: true,
            label: 'Username',
        },
        email: {
            order: 2,
            placeholder: 'Enter your email address',
            isRequired: true,
            label: 'Email',
        },
        password: {
            order: 3,
            placeholder: 'Create a password',
            isRequired: true,
            label: 'Password',
        },
        confirm_password: {
            order: 4,
            placeholder: 'Confirm your password',
            isRequired: true,
            label: 'Confirm Password',
        },
    },
}


const Auth = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthenticator((context) => [context.user]);
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname.match(/^\/(signin|signup)$/); // check if the current path is signin or signup
    const isDashboardPage = pathname.startsWith("/manager") || pathname.startsWith("/tenants"); // check if the current path is dashboard

    
    //redirect authenticated users from away from auth pages
    useEffect(() => {
        if (user && isAuthPage) {
            router.push('/'); 
        }
    }, [user, isAuthPage, router]);

    //Allow accesse to public pages without authentication
    if (!isAuthPage && !isDashboardPage) {
        return <>{children}</>;
    }


    return (
        <div className='h-full'>

            <Authenticator
            initialState={pathname.includes('signup') ? 'signUp' : 'signIn'}
                components={components}
                formFields={FormFields}
            >
                {() => <>{children}</>}
            </Authenticator>
        </div>
    );
}

export default Auth;