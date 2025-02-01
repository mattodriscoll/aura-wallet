// src/components/AuthComponent.js
import React from 'react';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';

const AuthComponent = () => (
  <AmplifyAuthenticator>
    <AmplifySignUp
      slot="sign-up"
      formFields={[
        { type: "username" },
        { type: "password" },
        { type: "email" }
      ]}
    />
    <AmplifySignIn slot="sign-in" />
  </AmplifyAuthenticator>
);

export default AuthComponent;