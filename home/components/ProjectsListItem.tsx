import { ChevronDownIcon } from '@expo/styleguide-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Row, Spacer, Text, useExpoTheme, View } from 'expo-dev-client-components';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { HomeStackRoutes } from '../navigation/Navigation.types';
import { AppIcon } from '../screens/HomeScreen/AppIcon';
import { useSDKExpired } from '../utils/useSDKExpired';

type Props = {
  imageURL?: string;
  name: string;
  subtitle?: string;
  sdkVersion?: string;
  id: string;
  first: boolean;
  last: boolean;
};

/**
 * This component is used to render a list item for the projects section on the homescreen and on
 * the projects list page for an account.
 */

export function ProjectsListItem({ imageURL, name, subtitle, sdkVersion, id, first, last }: Props) {
  const theme = useExpoTheme();
  const [isExpired, sdkVersionNumber] = useSDKExpired(sdkVersion);

  const navigation = useNavigation<StackNavigationProp<HomeStackRoutes>>();

  function onPress() {
    navigation.push('ProjectDetails', { id });
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        padding="medium"
        bg="default"
        border="default"
        roundedTop={first ? 'large' : undefined}
        roundedBottom={last ? 'large' : undefined}
        style={{
          borderBottomWidth: last ? 1 : 0,
          borderTopWidth: first ? 1 : 0,
        }}>
        <Row align="center" justify="between">
          <Row align="center" flex="1">
            <AppIcon image={imageURL} />
            <View flex="1">
              <Text
                type="InterSemiBold"
                style={styles.titleText}
                ellipsizeMode="tail"
                numberOfLines={1}>
                {name}
              </Text>
              {subtitle ? (
                <>
                  <Spacer.Vertical size="tiny" />
                  <Text
                    type="InterRegular"
                    size="small"
                    color="secondary"
                    ellipsizeMode="tail"
                    numberOfLines={1}>
                    {subtitle}
                  </Text>
                </>
              ) : null}
              {sdkVersionNumber ? (
                <>
                  <Spacer.Vertical size="tiny" />
                  <Text
                    type="InterRegular"
                    size="small"
                    color="secondary"
                    ellipsizeMode="tail"
                    numberOfLines={1}>
                    SDK {sdkVersionNumber}
                    {isExpired ? ': Not supported' : ''}
                  </Text>
                </>
              ) : null}
            </View>
          </Row>
          <ChevronDownIcon
            style={{ transform: [{ rotate: '-90deg' }] }}
            color={theme.icon.secondary}
          />
        </Row>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 15,
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontWeight: '400',
        marginTop: 1,
      },
    }),
  },
});
