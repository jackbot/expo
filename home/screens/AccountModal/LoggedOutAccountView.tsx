import { borderRadius, spacing } from '@expo/styleguide-native';
import { View, Text, Spacer, useExpoTheme } from 'expo-dev-client-components';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import url from 'url';

import Analytics from '../../api/Analytics';
import ApolloClient from '../../api/ApolloClient';
import Config from '../../api/Config';
import { useDispatch } from '../../redux/Hooks';
import SessionActions from '../../redux/SessionActions';
import { useAccountName } from '../../utils/AccountNameContext';

export function LoggedOutAccountView() {
  const dispatch = useDispatch();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [authenticationError, setAuthenticationError] = React.useState<string | null>(null);
  const mounted = React.useRef<boolean | null>(true);
  const theme = useExpoTheme();
  const { setAccountName } = useAccountName();

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const _handleSignInPress = async () => {
    await _handleAuthentication('login', Analytics.events.USER_LOGGED_IN);
  };

  const _handleSignUpPress = async () => {
    await _handleAuthentication('signup', Analytics.events.USER_CREATED_ACCOUNT);
  };

  const _handleAuthentication = async (urlPath: string, analyticsEvent: string) => {
    if (isAuthenticating) {
      return;
    }
    setAuthenticationError(null);
    setIsAuthenticating(true);

    try {
      const redirectBase = 'expauth://auth';
      const authSessionURL = `${
        Config.website.origin
      }/${urlPath}?app_redirect_uri=${encodeURIComponent(redirectBase)}`;
      const result = await WebBrowser.openAuthSessionAsync(authSessionURL, redirectBase, {
        /** note(brentvatne): We should disable the showInRecents option when
         * https://github.com/expo/expo/issues/8072 is resolved. This workaround
         * prevents the Chrome Custom Tabs activity from closing when the user
         * switches from the login / sign up form to a password manager or 2fa
         * app. The downside of using this flag is that the browser window will
         * remain open in the background after authentication completes. */
        showInRecents: true,
      });

      if (!mounted.current) {
        return;
      }

      if (result.type === 'success') {
        const resultURL = url.parse(result.url, true);
        const sessionSecret = resultURL.query['session_secret'] as string;
        // usernameOrEmail is always the username https://github.com/expo/universe/blob/d3332f3b48964853191c5035fceae37aeebb1e64/server/website/scenes/_app/helpers.tsx#L119
        const usernameOrEmail = resultURL.query['username_or_email'] as string;

        if (!sessionSecret) {
          throw new Error('session_secret is missing in auth redirect query');
        }

        const trackingOpts = {
          usernameOrEmail,
        };
        Analytics.identify(null, trackingOpts);
        Analytics.track(analyticsEvent, trackingOpts);

        await ApolloClient.resetStore();
        dispatch(
          SessionActions.setSession({
            sessionSecret: decodeURIComponent(sessionSecret),
          })
        );
        setAccountName(usernameOrEmail);
      }
    } catch (e) {
      // TODO(wschurman): Put this into Sentry
      console.error({ e });
      setAuthenticationError(e.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View bg="default" padding="medium">
      <Text color="secondary" type="InterRegular" style={{ lineHeight: 20 }}>
        Log in or create an account to access your projects, view local development servers, and
        more.
      </Text>
      <Spacer.Vertical size="medium" />

      <TouchableOpacity
        onPress={_handleSignInPress}
        style={{
          backgroundColor: theme.button.tertiary.background,
          padding: spacing[3],
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: borderRadius.medium,
        }}>
        <Text style={{ color: theme.button.tertiary.foreground }} type="InterSemiBold">
          Log In
        </Text>
      </TouchableOpacity>

      <Spacer.Vertical size="small" />

      <TouchableOpacity
        onPress={_handleSignUpPress}
        style={{
          backgroundColor: theme.button.secondary.background,
          padding: spacing[3],
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: borderRadius.medium,
        }}>
        <Text style={{ color: theme.button.secondary.foreground }} type="InterSemiBold">
          Sign Up
        </Text>
      </TouchableOpacity>

      {authenticationError && (
        <>
          <Spacer.Vertical size="small" />
          <Text type="InterRegular" color="error" size="small">
            Something went wrong when authenticating: {authenticationError}
          </Text>
        </>
      )}
    </View>
  );
}
